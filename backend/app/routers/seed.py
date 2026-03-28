from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.services.seed_service import SeedService
from app.routers.dependencies import get_seed_service
from app.utils.object_id import success_response

router = APIRouter(tags=["seed"])

@router.post("/seed")
async def seed_data(
    seed_service: SeedService = Depends(get_seed_service)
) -> Dict[str, Any]:
    """Manually invoke a destructive system seed resetting all data."""
    result = await seed_service.seed_all()
    # Let the LoggingMiddleware capture this action inherently.
    return success_response(result, message="Database seeded successfully")
