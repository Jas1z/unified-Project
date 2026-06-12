"""
main.py — FastAPI application entry point for the EHR Platform.

Responsibilities:
  • Instantiate the FastAPI app with lifespan (MongoDB connection)
  • Register CORS middleware
  • Mount all routers with their URL prefixes
  • Global exception handlers (404 + 500)
  • Expose /health check for Docker and load-balancer probes

Run locally (outside Docker):
    uvicorn main:app --reload --port 8000

Interactive API docs (auto-generated from code):
    http://localhost:8000/docs    ← Swagger UI
    http://localhost:8000/redoc  ← ReDoc
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import lifespan as db_lifespan
from routers import (
    ai,
    audit,
    auth,
    consents,
    crypto_demo,
    exchange,
    hospitals,
    patients,
    records,
    users,
)

logger = logging.getLogger("ehr_platform")


@asynccontextmanager
async def lifespan(app):  # noqa: ANN001
    """MongoDB connection + Gemini provider validation on startup."""
    async with db_lifespan(app):
        from ai.service import ai_service

        ai_service.reload()
        await ai_service.validate_provider()
        key = (settings.gemini_api_key or "").strip()
        if key and ai_service.provider.is_configured and not ai_service._init_error:
            ai_mode = f"Gemini ({settings.gemini_model})"
        elif key and ai_service._init_error:
            ai_mode = "Gemini key invalid — see logs"
        else:
            ai_mode = "demo/mock — set GEMINI_API_KEY in backend/.env"
        print(
            "\n"
            "┌─────────────────────────────────────────────┐\n"
            "│  EHR Platform API running                   │\n"
            "│  Docs:   http://localhost:8000/docs          │\n"
            "│  Health: http://localhost:8000/health        │\n"
            f"│  AI:     {ai_mode:<30}│\n"
            "└─────────────────────────────────────────────┘\n",
            flush=True,
        )
        yield


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.app_name,
    description=(
        "Secure Electronic Health Record platform. "
        "Features: AES-256-GCM encrypted records, ECDH inter-hospital exchange, "
        "SHA-256 audit hash chain, JWT authentication, CP-ABE access control, "
        "and role-based route guards."
    ),
    version="0.3.0",    # Block 6 — all endpoints + error handlers complete
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Middleware
# allow_origins locked to Vite dev server.
# ⚠ HARDCODE WARNING: add your production domain before deploying:
#   allow_origins=["http://localhost:5173", "https://ehr.yourhospital.com"]
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.0.2.2:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"},
    )

@app.exception_handler(500)
async def server_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled 500 error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )

# ---------------------------------------------------------------------------
# Routers — 9 router groups covering all EHR functionality
# prefix in router file + route decorator = final URL
#   e.g. router prefix "/patients" + decorator "/" = GET /patients
# ---------------------------------------------------------------------------
app.include_router(auth.router)           # /auth/login, /auth/logout
app.include_router(patients.router)       # /patients — CRUD + soundex search
app.include_router(records.router)        # /records — AES-256-GCM encrypt/decrypt
app.include_router(users.router)          # /users — admin CRUD + revoke + rotate-keys
app.include_router(consents.router)       # /consents — grant/revoke
app.include_router(audit.router)          # /audit — logs + SHA-256 chain verify
app.include_router(exchange.router)       # /exchange — inter-hospital requests
app.include_router(hospitals.router)      # /hospitals — public registry
app.include_router(crypto_demo.router)    # /crypto — encryption lab (no auth)
app.include_router(ai.router)             # /ai — assistant chat + explain-record

# ---------------------------------------------------------------------------
# Health check — no auth, used by Docker healthcheck and uptime monitors
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"], summary="Liveness probe")
async def health_check() -> dict:
    """Returns 200 when the API process is running and MongoDB is connected."""
    return {"status": "ok", "service": settings.app_name}
