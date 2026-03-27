from typing import List, Optional

from app.domain.entities.product import Product, ProductCreate, ProductUpdate
from app.domain.repositories.product_repository import IProductRepository


class ProductService:
    """Service layer for product operations."""
    
    def __init__(self, repository: IProductRepository):
        self.repository = repository
    
    def get_all_products(self) -> List[Product]:
        """Get all products."""
        return self.repository.get_all()
    
    def get_product(self, product_id: int) -> Optional[Product]:
        """Get product by ID."""
        return self.repository.get_by_id(product_id)
    
    def create_product(self, product: ProductCreate) -> Product:
        """Create a new product."""
        return self.repository.create(product)
    
    def update_product(self, product_id: int, product: ProductUpdate) -> Optional[Product]:
        """Update a product."""
        return self.repository.update(product_id, product)
    
    def delete_product(self, product_id: int) -> bool:
        """Delete a product."""
        return self.repository.delete(product_id)
    
    def get_table_data(self) -> dict:
        """Get products formatted as table data."""
        products = self.get_all_products()
        return {
            "columns": ["name", "sales"],
            "rows": [p.model_dump() for p in products]
        }
    
    def seed_data(self) -> dict:
        """Seed initial product data."""
        count = self.repository.seed_data()
        return {"message": f"Inserted {count} products"}
