from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.services.product_service import ProductService
from app.routers.dependencies import get_product_service

router = APIRouter(tags=["table"])

@router.get("/table")
async def get_table_data(
    product_service: ProductService = Depends(get_product_service)
) -> Dict[str, Any]:
    """Fetch product records formatted for table consumption."""
    return await product_service.get_table_data()
