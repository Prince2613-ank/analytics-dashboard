from typing import List
from datetime import datetime, timedelta
import random

from pymongo.database import Database

from app.domain.entities.log import ActivityLog
from app.domain.repositories.log_repository import ILogRepository


class MongoLogRepository(ILogRepository):
    """MongoDB implementation of log repository."""
    
    def __init__(self, db: Database):
        self.collection = db["logs"]
    
    def get_logs(self, limit: int = 20) -> List[ActivityLog]:
        """Get activity logs from MongoDB or generate mock data."""
        # Try to get stored logs first
        docs = list(self.collection.find().sort("timestamp", -1).limit(limit))
        if docs:
            return [
                ActivityLog(
                    id=doc.get("id", i + 1),
                    timestamp=doc["timestamp"],
                    type=doc["type"],
                    message=doc["message"]
                )
                for i, doc in enumerate(docs)
            ]
        
        # Fallback: generate mock logs
        return self._generate_mock_logs(limit)
    
    def _generate_mock_logs(self, count: int = 20) -> List[ActivityLog]:
        """Generate mock activity logs."""
        log_types = ["INFO", "WARNING", "ERROR", "SUCCESS"]
        messages = [
            "User dashboard accessed",
            "Layout configuration saved",
            "Panel resized",
            "Data sync completed",
            "API request processed",
            "Configuration reset",
            "New panel added",
            "Panel removed",
            "Export initiated",
        ]
        
        logs = []
        for i in range(count):
            logs.append(ActivityLog(
                id=i + 1,
                timestamp=(datetime.now() - timedelta(minutes=i * 5)).isoformat(),
                type=random.choice(log_types),
                message=random.choice(messages)
            ))
        return logs
