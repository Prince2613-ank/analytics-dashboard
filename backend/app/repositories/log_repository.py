from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, List, Optional
from app.models.log import ActivityLog
from app.repositories.base_repository import BaseRepository

class LogRepository(BaseRepository[Dict[str, Any]]):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, "logs")
    
    async def get_paginated_logs(self, filter_query: Optional[Dict[str, Any]] = None, skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
        """Get paginated activity logs sorted by newest first."""
        return await self.get_all(
            filter_query=filter_query, 
            skip=skip, 
            limit=limit, 
            sort_field="timestamp", 
            sort_order=-1
        )
        
    async def count_logs(self, filter_query: Optional[Dict[str, Any]] = None) -> int:
        """Get total count of logs matching query."""
        return await self.count_documents(filter_query)
    
    async def insert_log(self, log: ActivityLog) -> Dict[str, Any]:
        """Insert a single log."""
        return await self.insert_one(log.model_dump())
