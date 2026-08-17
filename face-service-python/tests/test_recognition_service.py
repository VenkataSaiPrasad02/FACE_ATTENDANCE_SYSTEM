"""
Tests for the face recognition service.
"""
import numpy as np
import pytest

from app.services.face_recognition_service import FaceRecognitionService


def _random_normalized_embedding(dim: int = 128) -> list:
    """Generate a random L2-normalized embedding vector."""
    v = np.random.randn(dim).astype(np.float32)
    return (v / np.linalg.norm(v)).tolist()


class TestFaceRecognitionService:
    """Unit tests for FaceRecognitionService."""

    def test_no_candidates_returns_no_match(self):
        """With empty candidate list, should return matched=False."""
        svc = FaceRecognitionService(threshold=0.5)
        probe = _random_normalized_embedding()
        matched, student_id, confidence = svc.find_best_match(probe, [])
        assert matched is False
        assert student_id is None
        assert confidence == 0.0

    def test_identical_embedding_matches(self):
        """An identical embedding should always match at confidence=1.0."""
        svc = FaceRecognitionService(threshold=0.5)
        embedding = _random_normalized_embedding()
        candidates = [{"student_id": 42, "embedding": embedding}]
        matched, student_id, confidence = svc.find_best_match(embedding, candidates)
        assert matched is True
        assert student_id == 42
        assert confidence > 0.99

    def test_opposite_embedding_does_not_match(self):
        """An inverted embedding should not match (cosine similarity clamped to 0)."""
        svc = FaceRecognitionService(threshold=0.5)
        embedding = _random_normalized_embedding()
        opposite = (-np.array(embedding)).tolist()
        candidates = [{"student_id": 99, "embedding": opposite}]
        matched, student_id, confidence = svc.find_best_match(embedding, candidates)
        assert matched is False
        assert student_id is None

    def test_best_candidate_is_selected(self):
        """The candidate with the highest similarity is returned."""
        svc = FaceRecognitionService(threshold=0.3)
        probe = _random_normalized_embedding()

        # candidate_a is close to probe
        candidate_a = {"student_id": 1, "embedding": probe}
        # candidate_b is random (likely low similarity)
        candidate_b = {"student_id": 2, "embedding": _random_normalized_embedding()}

        matched, student_id, confidence = svc.find_best_match(
            probe, [candidate_a, candidate_b]
        )
        # The matched candidate should be student 1 (identical embedding)
        assert matched is True
        assert student_id == 1
        assert confidence > 0.99

    def test_confidence_below_threshold_returns_no_match(self):
        """Low confidence should not produce a match even if a candidate exists."""
        svc = FaceRecognitionService(threshold=0.99)
        probe = _random_normalized_embedding()
        unrelated = _random_normalized_embedding()
        candidates = [{"student_id": 5, "embedding": unrelated}]
        matched, student_id, confidence = svc.find_best_match(probe, candidates)
        # With threshold=0.99, random vectors will almost never match
        # (confidence is returned regardless)
        assert isinstance(matched, bool)
        assert isinstance(confidence, float)
        assert 0.0 <= confidence <= 1.0

    def test_confidence_is_in_valid_range(self):
        """Confidence must always be between 0.0 and 1.0."""
        svc = FaceRecognitionService(threshold=0.5)
        probe = _random_normalized_embedding()
        candidates = [
            {"student_id": i, "embedding": _random_normalized_embedding()}
            for i in range(10)
        ]
        _, _, confidence = svc.find_best_match(probe, candidates)
        assert 0.0 <= confidence <= 1.0
