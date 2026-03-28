from pydantic import BaseModel
from typing import Literal

LogType = Literal["INFO", "WARNING", "ERROR", "SUCCESS"]

class ActivityLog(BaseModel):
    timestamp: str
    type: LogType
    action: str
    message: str
