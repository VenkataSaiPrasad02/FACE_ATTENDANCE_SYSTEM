"""
Face detection service.
Responsible only for detecting face bounding boxes and extracting
face information from an image using InsightFace.
"""

import logging
import time as time_module
from dataclasses import dataclass
from typing import List, Optional

import cv2
import numpy as np

from app.utils import perf

logger = logging.getLogger(__name__)


@dataclass
class DetectedFace:
    """
    Represents a single detected face.

    The embedding is captured during the same InsightFace call that
    performs face detection, so the embedding service does not need
    to run face detection again.
    """

    bbox: tuple
    quality_score: float
    embedding: Optional[List[float]] = None


# Global flag to track if model loading timing has been logged
_model_loading_logged = False


class FaceDetectionService:
    """
    Detects faces in images using InsightFace or OpenCV Haar Cascade
    as a fallback.

    This class is responsible for:
    - Face detection
    - Face bounding box
    - Face quality score
    - Capturing the embedding produced by InsightFace

    It does NOT perform face comparison or attendance logic.
    """

    def __init__(self, min_quality_score: float = 0.3):
        self._min_quality_score = min_quality_score

        self._insightface_app = None
        self._cascade = None
        self._model_loaded = False

        self._load_model()

    # ------------------------------------------------------------------
    # Initialization
    # ------------------------------------------------------------------

    def _load_model(self) -> None:
        """
        Attempt to load InsightFace; fall back to OpenCV Haar Cascade.
        
        Logs timing information to help identify slow model loading.
        """
        global _model_loading_logged
        
        load_start = time_module.perf_counter()
        load_error = None
        load_snap = perf.start()

        try:
            from insightface.app import FaceAnalysis

            self._insightface_app = FaceAnalysis(
                name="buffalo_s",
                providers=["CPUExecutionProvider"],
                allowed_modules=["detection", "recognition"],
            )

            self._insightface_app.prepare(
                ctx_id=-1,
                det_size=(320, 320),
            )

            self._model_loaded = True

            load_duration = (time_module.perf_counter() - load_start) * 1000
            perf.stop("Model load - InsightFace (buffalo_s) prepare()", load_snap)

            if not _model_loading_logged:
                logger.info(
                    "[PERF] Model Initialization (InsightFace buffalo_s) : %.2f ms",
                    load_duration
                )
                _model_loading_logged = True

        except Exception as exc:
            load_error = exc
            logger.warning(
                "InsightFace unavailable (%s). "
                "Falling back to OpenCV Haar Cascade.",
                exc,
            )

            self._load_opencv_cascade(load_start)

    def _load_opencv_cascade(self, overall_start: float) -> None:
        """Load OpenCV frontal face Haar Cascade as fallback detector."""

        global _model_loading_logged

        load_start = time_module.perf_counter()
        
        try:
            cascade_path = (
                cv2.data.haarcascades
                + "haarcascade_frontalface_default.xml"
            )

            self._cascade = cv2.CascadeClassifier(cascade_path)

            if self._cascade.empty():
                raise RuntimeError(
                    "Haar Cascade file not found"
                )

            self._model_loaded = True

            load_duration = (time_module.perf_counter() - load_start) * 1000
            total_duration = (time_module.perf_counter() - overall_start) * 1000
            
            if not _model_loading_logged:
                logger.info(
                    "OpenCV Haar Cascade loaded as face detector fallback in %.2f ms (total startup: %.2f ms)",
                    load_duration,
                    total_duration
                )
                _model_loading_logged = True

        except Exception as exc:
            logger.error(
                "Failed to load any face detector: %s",
                exc,
            )

            self._model_loaded = False

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def detect_faces(
        self,
        image: np.ndarray,
    ) -> List[DetectedFace]:
        """
        Detect all faces in the given BGR image.

        With InsightFace, the same model call produces:
        - bounding box
        - detection score
        - face embedding

        Args:
            image: BGR NumPy image.

        Returns:
            List of DetectedFace objects.
        """

        if not self._model_loaded:
            raise RuntimeError(
                "No face detection model is loaded"
            )

        if self._insightface_app is not None:
            return self._detect_with_insightface(image)

        return self._detect_with_cascade(image)

    # ------------------------------------------------------------------
    # InsightFace detection
    # ------------------------------------------------------------------

    def _detect_with_insightface(
        self,
        image: np.ndarray,
    ) -> List[DetectedFace]:
        """
        Detect faces using InsightFace.

        IMPORTANT:
        InsightFace's `get()` already performs the expensive model
        processing and produces the face embedding.

        We store that embedding inside DetectedFace so that another
        FaceAnalysis.get() call is not required later.
        """

        try:
            inference_snap = perf.start()

            faces = self._insightface_app.get(image)

            perf.stop("Detection - InsightFace .get() (model inference)", inference_snap)

            detected: List[DetectedFace] = []

            for face in faces:

                # ------------------------------------------------------
                # Bounding box
                # ------------------------------------------------------

                bbox = tuple(
                    face.bbox.astype(int)
                )

                x1, y1, x2, y2 = bbox

                # ------------------------------------------------------
                # Detection quality
                # ------------------------------------------------------

                quality = float(
                    face.det_score
                ) if hasattr(face, "det_score") else 0.8

                # ------------------------------------------------------
                # Crop face
                # ------------------------------------------------------

                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = max(0, x2)
                y2 = max(0, y2)

                

                # ------------------------------------------------------
                # Embedding
                # ------------------------------------------------------

                embedding = None

                if hasattr(face, "embedding") and face.embedding is not None:

                    embedding = self._normalize_embedding(
                        face.embedding
                    )

                # ------------------------------------------------------
                # Store detected face
                # ------------------------------------------------------

                detected.append(
                    DetectedFace(
                        bbox=(x1, y1, x2, y2),
                        quality_score=quality,
                        embedding=embedding,
                    )
                )

            return detected

        except Exception as exc:

            logger.error(
                "InsightFace detection failed: %s",
                exc,
                exc_info=True,
            )

            return []

    # ------------------------------------------------------------------
    # OpenCV fallback
    # ------------------------------------------------------------------

    def _detect_with_cascade(
        self,
        image: np.ndarray,
    ) -> List[DetectedFace]:
        """
        Use OpenCV Haar Cascade as fallback detector.

        The fallback does NOT produce a real face-recognition
        embedding. Embedding remains None.
        """

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        gray = cv2.equalizeHist(gray)

        rects = self._cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(60, 60),
            flags=cv2.CASCADE_SCALE_IMAGE,
        )

        detected: List[DetectedFace] = []

        if len(rects) == 0:
            return detected

        for x, y, w, h in rects:

            bbox = (
                x,
                y,
                x + w,
                y + h,
            )

            face_crop = image[
                y:y + h,
                x:x + w
            ]

            # ----------------------------------------------------------
            # Estimate quality based on face size
            # ----------------------------------------------------------

            image_area = (
                image.shape[0]
                * image.shape[1]
            )

            face_area = w * h

            quality = min(
                1.0,
                (face_area / image_area) * 10,
            )

            detected.append(
                DetectedFace(
                    bbox=bbox,
                    quality_score=quality,
                    face_image=face_crop,
                    embedding=None,
                )
            )

        return detected

    # ------------------------------------------------------------------
    # Quality
    # ------------------------------------------------------------------

    def is_quality_sufficient(
        self,
        face: DetectedFace,
    ) -> bool:
        """Return True if the face quality meets the minimum threshold."""

        return (
            face.quality_score
            >= self._min_quality_score
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _normalize_embedding(
        embedding: np.ndarray,
    ) -> List[float]:
        """
        L2-normalize an InsightFace embedding.

        InsightFace normally returns a 512-dimensional embedding.
        """

        arr = np.asarray(
            embedding,
            dtype=np.float32,
        )

        norm = np.linalg.norm(arr)

        if norm == 0.0:
            return arr.tolist()

        return (
            arr / norm
        ).tolist()