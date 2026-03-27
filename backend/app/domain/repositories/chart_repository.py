from abc import ABC, abstractmethod

from app.domain.entities.chart import ChartData


class IChartRepository(ABC):
    """Abstract interface for chart repository."""
    
    @abstractmethod
    def get_chart_data(self) -> ChartData:
        """Get chart data."""
        pass
