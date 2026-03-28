from app.repositories.log_repository import LogRepository
from app.models.log import ActivityLog
from app.utils.object_id import serialize_doc, success_response
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import math

class LogService:
    def __init__(self, repository: LogRepository):
        self.repository = repository
        
    async def get_logs(self, page: int = 1, limit: int = 20, log_type: Optional[str] = None, category: Optional[str] = None) -> Dict[str, Any]:
        """Fetch paginated system logs supporting type and category filters."""
        # Validate limit and page
        page = max(1, page)
        limit = min(max(1, limit), 100) # Max 100 logs per page
        
        # Build query dictionary
        filter_query = {}
        if log_type:
            filter_query["type"] = log_type.upper()
        if category:
            filter_query["category"] = category.upper()
            
        skip = (page - 1) * limit
        logs = await self.repository.get_paginated_logs(filter_query=filter_query, skip=skip, limit=limit)
        total = await self.repository.count_logs(filter_query=filter_query)
        
        clean_logs = serialize_doc(logs)
        data = {
            "logs": clean_logs,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": math.ceil(total / limit) if limit > 0 else 0
            }
        }
        return success_response(data)
        
    async def create_log(self, action: str, message: str, level: str = "INFO", category: str = "BUSINESS") -> None:
        """Manually log a system activity."""
        log = ActivityLog(
            timestamp=datetime.now(timezone.utc).isoformat(),
            type=level,
            category=category,
            action=action,
            message=message
        )
        await self.repository.insert_log(log)
