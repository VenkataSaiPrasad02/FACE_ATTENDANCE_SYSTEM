"""
Face registration and recognition routes.
"""

import base64
import logging
import time as time_module

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.config import settings
from app.middleware.request_timing import record_timing
from app.schemas.face_request import (
    FaceRegisterRequest,
    FaceRecognizeRequest,
    FaceDetectRequest,
)
from app.schemas.face_response import (
    FaceRegisterResponse,
    FaceRecognizeResponse,
)
from app.services.face_detection_service import FaceDetectionService
from app.services.face_embedding_service import FaceEmbeddingService
from app.services.face_recognition_service import FaceRecognitionService
from app.utils.image_utils import decode_base64_image
from app.utils import perf


logger = logging.getLogger(__name__)


def settings_perf_enabled() -> bool:
    return settings.PERFORMANCE_MONITORING


def _log_base64_sizes(image_base64: str) -> None:
    """
    Measures the actual Base64 payload received against this specific
    request's data — not an assumed/fixed percentage.
    """
    if not image_base64:
        return
    b64_payload = image_base64.split(",", 1)[1] if "," in image_base64 else image_base64
    b64_chars = len(b64_payload)
    try:
        decode_t0 = time_module.perf_counter()
        raw_bytes = base64.b64decode(b64_payload)
        b64_decode_ms = (time_module.perf_counter() - decode_t0) * 1000
    except Exception:
        perf.log_info("Base64 payload could not be decoded for size measurement")
        return
    original_kb = len(raw_bytes) / 1024.0
    b64_kb = b64_chars / 1024.0
    overhead_pct = ((b64_chars - len(raw_bytes)) / len(raw_bytes) * 100.0) if raw_bytes else 0.0
    perf.log_info(
        "Base64 sizing (measured, this request): original=%.1f KB | base64=%.1f KB | "
        "overhead=+%.1f%% | raw b64.b64decode() time=%.2f ms",
        original_kb, b64_kb, overhead_pct, b64_decode_ms,
    )


router = APIRouter(
    prefix="/api/face",
    tags=["face"],
)


# ---------------------------------------------------------------------------
# Dependency injection — singletons created once
# ---------------------------------------------------------------------------

_detection_service: FaceDetectionService | None = None


def set_detection_service(service: FaceDetectionService) -> None:
    global _detection_service
    _detection_service = service


_embedding_service: FaceEmbeddingService | None = None
_recognition_service: FaceRecognitionService | None = None

def get_detection_service() -> FaceDetectionService:
    global _detection_service

    if _detection_service is None:
        _detection_service = FaceDetectionService(
            min_quality_score=settings.MIN_FACE_QUALITY_SCORE
        )

    return _detection_service


def get_embedding_service() -> FaceEmbeddingService:
    global _embedding_service

    if _embedding_service is None:
        _embedding_service = FaceEmbeddingService()

    return _embedding_service


def get_recognition_service() -> FaceRecognitionService:
    global _recognition_service

    if _recognition_service is None:
        _recognition_service = FaceRecognitionService(
            threshold=settings.RECOGNITION_THRESHOLD
        )

    return _recognition_service


