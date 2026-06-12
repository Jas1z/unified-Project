# AI Assistant Integration

## LLM selected: Google Gemini (`gemini-2.5-flash`)

**Why:** Free tier on [Google AI Studio](https://aistudio.google.com/apikey), strong medical literacy, simple REST API, suitable for student projects.

**Cost:** Free tier with rate limits. No credit card required for basic usage. Monitor quota in Google AI Studio.

**Fallback:** If `GEMINI_API_KEY` is empty, a **mock provider** returns demo text so the UI keeps working.

## Setup

1. Get a free API key: https://aistudio.google.com/apikey  
   Keys may start with `AIza` (legacy) or `AQ.` (new service-account-bound format).
2. Add to `backend/.env` (not `.env.example`):
   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Restart backend (recreate after `.env` changes):
   ```bash
   docker compose up -d --force-recreate backend
   ```
   A plain `docker compose restart` does **not** reload `env_file` variables.

### Troubleshooting

| Symptom | Fix |
|--------|-----|
| Demo/mock responses | Put `GEMINI_API_KEY` in `backend/.env`, not `.env.example` |
| `AttributeError: _provider` | Rebuild backend image; ensure `ai/service.py` is mounted |
| `401` with `AQ.` key | Old/revoked key, or wrong key in container — run `--force-recreate` after editing `backend/.env` |
| `429` on `gemini-2.0-flash` | Free-tier rate limit — set `GEMINI_MODEL=gemini-2.5-flash` |
| `503` on `/ai/chat` | Check Docker logs for `Gemini API key validation failed` |

## Architecture

```
frontend/src/components/ai/AiAssistantFab.tsx   → Floating button (all main screens)
frontend/src/components/ai/AiChatPanel.tsx     → Chat modal
frontend/src/pages/AiHealthExplanation.tsx      → Full record explanation screen
frontend/src/api/ai.ts                            → API client

backend/ai/service.py                           → AIService (orchestrator)
backend/ai/providers/base.py                    → LLMProvider interface
backend/ai/providers/gemini.py                  → Google Gemini
backend/ai/providers/mock.py                    → Demo fallback
backend/routers/ai.py                           → REST endpoints
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ai/status` | Provider availability |
| POST | `/ai/chat` | General assistant chat |
| POST | `/ai/explain-record` | Plain-language record explanation |

All require JWT authentication.

## Swapping the LLM

1. Create `backend/ai/providers/your_provider.py` implementing `LLMProvider`.
2. Update `_build_provider()` in `backend/ai/service.py`.
3. Add env vars in `config.py`.

## Safeguards

- Medical disclaimer on every AI response
- Prompts forbid diagnosis and treatment recommendations
- Record access reuses existing CP-ABE + consent checks before decryption
- Rate-limit errors return HTTP 503 with retry-friendly messages

## Files modified

**Backend:** `config.py`, `main.py`, `requirements.txt`, `docker-compose.yml`, `models/ai.py`, `routers/ai.py`, `ai/*`, `.env.example`

**Frontend:** `App.tsx`, `AppShell.tsx`, `navConfig.ts`, `Header.tsx`, `index.css`, `types/index.ts`, `api/ai.ts`, `components/ai/*`, `pages/AiHealthExplanation.tsx`
