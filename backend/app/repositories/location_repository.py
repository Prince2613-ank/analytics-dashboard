from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any
from app.repositories.base_repository import BaseRepository

class LocationRepository(BaseRepository[Dict[str, Any]]):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, "locations")
