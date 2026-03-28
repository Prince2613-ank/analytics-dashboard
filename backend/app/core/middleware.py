import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
from app.models.log import ActivityLog

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log incoming API requests and their execution times to MongoDB."""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Determine if we should skip logging for this route
        path = request.url.path
        if path.startswith("/api/health") or path.startswith("/api/logs") or not path.startswith("/api"):
            return await call_next(request)
            
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            # Log success or application error (4xx)
            await self._log_request(
                action=f"{request.method} {path}",
                message=f"Request completed in {process_time:.2f}ms with status {response.status_code}",
                level="SUCCESS" if response.status_code < 400 else "WARNING"
            )
            
            # Optional: Add timing header
            response.headers["X-Process-Time"] = str(process_time)
            return response
            
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            # Log critical unhandled exceptions (500)
            await self._log_request(
                action=f"{request.method} {path}",
                message=f"Request failed in {process_time:.2f}ms: Unhandled Server Exception",
                level="ERROR"
            )
            raise e
            
    async def _log_request(self, action: str, message: str, level: str) -> None:
        """Insert log directly into MongoDB."""
        try:
            # We fetch the DB client directly config since middleware can't easily use FastAPI DI
            from app.database.connection import db_obj
            if not db_obj.db:
                return
                
            log = ActivityLog(
                timestamp=datetime.now().isoformat(),
                type=level,
                action=action,
                message=message
            )
            await db_obj.db["logs"].insert_one(log.model_dump())
        except Exception as e:
            print(f"Failed to write middleware log to DB: {e}")
