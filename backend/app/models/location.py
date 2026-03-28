from pydantic import BaseModel
from typing import Optional

class Location(BaseModel):
    name: str
    lat: float
    lng: float
    value: Optional[float] = 0.0
