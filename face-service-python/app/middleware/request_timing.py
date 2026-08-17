import time
import logging
from typing import Callable, Any

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.config import settings

logger = logging.getLogger(__name__)


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs detailed per-stage timing for face recognition requests.

    Provides granular timing for:
    - Image decoding
    - Face detection
    - Embedding generation
    - Recognition/comparison
    - JSON serialization
    - Total request time
    """

    # Paths that get detailed breakdown logging
    DETAILED_PATHS = {"/api/face/register", "/api/face/recognize"}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip detailed timing for non-face endpoints
        path = request.url.path
        has_timing_header = "x-timing-start" in request.headers

        # If client sends timing headers, use them for stage tracking
        if has_timing_header:
            return await self._dispatch_with_timing(request, call_next)

        # Normal request - add timing header for downstream use
        start_time = time.perf_counter()
        timing_data = {}

        response = None
        try:
            # Set timing header so routes can record stage times
            request.state.timing = timing_data
            request.state.timing_start = start_time

            response = await call_next(request)
            return response

        except Exception as exc:
            logger.error("Request failed: %s", exc)
            raise

        finally:
            total_ms = (time.perf_counter() - start_time) * 1000
            status_code = response.status_code if response else 500

            # Detailed per-stage breakdown is [PERF] instrumentation and is
            # gated the same way as everything else in app/utils/perf.py —
            # off by default, no output, no overhead beyond one flag check.
            if path in self.DETAILED_PATHS and settings.PERFORMANCE_MONITORING:
                self._log_detailed_timing(path, timing_data, total_ms, status_code)
            else:
                logger.info(
                    "%s %s -> %s (%.2f ms)",
                    request.method,
                    path,
                    status_code,
                    total_ms
                )

    async def _dispatch_with_timing(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        """Handle request with per-stage timing tracking."""
        start_time = time.perf_counter()
        timing_data = {}

        request.state.timing = timing_data
        request.state.timing_start = start_time

        response = None
        try:
            response = await call_next(request)
            return response
        finally:
            total_ms = (time.perf_counter() - start_time) * 1000
            status_code = response.status_code if response else 500
            self._log_detailed_timing(request.url.path, timing_data, total_ms, status_code)

    def _log_detailed_timing(
        self,
        path: str,
        timing_data: dict,
        total_ms: float,
        status_code: int
    ) -> None:
        """Log detailed breakdown of request processing stages."""
        # Extract stage times with defaults for missing stages
        decode_ms = timing_data.get("decode", 0)
        detection_ms = timing_data.get("detection", 0)
        embedding_ms = timing_data.get("embedding", 0)
        recognition_ms = timing_data.get("recognition", 0)
        json_ms = timing_data.get("json_serialization", 0)

        # Calculate unaccounted time (middleware overhead, validation, etc.)
        accounted = decode_ms + detection_ms + embedding_ms + recognition_ms + json_ms
        other_ms = max(0, total_ms - accounted)

        logger.info(
            "[PERF] DETAILED %s -> %s (%.2f ms total)\n"
            "   ├── decode:        %.2f ms\n"
            "   ├── detection:     %.2f ms\n"
            "   ├── embedding:     %.2f ms\n"
            "   ├── recognition:   %.2f ms\n"
            "   ├── json:          %.2f ms\n"
            "   └── other:         %.2f ms",
            path,
            status_code,
            total_ms,
            decode_ms,
            detection_ms,
            embedding_ms,
            recognition_ms,
            json_ms,
            other_ms
        )


def record_timing(request: Request, stage: str, start_time: float) -> None:
    """
    Record timing for a specific stage.

    Usage:
        start = time.perf_counter()
        # ... do work ...
        record_timing(request, "detection", start)
    """
    if hasattr(request.state, "timing") and hasattr(request.state, "timing_start"):
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        request.state.timing[stage] = elapsed_ms