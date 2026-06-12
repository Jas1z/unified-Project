"""Fetch and decrypt records for AI — reuses records router access rules."""

import base64
from datetime import datetime, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from config import settings
from crypto.aes import decrypt as aes_decrypt
from crypto.aes import derive_key_from_password
from database import RECORDS
from models.record import EHRRecordInDB
from models.user import UserInDB
from routers.records import _STATIC_SALT, can_access

_STATIC_KEY = derive_key_from_password(settings.demo_encryption_password, _STATIC_SALT)


def _decrypt_record_content(record: EHRRecordInDB) -> str:
    ct_and_tag = base64.b64decode(record.encryptedContent)
    ct_b64 = base64.b64encode(ct_and_tag[:-16]).decode("utf-8")
    tag_b64 = base64.b64encode(ct_and_tag[-16:]).decode("utf-8")
    return aes_decrypt(ct_b64, record.iv, tag_b64, _STATIC_KEY)


async def get_decrypted_record_for_user(
    record_id: str,
    user: UserInDB,
    db: AsyncIOMotorDatabase,
) -> tuple[EHRRecordInDB, str]:
    doc = await db[RECORDS].find_one({"id": record_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Record not found")

    doc.pop("_id", None)
    record = EHRRecordInDB(**doc)

    is_owner = False
    if user.role == "patient":
        patient_doc = await db["patients"].find_one(
            {"$or": [{"email": user.email}, {"name": user.name}]}
        )
        if patient_doc and patient_doc["id"] == record.patientId:
            is_owner = True

    is_creator = user.id == record.createdBy
    has_consent = False

    if not is_owner and not is_creator:
        now_str = datetime.now(timezone.utc).isoformat()
        consent_query = {
            "patientId": record.patientId,
            "isRevoked": False,
            "grantedTo": {"$in": [user.id, user.hospitalId]},
            "validFrom": {"$lte": now_str},
            "validUntil": {"$gte": now_str},
            "permissions": "read",
        }
        if await db["consents"].find_one(consent_query):
            has_consent = True

    has_attributes = can_access(user.attributes, record.accessPolicy)
    can_view = is_owner or is_creator or (has_attributes and has_consent)

    if not can_view:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this record for AI analysis.",
        )

    try:
        plaintext = _decrypt_record_content(record)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not decrypt record content for AI analysis.",
        ) from exc

    return record, plaintext
