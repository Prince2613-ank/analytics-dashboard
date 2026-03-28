from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.core.middleware import LoggingMiddleware
from app.database.connection import connect_to_mongo, close_mongo_connection, db_obj
from app.routers import chart, logs, map, seed, table
from app.utils.object_id import success_response, error_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    try:
        await connect_to_mongo()
        yield
    finally:
        await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

# 1. Setup Global Exception Handlers
setup_exception_handlers(app)

# 2. Add Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Note: BaseHTTPMiddleware executes outside-in. Last added is conceptually "outermost".
app.add_middleware(LoggingMiddleware)

# 3. Include API Routes
app.include_router(chart.router, prefix="/api")
app.include_router(table.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(map.router, prefix="/api")
app.include_router(seed.router, prefix="/api")

@app.get("/api/health", tags=["health"])
async def health_check():
    """Health check endpoint evaluating DB status."""
    db_status = "disconnected"
    try:
        if db_obj.client:
            await db_obj.client.admin.command('ping')
            db_status = "connected"
    except Exception as e:
        return error_response(f"Database connection failed: {str(e)}")
        
    return success_response({"status": "healthy", "db": db_status})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
