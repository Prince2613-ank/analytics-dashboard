from typing import List, Optional
from pymongo.database import Database

from app.domain.entities.product import Product, ProductCreate, ProductUpdate
from app.domain.repositories.product_repository import IProductRepository


class MongoProductRepository(IProductRepository):
    """MongoDB Atlas implementation of product repository."""
    
    def __init__(self, db: Database):
        self.collection = db["products"]
    
    def get_all(self) -> List[Product]:
        """Get all products from MongoDB Atlas."""
        products = []
        for doc in self.collection.find({}, {"_id": 0}):
            products.append(Product(
                name=doc["name"],
                sales=doc["sales"]
            ))
        return products
    
    def get_by_id(self, product_id: int) -> Optional[Product]:
        """Get product by ID from MongoDB Atlas."""
        doc = self.collection.find_one({"id": product_id}, {"_id": 0})
        if doc:
            return Product(
                name=doc["name"],
                sales=doc["sales"]
            )
        return None
    
    def create(self, product: ProductCreate) -> Product:
        """Create a new product in MongoDB Atlas."""
        product_dict = {
            "name": product.name,
            "sales": product.sales
        }
        self.collection.insert_one(product_dict)
        return Product(**product_dict)
    
    def update(self, product_id: int, product: ProductUpdate) -> Optional[Product]:
        """Update a product in MongoDB Atlas."""
        update_data = {k: v for k, v in product.model_dump().items() if v is not None}
        if not update_data:
            return self.get_by_id(product_id)
        
        result = self.collection.update_one(
            {"id": product_id},
            {"$set": update_data}
        )
        if result.modified_count > 0 or result.matched_count > 0:
            return self.get_by_id(product_id)
        return None
    
    def delete(self, product_id: int) -> bool:
        """Delete a product from MongoDB Atlas."""
        result = self.collection.delete_one({"id": product_id})
        return result.deleted_count > 0
    
    def seed_data(self) -> int:
        """Seed initial product data."""
        # Clear existing data first
        self.collection.delete_many({})
        
        seed_products = [
            {"name": "Product A", "sales": 12000},
            {"name": "Product B", "sales": 8000},
            {"name": "Product C", "sales": 15000}
        ]
        result = self.collection.insert_many(seed_products)
        return len(result.inserted_ids)
