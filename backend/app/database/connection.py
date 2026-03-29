from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    """MongoDB connection manager."""
    client: AsyncIOMotorClient | None = None
    db = None

db_obj = MongoDB()

async def connect_to_mongo():
    """Establish async MongoDB connection."""
    if not settings.MONGO_URI:
        raise ValueError("MongoDB URI is not provided in the environment variables.")
    db_obj.client = AsyncIOMotorClient(settings.MONGO_URI)
    db_obj.db = db_obj.client[settings.MONGO_DB_NAME]

async def close_mongo_connection():
    """Close MongoDB connection."""
    if db_obj.client:
        db_obj.client.close()

async def get_database():
    """Dependency for getting database instance."""
    return db_obj.db
