from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.services.log_service import LogService
from app.routers.dependencies import get_log_service
from app.models.log import ActivityLog
from datetime import datetime, timezone

router = APIRouter(tags=["logs"])

@router.get("/logs")
async def get_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = Query(None, description="Filter by log type (e.g. INFO, ERROR, SUCCESS)"),
    category: Optional[str] = Query(None, description="Filter by log category (BUSINESS, DEBUG, SYSTEM)"),
    log_service: LogService = Depends(get_log_service)
):
    """
    Supports filtering by log type: INFO, WARNING, SUCCESS, ERROR
    and category: BUSINESS, DEBUG, SYSTEM
    """
    return await log_service.get_logs(page=page, limit=limit, log_type=type, category=category)

@router.post("/logs")
async def create_log(
    log_data: dict,
    log_service: LogService = Depends(get_log_service)
):
    """
    Create a custom system activity log from the frontend.
    Expected payload: { "type": "INFO", "action": "...", "message": "..." }
    """
    await log_service.create_log(
        action=log_data.get("action", "unknown"),
        message=log_data.get("message", ""),
        level=log_data.get("type", "INFO"),
        category="BUSINESS"
    )
    return {"success": True}
