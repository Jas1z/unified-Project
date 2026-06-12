"""Google Gemini REST provider — supports AIza… and AQ… AI Studio key formats."""

import logging

import httpx

from ai.providers.base import LLMProvider

logger = logging.getLogger("ehr_platform.ai.gemini")

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def _format_api_error(status_code: int, body: str) -> str:
    if status_code == 401 and "ACCESS_TOKEN_TYPE_UNSUPPORTED" in body:
        return (
            "Gemini rejected this API key (401). New AQ… keys must have the "
            "Generative Language API enabled on the linked GCP project. "
            "If it still fails, create a legacy AIza… key in AI Studio or rotate the key."
        )
    if status_code == 401:
        return (
            "Gemini API key is invalid or unauthorized (401). "
            "Verify GEMINI_API_KEY in backend/.env and create a key at "
            "https://aistudio.google.com/apikey"
        )
    if status_code == 404:
        return (
            f"Gemini model not found ({status_code}). "
            "Set GEMINI_MODEL to a current model such as gemini-2.5-flash in backend/.env."
        )
    if status_code == 429:
        return (
            "AI rate limit reached (often on gemini-2.0-flash free tier). "
            "Wait a minute or set GEMINI_MODEL=gemini-2.5-flash in backend/.env."
        )
    return (
        f"Gemini API error ({status_code}). "
        "Check GEMINI_API_KEY and GEMINI_MODEL in backend/.env."
    )


class GeminiProvider(LLMProvider):
    name = "gemini"

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash") -> None:
        self._api_key = api_key.strip()
        self._model = model

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        if not self._api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        url = f"{GEMINI_API_BASE}/{self._model}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self._api_key,
        }
        payload = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 2048,
            },
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)

        if response.status_code >= 400:
            body_preview = response.text[:500]
            logger.error(
                "Gemini API error status=%s model=%s body=%s",
                response.status_code,
                self._model,
                body_preview,
            )
            raise RuntimeError(
                _format_api_error(response.status_code, response.text)
            )

        data = response.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError) as exc:
            logger.error("Unexpected Gemini response structure: %s", data)
            raise RuntimeError("AI returned an empty response. Please try again.") from exc

    async def ping(self) -> None:
        """Lightweight call to verify the key works (used on startup)."""
        await self.generate(
            "Reply with exactly the word OK.",
            "Reply with exactly: OK",
        )
