"""AI assistant routes — chat, record explanation, status."""

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ai.record_helpers import get_decrypted_record_for_user
from ai.service import ai_service
from database import get_database
from dependencies import get_current_user
from models.ai import (
    AiChatRequest,
    AiChatResponse,
    AiStatusResponse,
    ExplainRecordRequest,
    ExplainRecordResponse,
)
from models.user import UserInDB

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.get("/status", response_model=AiStatusResponse, summary="AI service availability")
async def ai_status(_user: UserInDB = Depends(get_current_user)) -> AiStatusResponse:
    return ai_service.status()


@router.post("/chat", response_model=AiChatResponse, summary="Chat with AI assistant")
async def ai_chat(
    body: AiChatRequest,
    _user: UserInDB = Depends(get_current_user),
) -> AiChatResponse:
    try:
        return await ai_service.chat(body)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post(
    "/explain-record",
    response_model=ExplainRecordResponse,
    summary="AI plain-language explanation of a medical record",
)
async def explain_record(
    body: ExplainRecordRequest,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ExplainRecordResponse:
    record, plaintext = await get_decrypted_record_for_user(
        body.record_id, current_user, db
    )
    try:
        return await ai_service.explain_record(
            body,
            record_title=record.title,
            record_type=record.recordType.value if hasattr(record.recordType, "value") else str(record.recordType),
            record_content=plaintext,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
