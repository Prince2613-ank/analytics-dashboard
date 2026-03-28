from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, Optional
from app.models.product import ProductCreate, ProductUpdate
from app.repositories.base_repository import BaseRepository

class ProductRepository(BaseRepository[Dict[str, Any]]):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, "products")
    
    async def create(self, product: ProductCreate) -> Dict[str, Any]:
        """Create a new product."""
        return await self.insert_one(product.model_dump())
    
    async def update_product(self, product_id: str, product: ProductUpdate) -> Optional[Dict[str, Any]]:
        """Update an existing product."""
        update_data = {k: v for k, v in product.model_dump().items() if v is not None}
        if not update_data:
            return await self.get_by_id(product_id)
        return await self.update_one(product_id, update_data)
        
    async def delete(self, product_id: str) -> bool:
        """Delete a product by string ID."""
        return await self.delete_one(product_id)
