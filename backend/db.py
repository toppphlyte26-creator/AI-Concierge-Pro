"""MongoDB async client (motor) for FinSight."""
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

_MONGO_URL = os.environ["MONGO_URL"]
_DB_NAME = os.environ["DB_NAME"]

client: AsyncIOMotorClient = AsyncIOMotorClient(_MONGO_URL)
db: AsyncIOMotorDatabase = client[_DB_NAME]


async def ensure_indexes() -> None:
    """Create the small set of indexes we need for FinSight."""
    await db.users.create_index("email", unique=True)
    await db.transactions.create_index([("user_id", 1), ("date", -1)])
    await db.budgets.create_index([("user_id", 1), ("category", 1), ("month", 1)])
    await db.bills.create_index([("user_id", 1), ("next_due_date", 1)])
    await db.goals.create_index([("user_id", 1)])
