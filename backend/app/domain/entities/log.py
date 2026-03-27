from pydantic import BaseModel
from datetime import datetime
from typing import Literal


LogType = Literal["INFO", "WARNING", "ERROR", "SUCCESS"]


class ActivityLog(BaseModel):
    """Activity log entity."""
    
    id: int
    timestamp: str
    type: LogType
    message: str
