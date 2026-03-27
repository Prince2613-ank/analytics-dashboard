from pymongo.database import Database

from app.domain.entities.chart import ChartData, Dataset
from app.domain.repositories.chart_repository import IChartRepository


class MongoChartRepository(IChartRepository):
    """MongoDB Atlas implementation of chart repository."""
    
    def __init__(self, db: Database):
        self.collection = db["products"]
    
    def get_chart_data(self) -> ChartData:
        """Get chart data from MongoDB Atlas products collection."""
        data = list(self.collection.find({}, {"_id": 0}))
        
        if not data:
            # Return empty chart if no data
            return ChartData(labels=[], datasets=[])
        
        return ChartData(
            labels=[d["name"] for d in data],
            datasets=[
                Dataset(
                    label="Sales",
                    data=[d["sales"] for d in data],
                    borderColor="rgb(75, 192, 192)",
                    backgroundColor="rgba(75, 192, 192, 0.5)"
                )
            ]
        )
