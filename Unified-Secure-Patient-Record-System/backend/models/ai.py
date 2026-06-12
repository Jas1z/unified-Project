"""Pydantic models for AI assistant endpoints."""

from typing import Literal

from pydantic import BaseModel, Field


class AiStatusResponse(BaseModel):
    available: bool
    provider: str
    model: str | None = None
    message: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"] = "user"
    content: str


class AiChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list)


class AiChatResponse(BaseModel):
    reply: str
    provider: str
    disclaimer: str


class ExplainRecordRequest(BaseModel):
    record_id: str
    follow_up_question: str | None = Field(default=None, max_length=2000)


class RecordExplanation(BaseModel):
    simple_summary: str
    detailed_explanation: str
    doctor_questions: list[str]
    follow_up_actions: list[str]
    disclaimer: str


class ExplainRecordResponse(BaseModel):
    record_id: str
    record_title: str
    record_type: str
    explanation: RecordExplanation
    provider: str
    raw_response: str | None = None
