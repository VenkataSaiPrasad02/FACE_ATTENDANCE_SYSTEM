"""
In-memory embedding store for the Python face service.

Holds all registered embeddings as one pre-normalized float32 matrix,
kept in RAM. Populated at startup and refreshed whenever Java notifies
this service that a face was registered/updated/deleted — mirroring
the pattern EmbeddingCacheService already uses on the Java side.
"""
import logging
import threading
from typing import List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)


class EmbeddingStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._student_ids: List[int] = []
        self._matrix: Optional[np.ndarray] = None  # shape (N, 512), L2-normalized rows

    def replace_all(self, candidates: List[dict]) -> None:
        """
        candidates: [{"student_id": int, "embedding": List[float]}, ...]
        Called on startup sync and whenever Java pushes a full refresh.
        """
        with self._lock:
            if not candidates:
                self._student_ids = []
                self._matrix = None
                logger.info("Embedding store cleared (0 candidates)")
                return

            ids = [c["student_id"] for c in candidates]
            mat = np.array([c["embedding"] for c in candidates], dtype=np.float32)

            # Normalize once, here — not per comparison.
            norms = np.linalg.norm(mat, axis=1, keepdims=True)
            norms[norms == 0.0] = 1.0
            mat = mat / norms

            self._student_ids = ids
            self._matrix = mat
            logger.info("Embedding store loaded: %d candidates", len(ids))

    def size(self) -> int:
        with self._lock:
            return len(self._student_ids)

    def find_best_match(
        self, probe_embedding: List[float], threshold: float
    ) -> Tuple[bool, Optional[int], float]:
        with self._lock:
            if self._matrix is None or len(self._student_ids) == 0:
                return False, None, 0.0
            matrix = self._matrix
            ids = self._student_ids

        probe = np.asarray(probe_embedding, dtype=np.float32)
        probe_norm = np.linalg.norm(probe)
        if probe_norm == 0.0:
            return False, None, 0.0
        probe = probe / probe_norm

        sims = matrix @ probe  # vectorized cosine similarity, all N at once
        best_idx = int(np.argmax(sims))
        best_similarity = float(max(0.0, sims[best_idx]))

        matched = best_similarity >= threshold
        return matched, (ids[best_idx] if matched else None), best_similarity


# Singleton, same lifecycle pattern as the existing detection/recognition services
_embedding_store: Optional[EmbeddingStore] = None


def get_embedding_store() -> EmbeddingStore:
    global _embedding_store
    if _embedding_store is None:
        _embedding_store = EmbeddingStore()
    return _embedding_store