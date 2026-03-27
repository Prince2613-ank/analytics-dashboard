from fastapi import APIRouter, Depends

from app.api.dependencies import get_log_service
from app.domain.services.log_service import LogService

router = APIRouter(tags=["logs"])


@router.get("/logs")
def get_logs(limit: int = 20, service: LogService = Depends(get_log_service)):
    """Endpoint to fetch activity logs."""
    return service.get_logs(limit)
