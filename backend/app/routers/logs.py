from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.services.log_service import LogService
from app.routers.dependencies import get_log_service

router = APIRouter(tags=["logs"])

@router.get("/logs")
async def get_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = Query(None, description="Filter by log type (e.g. INFO, ERROR, SUCCESS)"),
    log_service: LogService = Depends(get_log_service)
):
    """
    Fetch paginated system activity logs.
    Supports filtering by log type: INFO, WARNING, SUCCESS, ERROR
    """
    return await log_service.get_logs(page=page, limit=limit, log_type=type)
