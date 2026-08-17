"""
Face recognition service.
Responsible only for comparing an embedding against candidates and returning
a match result. Contains NO attendance business logic.
"""
import logging
from typing import List, Optional, Tuple

import numpy as np

from app.utils.image_utils import compute_cosine_similarity

logger = logging.getLogger(__name__)


class FaceRecognitionService:
    """
    Compares a probe embedding against a list of candidate embeddings
    and returns the best match above the configured threshold.

    This service is responsible solely for the comparison step —
    the decision to mark attendance belongs to the Java backend.
    """

    def __init__(self, threshold: float = 0.5):
        """
        Args:
            threshold: Minimum cosine similarity to consider a match valid.
        """
        self._threshold = threshold
        logger.info("FaceRecognitionService initialized with threshold=%.2f", threshold)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def find_best_match(
        self,
        probe_embedding: List[float],
        candidates: List[dict],
    ) -> Tuple[bool, Optional[int], float]:
        """
        Find the best-matching candidate for a probe embedding.

        Args:
            probe_embedding: The embedding vector extracted from the captured image.
            candidates: List of dicts with keys 'student_id' (int) and 'embedding' (List[float]).

        Returns:
            Tuple of (matched: bool, student_id: int | None, confidence: float).
            confidence is the highest similarity score found (0.0 if no match).
        """
        if not candidates:
            logger.debug("No candidates provided for recognition")
            return False, None, 0.0

        best_student_id: Optional[int] = None
        best_similarity: float = 0.0

        for candidate in candidates:
            student_id = candidate.get("student_id")
            stored_embedding = candidate.get("embedding")

            if not stored_embedding or not student_id:
                continue

            similarity = compute_cosine_similarity(probe_embedding, stored_embedding)
            logger.debug(
                "Student %d similarity: %.4f (threshold: %.2f)",
                student_id,
                similarity,
                self._threshold,
            )

            if similarity > best_similarity:
                best_similarity = similarity
                best_student_id = student_id

        matched = best_similarity >= self._threshold
        if matched:
            logger.info(
                "Match found: student_id=%d, confidence=%.4f",
                best_student_id,
                best_similarity,
            )
        else:
            logger.info(
                "No match found. Best similarity=%.4f (threshold=%.2f)",
                best_similarity,
                self._threshold,
            )

        return matched, (best_student_id if matched else None), best_similarity
