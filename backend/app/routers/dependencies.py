from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Depends
from app.database.connection import get_database

from app.repositories.product_repository import ProductRepository
from app.repositories.log_repository import LogRepository
from app.repositories.location_repository import LocationRepository

from app.services.product_service import ProductService
from app.services.log_service import LogService

def get_product_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> ProductService:
    return ProductService(ProductRepository(db))

def get_log_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> LogService:
    return LogService(LogRepository(db))

def get_location_repository(db: AsyncIOMotorDatabase = Depends(get_database)) -> LocationRepository:
    return LocationRepository(db)
