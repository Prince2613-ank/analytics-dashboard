from fastapi import APIRouter, Depends

from app.api.dependencies import get_chart_service
from app.domain.services.chart_service import ChartService

router = APIRouter(prefix="/data", tags=["charts"])


@router.get("/chart")
def get_chart_data(service: ChartService = Depends(get_chart_service)):
    """Endpoint to fetch chart data."""
    chart_data = service.get_chart_data()
    return chart_data.model_dump()
