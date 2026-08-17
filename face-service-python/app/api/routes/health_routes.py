"""
Health check routes.
"""
from fastapi import APIRouter

from app.schemas.face_response import HealthResponse
from app.core.config import settings

router = APIRouter(prefix="/api/face", tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns service status. Used by the Java backend to verify availability.",
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
    )
