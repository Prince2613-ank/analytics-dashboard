from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.product import Product, ProductCreate, ProductUpdate


class IProductRepository(ABC):
    """Abstract interface for product repository."""
    
    @abstractmethod
    def get_all(self) -> List[Product]:
        """Get all products."""
        pass
    
    @abstractmethod
    def get_by_id(self, product_id: int) -> Optional[Product]:
        """Get product by ID."""
        pass
    
    @abstractmethod
    def create(self, product: ProductCreate) -> Product:
        """Create a new product."""
        pass
    
    @abstractmethod
    def update(self, product_id: int, product: ProductUpdate) -> Optional[Product]:
        """Update a product."""
        pass
    
    @abstractmethod
    def delete(self, product_id: int) -> bool:
        """Delete a product."""
        pass
