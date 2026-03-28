from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = "General"
    sales: int
    revenue: float
    margin: float
    region: Optional[str] = "Global"

class Product(ProductBase):
    pass

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    sales: Optional[int] = None
    revenue: Optional[float] = None
    margin: Optional[float] = None
    region: Optional[str] = None
