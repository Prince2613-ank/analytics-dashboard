from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.services.product_service import ProductService
from app.routers.dependencies import get_product_service

router = APIRouter(tags=["chart"])

@router.get("/chart")
async def get_chart_data(
    product_service: ProductService = Depends(get_product_service)
) -> Dict[str, Any]:
    """Fetch structured data optimized for charting."""
    return await product_service.get_chart_data()
