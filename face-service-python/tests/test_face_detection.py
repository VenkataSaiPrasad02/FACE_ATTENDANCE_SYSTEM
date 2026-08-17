"""
Tests for the face detection service.
"""
import base64
import os

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.face_detection_service import FaceDetectionService

client = TestClient(app)


def _make_blank_image_b64(width: int = 200, height: int = 200) -> str:
    """Create a small blank (black) image encoded as base64."""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    _, buffer = cv2.imencode(".jpg", img)
    return base64.b64encode(buffer).decode("utf-8")


def _make_noise_image_b64(width: int = 200, height: int = 200) -> str:
    """Create a random noise image — unlikely to contain a face."""
    img = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
    _, buffer = cv2.imencode(".jpg", img)
    return base64.b64encode(buffer).decode("utf-8")


class TestFaceDetectionService:
    """Unit tests for FaceDetectionService."""

    def test_blank_image_returns_no_faces(self):
        """A completely black image should yield zero detected faces."""
        svc = FaceDetectionService()
        blank = np.zeros((200, 200, 3), dtype=np.uint8)
        faces = svc.detect_faces(blank)
        assert isinstance(faces, list)
        assert len(faces) == 0

    def test_face_below_quality_threshold(self):
        """A face with low quality score should fail the quality check."""
        from app.services.face_detection_service import DetectedFace

        svc = FaceDetectionService(min_quality_score=0.9)
        dummy_face = DetectedFace(
            bbox=(0, 0, 100, 100),
            quality_score=0.2,
            face_image=np.zeros((100, 100, 3), dtype=np.uint8),
        )
        assert not svc.is_quality_sufficient(dummy_face)

    def test_face_above_quality_threshold(self):
        """A face with high quality score should pass the quality check."""
        from app.services.face_detection_service import DetectedFace

        svc = FaceDetectionService(min_quality_score=0.3)
        dummy_face = DetectedFace(
            bbox=(0, 0, 100, 100),
            quality_score=0.85,
            face_image=np.zeros((100, 100, 3), dtype=np.uint8),
        )
        assert svc.is_quality_sufficient(dummy_face)


class TestFaceRegisterEndpoint:
    """Integration tests for POST /api/face/register."""

    def test_register_with_blank_image_returns_422(self):
        """Blank image with no face should return HTTP 422."""
        payload = {
            "student_id": 1,
            "image_base64": _make_blank_image_b64(),
        }
        response = client.post("/api/face/register", json=payload)
        assert response.status_code == 422

    def test_register_with_invalid_base64_returns_422(self):
        """Corrupt base64 string should return HTTP 422."""
        payload = {
            "student_id": 1,
            "image_base64": "this-is-not-valid-base64!!!",
        }
        response = client.post("/api/face/register", json=payload)
        assert response.status_code in (422, 400)

    def test_register_missing_student_id_returns_422(self):
        """Request missing student_id should return HTTP 422 (validation error)."""
        payload = {
            "image_base64": _make_blank_image_b64(),
        }
        response = client.post("/api/face/register", json=payload)
        assert response.status_code == 422


class TestFaceRecognizeEndpoint:
    """Integration tests for POST /api/face/recognize."""

    def test_recognize_with_blank_image_returns_422(self):
        """Blank image with no face should return HTTP 422."""
        dummy_embedding = [0.1] * 128
        payload = {
            "image_base64": _make_blank_image_b64(),
            "candidates": [
                {"student_id": 1, "embedding": dummy_embedding}
            ],
        }
        response = client.post("/api/face/recognize", json=payload)
        assert response.status_code == 422

    def test_recognize_empty_candidates_returns_422(self):
        """Request with empty candidate list should be rejected by validation."""
        payload = {
            "image_base64": _make_blank_image_b64(),
            "candidates": [],
        }
        response = client.post("/api/face/recognize", json=payload)
        assert response.status_code == 422
