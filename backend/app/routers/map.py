from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.repositories.location_repository import LocationRepository
from app.routers.dependencies import get_location_repository
from app.utils.object_id import serialize_doc, success_response

router = APIRouter(tags=["map"])

@router.get("/map")
async def get_map_data(
    location_repo: LocationRepository = Depends(get_location_repository)
) -> Dict[str, Any]:
    """Fetch geographic location data spanning across the stored offices."""
    locations = await location_repo.get_all()
    clean_locations = serialize_doc(locations)
    
    return success_response({"locations": clean_locations})
