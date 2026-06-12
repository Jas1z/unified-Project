"""Abstract LLM provider — swap implementations without changing AIService callers."""

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    name: str = "base"

    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Return model text for a system + user prompt pair."""

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """True when a real cloud/local model is available."""