# ---------------------------------------------------------------------------
# Face Registration
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=FaceRegisterResponse,
    status_code=status.HTTP_200_OK,
    summary="Register a face",
    description=(
        "Detect the face in the provided image, use the embedding "
        "generated during detection, and return it. "
        "The Java backend is responsible for persisting the embedding."
    ),
)
async def register_face(
    request_data: FaceRegisterRequest,
    request: Request,
    detection_svc: FaceDetectionService = Depends(
        get_detection_service
    ),
    embedding_svc: FaceEmbeddingService = Depends(
        get_embedding_service
    ),
) -> FaceRegisterResponse:

    logger.info(
        "Face registration request for student_id=%d",
        request_data.student_id,
    )

    request_total_snap = perf.start()

    # ------------------------------------------------------------------
    # Base64 size measurement (Step 0) — measured on the ACTUAL payload
    # received, not assumed. "Original image" here means the raw
    # (compressed, e.g. JPEG/PNG) bytes the client encoded — i.e. what
    # base64.b64decode() yields — as opposed to the raw decoded pixel
    # array OpenCV produces afterward, which is logged separately below.
    # ------------------------------------------------------------------

    if settings_perf_enabled():
        _log_base64_sizes(request_data.image_base64)

    # ------------------------------------------------------------------
    # Step 1: Decode image
    # ------------------------------------------------------------------

    decode_start = time_module.perf_counter()
    decode_snap = perf.start()
    image = decode_base64_image(request_data.image_base64)
    perf.stop("Register - image decode (base64 -> numpy BGR array)", decode_snap)
    record_timing(request, "decode", decode_start)

    if image is not None:
        perf.log_info("Decoded pixel array size : %s (%.1f KB raw, uncompressed)",
                       image.shape, image.nbytes / 1024.0)

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid image data. "
                "Could not decode the provided base64 image."
            ),
        )

    # ------------------------------------------------------------------
    # Step 2: Detect face
    #
    # InsightFace performs detection AND generates the embedding
    # during this operation.
    # ------------------------------------------------------------------

    detection_start = time_module.perf_counter()
    detection_snap = perf.start()
    faces = detection_svc.detect_faces(image)
    perf.stop("Register - face detection (InsightFace, incl. embedding extraction)", detection_snap)
    record_timing(request, "detection", detection_start)

    if len(faces) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "No face detected in the image. "
                "Please provide a clear front-facing photo."
            ),
        )

    if len(faces) > 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Multiple faces detected ({len(faces)}). "
                "Please provide an image with exactly one face."
            ),
        )

    face = faces[0]

    # ------------------------------------------------------------------
    # Step 3: Check face quality
    # ------------------------------------------------------------------

    if not detection_svc.is_quality_sufficient(face):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Face quality score {face.quality_score:.2f} "
                f"is below the minimum threshold "
                f"{settings.MIN_FACE_QUALITY_SCORE:.2f}. "
                "Please use a better-lit, front-facing image."
            ),
        )

    # ------------------------------------------------------------------
    # Step 4: Get embedding already generated by InsightFace
    #
    # IMPORTANT:
    # Do NOT call generate_embedding(image) here.
    # That would run InsightFace again.
    #
    # [PERF] Note: this stage does NOT re-run the model — it's expected
    # to be near-zero cost. Timed anyway to prove that on your hardware,
    # not just assume it from the code comment.
    # ------------------------------------------------------------------

    embedding_start = time_module.perf_counter()
    embedding_snap = perf.start()
    embedding = embedding_svc.get_embedding(face.embedding)
    perf.stop("Register - embedding retrieval (reused from detection, no re-inference)", embedding_snap)
    record_timing(request, "embedding", embedding_start)

    if embedding is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Failed to generate face embedding. "
                "Please try again with a clearer image."
            ),
        )

    # ------------------------------------------------------------------
    # Step 5: Return embedding to Java backend
    # ------------------------------------------------------------------

    logger.info(
        "Face registered for student_id=%d, embedding_dim=%d",
        request_data.student_id,
        len(embedding),
    )
    perf.log_info(
        "Embedding (Python side): dims=%d | representation=Python list[float] "
        "(becomes a JSON array over the wire to Java)",
        len(embedding),
    )

    perf.stop("Register - TOTAL (Python side: decode -> detect -> embed)", request_total_snap)

    return FaceRegisterResponse(
        student_id=request_data.student_id,
        embedding=embedding,
        embedding_dim=len(embedding),
        message="Face registered successfully",
    )


# ---------------------------------------------------------------------------
# Lightweight camera face detection
# ---------------------------------------------------------------------------

@router.post(
    "/detect",
    status_code=status.HTTP_200_OK,
    summary="Detect a face for camera auto-capture",
    description=(
        "Detects a single face and returns its bounding box. "
        "This endpoint is used only by the camera auto-capture flow; "
        "it does not perform embedding comparison or mark attendance."
    ),
)
async def detect_face(
    request_data: FaceDetectRequest,
    request: Request,
    detection_svc: FaceDetectionService = Depends(
        get_detection_service
    ),
):
    """
    Detect exactly one usable face and return its location.

    The frontend calls this at a low, throttled rate rather than sending
    every camera frame to the recognition endpoint.
    """

    image = decode_base64_image(request_data.image_base64)

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid image data.",
        )

    image_height, image_width = image.shape[:2]

    faces = detection_svc.detect_faces(image)

    if len(faces) == 0:
        return {
            "faceDetected": False,
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0,
            "qualityScore": 0.0,
            "imageWidth": image_width,
            "imageHeight": image_height,
            "message": "No face detected.",
        }

    if len(faces) > 1:
        return {
            "faceDetected": False,
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0,
            "qualityScore": 0.0,
            "imageWidth": image_width,
            "imageHeight": image_height,
            "message": "Multiple faces detected. Please present one face.",
        }

    face = faces[0]
    x1, y1, x2, y2 = face.bbox

    x1 = max(0, min(int(x1), image_width - 1))
    y1 = max(0, min(int(y1), image_height - 1))
    x2 = max(x1 + 1, min(int(x2), image_width))
    y2 = max(y1 + 1, min(int(y2), image_height))

    width = x2 - x1
    height = y2 - y1

    if not detection_svc.is_quality_sufficient(face):
        return {
            "faceDetected": False,
            "x": x1,
            "y": y1,
            "width": width,
            "height": height,
            "qualityScore": round(float(face.quality_score), 4),
            "imageWidth": image_width,
            "imageHeight": image_height,
            "message": "Face detected but image quality is too low.",
        }

    return {
        "faceDetected": True,
        "x": x1,
        "y": y1,
        "width": width,
        "height": height,
        "qualityScore": round(float(face.quality_score), 4),
        "imageWidth": image_width,
        "imageHeight": image_height,
        "message": "Face detected.",
    }


