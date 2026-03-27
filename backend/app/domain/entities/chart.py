from pydantic import BaseModel
from typing import List, Optional


class Dataset(BaseModel):
    """Chart dataset entity."""
    
    label: str
    data: List[float]
    borderColor: Optional[str] = None
    backgroundColor: Optional[str] = None


class ChartData(BaseModel):
    """Chart data entity."""
    
    labels: List[str]
    datasets: List[Dataset]
