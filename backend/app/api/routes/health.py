from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
def root():
    """Root endpoint."""
    return {"message": "Analytics Dashboard API"}


@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
