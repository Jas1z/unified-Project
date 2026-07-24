"""Reset super admin and admin passwords to the demo default."""

import asyncio

from config import settings
from crypto.hashing import hash_password
from motor.motor_asyncio import AsyncIOMotorClient

DEFAULT_PASSWORD = "Password@123"
ACCOUNTS = [
    ("superadmin@ehr.in", "user-001"),
    ("admin@citygeneral.in", "user-002"),
]


async def reset() -> None:
    db = AsyncIOMotorClient(settings.mongodb_url)["ehrdb"]
    new_hash = hash_password(DEFAULT_PASSWORD)

    for email, user_id in ACCOUNTS:
        result = await db.users.update_one(
            {"email": email},
            {"$set": {"passwordHash": new_hash, "isRevoked": False}},
        )
        user = await db.users.find_one({"email": email}, {"name": 1, "email": 1})
        print(
            f"{email}: matched={result.matched_count}, "
            f"modified={result.modified_count}, user={user}"
        )
        revoked = await db.revocation_list.delete_many({"userId": user_id})
        print(f"  cleared {revoked.deleted_count} revocation entries for {user_id}")

    print(f"\nDone. Both accounts now use password: {DEFAULT_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(reset())
