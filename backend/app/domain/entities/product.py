from pydantic import BaseModel
from typing import Optional


class Product(BaseModel):
    """Product entity."""
    
    name: str
    sales: int
    
    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    """Schema for creating a product."""
    
    name: str
    sales: int


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    
    name: Optional[str] = None
    sales: Optional[int] = None
