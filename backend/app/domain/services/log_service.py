from typing import List

from app.domain.entities.log import ActivityLog
from app.domain.repositories.log_repository import ILogRepository


class LogService:
    """Service layer for log operations."""
    
    def __init__(self, repository: ILogRepository):
        self.repository = repository
    
    def get_logs(self, limit: int = 20) -> dict:
        """Get activity logs."""
        logs = self.repository.get_logs(limit)
        return {"logs": [log.model_dump() for log in logs]}
