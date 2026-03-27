from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.log import ActivityLog


class ILogRepository(ABC):
    """Abstract interface for log repository."""
    
    @abstractmethod
    def get_logs(self, limit: int = 20) -> List[ActivityLog]:
        """Get activity logs."""
        pass
