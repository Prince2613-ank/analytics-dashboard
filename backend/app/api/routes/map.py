from fastapi import APIRouter

router = APIRouter(prefix="/data", tags=["map"])

@router.get("/map")
def get_map_data():
    """Endpoint to fetch sample map data (e.g., store locations or user distribution)."""
    return {
        "locations": [
            {"name": "New York Office", "lat": 40.7128, "lng": -74.0060},
            {"name": "London Office", "lat": 51.5074, "lng": -0.1278},
            {"name": "Tokyo Branch", "lat": 35.6762, "lng": 139.6503},
            {"name": "Sydney Hub", "lat": -33.8688, "lng": 151.2093},
        ]
    }
