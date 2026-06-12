"""AIService — modular medical AI assistant (Gemini or demo fallback)."""

import json
import logging
import re

from ai.providers.base import LLMProvider
from ai.providers.gemini import GeminiProvider
from ai.providers.mock import MockProvider
from config import settings
from models.ai import (
    AiChatRequest,
    AiChatResponse,
    AiStatusResponse,
    ExplainRecordRequest,
    ExplainRecordResponse,
    RecordExplanation,
)

logger = logging.getLogger("ehr_platform.ai")

MEDICAL_DISCLAIMER = (
    "AI explanations are for informational purposes only. They do not constitute "
    "medical advice, diagnosis, or treatment recommendations. Always consult "
    "qualified healthcare professionals for clinical decisions."
)

SYSTEM_PROMPT = f"""You are CareNexus AI, a helpful assistant inside a secure healthcare records platform.

Rules:
- Explain medical information in plain, simple English.
- Never diagnose, prescribe, or recommend specific treatments.
- Encourage users to speak with their doctor for clinical decisions.
- Help users navigate the app: Dashboard, Patients, Records, Timeline, Settings, Exchange.
- Be concise, empathetic, and professional like a modern healthcare app assistant.

{MEDICAL_DISCLAIMER}
"""

EXPLAIN_SYSTEM = f"""You are a medical literacy assistant. Convert clinical record text into patient-friendly language.

Rules:
- Never diagnose or recommend treatment changes.
- Use simple English; define medical terms briefly.
- Return ONLY valid JSON with this exact structure:
{{
  "simple_summary": "2-4 sentences plain summary",
  "detailed_explanation": "longer plain-language explanation",
  "doctor_questions": ["question 1", "question 2", "question 3"],
  "follow_up_actions": ["action 1", "action 2"]
}}

{MEDICAL_DISCLAIMER}
"""


def _mask_key(key: str) -> str:
    if len(key) <= 8:
        return "***"
    return f"{key[:4]}…{key[-4:]}"


def _create_provider() -> tuple[LLMProvider, str | None]:
    """
    Build Gemini when a key exists; fall back to mock on missing key or init failure.
    Returns (provider, init_error_message).
    """
    key = (settings.gemini_api_key or "").strip()
    if not key:
        logger.info("Gemini: GEMINI_API_KEY empty — using demo/mock provider")
        return MockProvider(), None

    try:
        provider = GeminiProvider(key, settings.gemini_model)
        logger.info(
            "Gemini initialized successfully model=%s key=%s",
            settings.gemini_model,
            _mask_key(key),
        )
        return provider, None
    except Exception as exc:
        logger.exception("Gemini initialization failed: %s", exc)
        return MockProvider(), str(exc)


class AIService:
    def __init__(self) -> None:
        # Always set _provider so chat/status never hit AttributeError.
        self._provider: LLMProvider = MockProvider()
        self._init_error: str | None = None
        self.reload()

    def reload(self) -> None:
        """Re-read settings and rebuild provider (e.g. after .env change + restart)."""
        self._provider, self._init_error = _create_provider()

    async def validate_provider(self) -> None:
        """Optional startup probe — marks Gemini unavailable if the key is rejected."""
        if self._init_error or not self._provider.is_configured:
            return
        if not isinstance(self._provider, GeminiProvider):
            return
        try:
            await self._provider.ping()
            logger.info("Gemini API key validated successfully")
        except Exception as exc:
            self._init_error = str(exc)
            logger.warning("Gemini API key validation failed: %s", exc)

    @property
    def provider(self) -> LLMProvider:
        return self._provider

    def status(self) -> AiStatusResponse:
        if self._init_error:
            return AiStatusResponse(
                available=False,
                provider="mock",
                model=None,
                message=f"Gemini failed to initialize: {self._init_error}",
            )
        if self._provider.is_configured:
            return AiStatusResponse(
                available=True,
                provider=self._provider.name,
                model=settings.gemini_model,
                message="AI assistant is ready (Google Gemini).",
            )
        return AiStatusResponse(
            available=True,
            provider="mock",
            model=None,
            message=(
                "Running in demo mode. Set GEMINI_API_KEY in backend/.env, "
                "then: docker compose restart backend"
            ),
        )

    def _active_provider(self) -> LLMProvider:
        return self._provider

    async def chat(self, req: AiChatRequest) -> AiChatResponse:
        if self._init_error:
            raise RuntimeError(self._init_error)
        provider = self._active_provider()
        history_text = ""
        for msg in req.history[-8:]:
            role = "User" if msg.role == "user" else "Assistant"
            history_text += f"{role}: {msg.content}\n"

        user_prompt = (
            f"{history_text}User: {req.message}\n\n"
            "Reply helpfully about their health records or app navigation."
        )

        try:
            reply = await provider.generate(SYSTEM_PROMPT, user_prompt)
        except RuntimeError:
            raise
        except Exception as exc:
            logger.exception("AI chat failed: %s", exc)
            raise RuntimeError("AI service is temporarily unavailable. Please try again.") from exc

        return AiChatResponse(
            reply=reply,
            provider=provider.name,
            disclaimer=MEDICAL_DISCLAIMER,
        )

    async def explain_record(
        self,
        req: ExplainRecordRequest,
        record_title: str,
        record_type: str,
        record_content: str,
    ) -> ExplainRecordResponse:
        if self._init_error:
            raise RuntimeError(self._init_error)
        provider = self._active_provider()
        follow = (
            f"\n\nPatient follow-up question: {req.follow_up_question}"
            if req.follow_up_question
            else ""
        )
        user_prompt = (
            f"Record type: {record_type}\n"
            f"Record title: {record_title}\n"
            f"Clinical content:\n{record_content[:8000]}"
            f"{follow}"
        )

        try:
            raw = await provider.generate(EXPLAIN_SYSTEM, user_prompt)
        except RuntimeError:
            raise
        except Exception as exc:
            logger.exception("AI explain-record failed: %s", exc)
            raise RuntimeError("AI service is temporarily unavailable. Please try again.") from exc

        explanation = _parse_explanation(raw)
        return ExplainRecordResponse(
            record_id=req.record_id,
            record_title=record_title,
            record_type=record_type,
            explanation=explanation,
            provider=provider.name,
            raw_response=raw if not provider.is_configured else None,
        )


def _parse_explanation(raw: str) -> RecordExplanation:
    """Parse JSON from model output; fall back to structured sections from text."""
    json_match = re.search(r"\{[\s\S]*\}", raw)
    if json_match:
        try:
            data = json.loads(json_match.group())
            return RecordExplanation(
                simple_summary=data.get("simple_summary", ""),
                detailed_explanation=data.get("detailed_explanation", ""),
                doctor_questions=data.get("doctor_questions") or [],
                follow_up_actions=data.get("follow_up_actions") or [],
                disclaimer=MEDICAL_DISCLAIMER,
            )
        except json.JSONDecodeError:
            pass

    return RecordExplanation(
        simple_summary=raw[:400] if raw else "No summary available.",
        detailed_explanation=raw,
        doctor_questions=[
            "What does this result mean for my care plan?",
            "Are there lifestyle changes I should consider?",
            "When should I schedule a follow-up visit?",
        ],
        follow_up_actions=[
            "Discuss this record with your healthcare provider.",
            "Keep a list of questions for your next appointment.",
        ],
        disclaimer=MEDICAL_DISCLAIMER,
    )


ai_service = AIService()
