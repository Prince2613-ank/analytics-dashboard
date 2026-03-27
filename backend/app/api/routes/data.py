from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_product_service
from app.domain.entities.product import Product, ProductCreate, ProductUpdate
from app.domain.services.product_service import ProductService

router = APIRouter(prefix="/data", tags=["data"])


@router.get("/table")
def get_table_data(service: ProductService = Depends(get_product_service)):
    """Endpoint to fetch table data from MongoDB Atlas."""
    return service.get_table_data()


@router.get("/seed")
def seed_data(service: ProductService = Depends(get_product_service)):
    """Seed initial product data into MongoDB Atlas."""
    return service.seed_data()


@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int, service: ProductService = Depends(get_product_service)):
    """Get product by ID."""
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=Product)
def create_product(product: ProductCreate, service: ProductService = Depends(get_product_service)):
    """Create a new product."""
    return service.create_product(product)


@router.put("/products/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product: ProductUpdate,
    service: ProductService = Depends(get_product_service)
):
    """Update a product."""
    updated = service.update_product(product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/products/{product_id}")
def delete_product(product_id: int, service: ProductService = Depends(get_product_service)):
    """Delete a product."""
    if not service.delete_product(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
