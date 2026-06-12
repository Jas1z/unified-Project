"""Demo provider when no cloud API key is set — keeps the UI functional."""

from ai.providers.base import LLMProvider

DISCLAIMER = (
    "This is a demo AI response (no cloud API key configured). "
    "Set GEMINI_API_KEY in backend/.env for real explanations."
)


class MockProvider(LLMProvider):
    name = "mock"

    @property
    def is_configured(self) -> bool:
        return False

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        lower = user_prompt.lower()
        if "record" in lower or "diagnosis" in lower or "prescription" in lower:
            return (
                "**Simple Summary**\n"
                "This record contains clinical information about your care. "
                "In plain terms, it documents what was observed or planned during a visit.\n\n"
                "**Detailed Explanation**\n"
                "Medical records use specialized terms. Your record type and title describe "
                "the category of information (for example, a lab result or prescription). "
                "Always review the full record with your care team for complete context.\n\n"
                "**Questions You May Want to Ask Your Doctor**\n"
                "• What does this result mean for my daily life?\n"
                "• Are there follow-up tests or visits needed?\n"
                "• What side effects should I watch for with any medications?\n\n"
                f"_{DISCLAIMER}_"
            )
        if "navigate" in lower or "dashboard" in lower or "how do i" in lower:
            return (
                "You can use the sidebar (or **More** menu on mobile) to open **Dashboard**, "
                "**Patients**, **Records**, **Timeline**, and **Settings**. "
                "Use the floating AI button anytime for help.\n\n"
                f"_{DISCLAIMER}_"
            )
        return (
            "I'm running in **demo mode** without a Gemini API key. "
            "I can still show the chat interface, but answers are placeholders. "
            "Add `GEMINI_API_KEY` to `backend/.env` and restart Docker for live AI.\n\n"
            "**Quick tips:** Open **Records** to view clinical data, or **AI Health Explanation** "
            "for record summaries.\n\n"
            f"_{DISCLAIMER}_"
        )
