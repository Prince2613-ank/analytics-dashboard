from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import settings


class MongoDB:
    """MongoDB connection manager."""
    
    _client: MongoClient | None = None
    _db: Database | None = None
    
    @classmethod
    def connect(cls) -> None:
        """Establish MongoDB connection."""
        if cls._client is None:
            cls._client = MongoClient(settings.MONGO_URI)
            cls._db = cls._client[settings.MONGO_DB_NAME]
    
    @classmethod
    def disconnect(cls) -> None:
        """Close MongoDB connection."""
        if cls._client:
            cls._client.close()
            cls._client = None
            cls._db = None
    
    @classmethod
    def get_db(cls) -> Database:
        """Get database instance."""
        if cls._db is None:
            cls.connect()
        return cls._db


def get_database() -> Database:
    """Dependency for getting database instance."""
    return MongoDB.get_db()
