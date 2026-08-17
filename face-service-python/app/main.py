"""
Face Recognition Service — FastAPI application entry point.
This service is responsible ONLY for:
  - Face detection
  - Face embedding generation
  - Face recognition (embedding comparison)

Attendance business logic resides entirely in the Java Spring Boot backend.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import face_routes, health_routes
from app.core.config import settings
from app.middleware.request_timing import RequestTimingMiddleware


# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Model pre-loading at startup
# ---------------------------------------------------------------------------
def _preload_models() -> None:
    """
    Load face detection models synchronously at application startup.

    This ensures:
    1. Models are ready before the first request arrives
    2. First request latency is consistent with subsequent requests
    3. Any loading errors are caught early, not on first user request
    """
    import time as time_module
    from app.services.face_detection_service import FaceDetectionService
    from app.utils import perf

    logger.info("Pre-loading face detection models...")
    if settings.PERFORMANCE_MONITORING:
        logger.info("[PERF] Performance monitoring ENABLED (PERFORMANCE_MONITORING=true)")

    start = time_module.perf_counter()
    startup_snap = perf.start()

    # Force model loading by instantiating the service
    # The singleton pattern in face_routes.py will reuse this instance
    detection_svc = FaceDetectionService(
        min_quality_score=settings.MIN_FACE_QUALITY_SCORE
    )
    face_routes.set_detection_service(detection_svc)

    elapsed_ms = (time_module.perf_counter() - start) * 1000
    perf.stop("Startup - full model preload (process CPU/RSS across the whole load)", startup_snap)

    if detection_svc._model_loaded:
        logger.info("Face detection models loaded successfully (%.2f ms)", elapsed_ms)
        # Answers Phase 11 directly: this runs exactly once, here, at
        # process startup — not per-request. get_detection_service() in
        # face_routes.py reuses this same instance via a module-level
        # singleton, so no repeated loading occurs across requests.
    else:
        logger.warning("Face detection model failed to load - service may not function correctly")


# ---------------------------------------------------------------------------
# Lifespan context manager for startup/shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles:
    - Model pre-loading at startup
    - Clean shutdown logging
    """
    # Startup
    logger.info(
        "%s v%s starting on %s:%d",
        settings.APP_NAME,
        settings.APP_VERSION,
        settings.HOST,
        settings.PORT,
    )

    # Pre-load models synchronously before accepting requests
    _preload_models()

    yield

    # Shutdown
    logger.info("%s shutting down", settings.APP_NAME)


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Face Recognition microservice. Exposes endpoints for face registration "
        "and recognition. All business logic (attendance, students) is handled "
        "by the Java Spring Boot backend."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,  # Use lifespan instead of deprecated @on_event
)
app.add_middleware(RequestTimingMiddleware)

# ---------------------------------------------------------------------------
# CORS — only the Java backend should call this service in production.
# For development, allow all origins; tighten in production.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health_routes.router)
app.include_router(face_routes.router)


# ---------------------------------------------------------------------------
# Run directly with: python -m app.main (or uvicorn app.main:app)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
