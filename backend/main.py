from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.core.middleware import LoggingMiddleware
from app.database.connection import connect_to_mongo, close_mongo_connection
from app.routers import chart, logs, map, table
from app.utils.object_id import success_response, error_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager to handle startup and shutdown events."""
    try:
        await connect_to_mongo()
        yield
    finally:
        await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

# Setup Global Exception Handlers
setup_exception_handlers(app)

# Add Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

# Include API Routes
app.include_router(chart.router, prefix="/api")
app.include_router(table.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(map.router, prefix="/api")

@app.get("/api/health", tags=["health"])
async def health_check():
    """Health check endpoint to evaluate database status."""
    return success_response({"status": "healthy"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
