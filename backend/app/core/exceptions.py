from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.utils.object_id import error_response

def setup_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers for the FastAPI application."""
    
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        """Handle HTTP errors explicitly raised."""
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(str(exc.detail))
        )
        
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """Handle Pydantic validation errors explicitly."""
        errors = exc.errors()
        error_messages = [f"{err['loc'][-1]}: {err['msg']}" for err in errors if err.get('loc')]
        clean_msg = " | ".join(error_messages) if error_messages else str(exc)
        
        return JSONResponse(
            status_code=422,
            content=error_response(f"Validation Error: {clean_msg}")
        )
        
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Catch all unexpected server errors."""
        return JSONResponse(
            status_code=500,
            content=error_response("An unexpected internal server error occurred.")
        )
