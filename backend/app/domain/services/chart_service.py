from app.domain.entities.chart import ChartData
from app.domain.repositories.chart_repository import IChartRepository


class ChartService:
    """Service layer for chart operations."""
    
    def __init__(self, repository: IChartRepository):
        self.repository = repository
    
    def get_chart_data(self) -> ChartData:
        """Get chart data."""
        return self.repository.get_chart_data()
