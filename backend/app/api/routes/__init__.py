from fastapi import APIRouter

from app.api.routes import data, chart, logs, health

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(data.router)
api_router.include_router(chart.router)
api_router.include_router(logs.router)