# ---------------------------------------------------------------------------
# Face Recognition
# ---------------------------------------------------------------------------

@router.post(
    "/recognize",
    response_model=FaceRecognizeResponse,
    status_code=status.HTTP_200_OK,
    summary="Recognize a face",
    description=(
        "Detect the probe face, reuse the embedding generated during "
        "detection, and compare it against the provided candidate "
        "embeddings. Attendance business logic is handled entirely "
        "by the Java backend."
    ),
)
async def recognize_face(
    request_data: FaceRecognizeRequest,
    request: Request,
    detection_svc: FaceDetectionService = Depends(
        get_detection_service
    ),
    embedding_svc: FaceEmbeddingService = Depends(
        get_embedding_service
    ),
    recognition_svc: FaceRecognitionService = Depends(
        get_recognition_service
    ),
) -> FaceRecognizeResponse:

    logger.info(
        "Face recognition request against %d candidates",
        len(request_data.candidates),
    )

    request_total_snap = perf.start()

    if settings_perf_enabled():
        _log_base64_sizes(request_data.image_base64)
    perf.log_info("Candidates received in this request : %d", len(request_data.candidates))

    # ------------------------------------------------------------------
    # Step 1: Decode image
    # ------------------------------------------------------------------

    decode_start = time_module.perf_counter()
    decode_snap = perf.start()
    image = decode_base64_image(request_data.image_base64)
    perf.stop("Recognize - image decode (base64 -> numpy BGR array)", decode_snap)
    record_timing(request, "decode", decode_start)

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid image data. "
                "Could not decode the provided base64 image."
            ),
        )

    # ------------------------------------------------------------------
    # Step 2: Detect face
    #
    # This also generates the embedding.
    #
    # [PERF] Note: no separate "resize/preprocessing" stage exists in
    # this pipeline right now — app/utils/image_utils.py defines
    # preprocess_image() but it is never called; InsightFace does its
    # own internal resizing to det_size=(320, 320) inside .get(). That
    # cost is included in this "detection" measurement, not separable
    # from it without changing the pipeline.
    # ------------------------------------------------------------------

    detection_start = time_module.perf_counter()
    detection_snap = perf.start()
    faces = detection_svc.detect_faces(image)
    perf.stop("Recognize - face detection (InsightFace, incl. embedding extraction)", detection_snap)
    record_timing(request, "detection", detection_start)

    if len(faces) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No face detected in the image.",
        )

    if len(faces) > 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Multiple faces detected ({len(faces)}). "
                "Recognition requires exactly one face."
            ),
        )

    face = faces[0]

    # ------------------------------------------------------------------
    # Step 3: Get embedding generated during detection
    # ------------------------------------------------------------------

    embedding_start = time_module.perf_counter()
    embedding_snap = perf.start()
    probe_embedding = embedding_svc.get_embedding(face.embedding)
    perf.stop("Recognize - embedding retrieval (reused from detection, no re-inference)", embedding_snap)
    record_timing(request, "embedding", embedding_start)

    if probe_embedding is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Failed to generate embedding "
                "from probe image."
            ),
        )

    # ------------------------------------------------------------------
    # Step 4: Convert candidates to dictionaries
    # ------------------------------------------------------------------

    candidates = [
        {
            "student_id": candidate.student_id,
            "embedding": candidate.embedding,
        }
        for candidate in request_data.candidates
    ]

    # ------------------------------------------------------------------
    # Step 5: Find best match
    #
    # [PERF] This is the O(N) brute-force comparison flagged in the
    # audit — cosine similarity against every candidate, linearly. Timed
    # here so its actual cost (not an assumption) is visible as your
    # student count grows.
    # ------------------------------------------------------------------

    recognition_start = time_module.perf_counter()
    recognition_snap = perf.start()
    matched, student_id, confidence = (
        recognition_svc.find_best_match(
            probe_embedding,
            candidates,
        )
    )
    perf.stop(f"Recognize - embedding comparison ({len(candidates)} candidates, brute-force cosine)", recognition_snap)
    record_timing(request, "recognition", recognition_start)

    perf.stop("Recognize - TOTAL (Python side: decode -> detect -> embed -> compare)", request_total_snap)

    # ------------------------------------------------------------------
    # Step 6: Return recognition result
    # ------------------------------------------------------------------

    return FaceRecognizeResponse(
        matched=matched,
        confidence=round(confidence, 6),
        student_id=student_id,
    )