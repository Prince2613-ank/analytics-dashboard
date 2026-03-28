from typing import Any, Dict, List, Optional, TypeVar, Generic
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

T = TypeVar('T')

class BaseRepository(Generic[T]):
    """Generic base class for all MongoDB repositories."""
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str) -> None:
        self.collection = db[collection_name]
        
    async def get_all(self, filter_query: Optional[Dict[str, Any]] = None, skip: int = 0, limit: int = 0, sort_field: Optional[str] = None, sort_order: int = 1) -> List[Dict[str, Any]]:
        """Fetch all documents matching a query."""
        if filter_query is None:
            filter_query = {}
            
        cursor = self.collection.find(filter_query)
        if sort_field:
            cursor = cursor.sort(sort_field, sort_order)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
            
        return await cursor.to_list(length=limit if limit > 0 else None)
        
    async def get_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single document by ObjectId string."""
        if not ObjectId.is_valid(doc_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(doc_id)})
        
    async def insert_one(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a single document."""
        result = await self.collection.insert_one(data)
        return await self.get_by_id(str(result.inserted_id))
        
    async def insert_many(self, data_list: List[Dict[str, Any]]) -> List[str]:
        """Insert multiple documents."""
        if not data_list:
            return []
        result = await self.collection.insert_many(data_list)
        return [str(id) for id in result.inserted_ids]
        
    async def count_documents(self, filter_query: Optional[Dict[str, Any]] = None) -> int:
        """Count total documents matching a query."""
        if filter_query is None:
            filter_query = {}
        return await self.collection.count_documents(filter_query)
        
    async def delete_many(self, filter_query: Dict[str, Any]) -> int:
        """Delete multiple documents."""
        result = await self.collection.delete_many(filter_query)
        return result.deleted_count
        
    async def delete_one(self, doc_id: str) -> bool:
        """Delete a single document by ID."""
        if not ObjectId.is_valid(doc_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count > 0

    async def update_one(self, doc_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a single document."""
        if not ObjectId.is_valid(doc_id):
            return None
        await self.collection.update_one({"_id": ObjectId(doc_id)}, {"$set": data})
        return await self.get_by_id(doc_id)
