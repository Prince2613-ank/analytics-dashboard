from fastapi import Depends
from pymongo.database import Database

from app.core.database import get_database
from app.domain.services.product_service import ProductService
from app.domain.services.chart_service import ChartService
from app.domain.services.log_service import LogService
from app.infrastructure.repositories.mongo_product_repository import MongoProductRepository
from app.infrastructure.repositories.mongo_chart_repository import MongoChartRepository
from app.infrastructure.repositories.mongo_log_repository import MongoLogRepository


def get_product_service(db: Database = Depends(get_database)) -> ProductService:
    """Dependency injection for ProductService."""
    repository = MongoProductRepository(db)
    return ProductService(repository)


def get_chart_service(db: Database = Depends(get_database)) -> ChartService:
    """Dependency injection for ChartService."""
    repository = MongoChartRepository(db)
    return ChartService(repository)


def get_log_service(db: Database = Depends(get_database)) -> LogService:
    """Dependency injection for LogService."""
    repository = MongoLogRepository(db)
    return LogService(repository)
