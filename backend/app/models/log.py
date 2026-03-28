from pydantic import BaseModel
from typing import Literal

LogType = Literal["INFO", "WARNING", "ERROR", "SUCCESS"]
LogCategory = Literal["BUSINESS", "DEBUG", "SYSTEM"]

class ActivityLog(BaseModel):
    timestamp: str
    type: LogType
    category: LogCategory = "BUSINESS"
    action: str
    message: str
