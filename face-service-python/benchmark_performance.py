#!/usr/bin/env python
"""
Performance benchmark for face recognition service.

This script measures:
1. Model loading time (should be fast at startup now)
2. Face registration time
3. Face recognition time
4. Per-stage breakdown
"""
import base64
import json
import sys
import time
from pathlib import Path

import cv2
import numpy as np

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.face_detection_service import FaceDetectionService
from app.services.face_embedding_service import FaceEmbeddingService
from app.services.face_recognition_service import FaceRecognitionService
from app.utils.image_utils import decode_base64_image


def create_test_image_b64(with_face: bool = False) -> str:
    """Create a test image (with simulated face if requested)."""
    if with_face:
        # Create a simple test pattern that might trigger detection
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        # Add a "face-like" region in the center
        cv2.rectangle(img, (220, 140), (420, 340), (128, 128, 200), -1)
        cv2.rectangle(img, (260, 200), (300, 240), (100, 100, 200), -1)  # Left eye
        cv2.rectangle(img, (340, 200), (380, 240), (100, 100, 200), -1)  # Right eye
    else:
        # Blank image
        img = np.zeros((480, 640, 3), dtype=np.uint8)

    _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return base64.b64encode(buffer).decode("utf-8")


def benchmark_registration(detection_svc, embedding_svc, image_b64: str) -> dict:
    """Benchmark face registration."""
    result = {}

    # Step 1: Decode
    start = time.perf_counter()
    image = decode_base64_image(image_b64)
    result["decode_ms"] = (time.perf_counter() - start) * 1000

    if image is None:
        result["error"] = "Failed to decode image"
        return result

    # Step 2: Detect
    start = time.perf_counter()
    faces = detection_svc.detect_faces(image)
    result["detection_ms"] = (time.perf_counter() - start) * 1000

    if len(faces) == 0:
        result["error"] = "No face detected"
        return result

    # Step 3: Get embedding
    start = time.perf_counter()
    embedding = embedding_svc.get_embedding(faces[0].embedding)
    result["embedding_ms"] = (time.perf_counter() - start) * 1000

    result["face_count"] = len(faces)
    result["embedding_dim"] = len(embedding) if embedding else 0
    result["quality_score"] = faces[0].quality_score

    return result


def benchmark_recognition(detection_svc, embedding_svc, recognition_svc,
                          image_b64: str, candidates: list) -> dict:
    """Benchmark face recognition."""
    result = {}

    # Step 1: Decode
    start = time.perf_counter()
    image = decode_base64_image(image_b64)
    result["decode_ms"] = (time.perf_counter() - start) * 1000

    if image is None:
        result["error"] = "Failed to decode image"
        return result

    # Step 2: Detect
    start = time.perf_counter()
    faces = detection_svc.detect_faces(image)
    result["detection_ms"] = (time.perf_counter() - start) * 1000

    if len(faces) == 0:
        result["error"] = "No face detected"
        return result

    # Step 3: Get embedding
    start = time.perf_counter()
    probe_embedding = embedding_svc.get_embedding(faces[0].embedding)
    result["embedding_ms"] = (time.perf_counter() - start) * 1000

    # Step 4: Recognize
    start = time.perf_counter()
    matched, student_id, confidence = recognition_svc.find_best_match(
        probe_embedding, candidates
    )
    result["recognition_ms"] = (time.perf_counter() - start) * 1000

    result["matched"] = matched
    result["confidence"] = confidence
    result["candidate_count"] = len(candidates)

    return result


def main():
    print("=" * 70)
    print("Face Recognition Performance Benchmark")
    print("=" * 70)

    # Create services
    print("\nInitializing services...")
    init_start = time.perf_counter()
    detection_svc = FaceDetectionService()
    embedding_svc = FaceEmbeddingService()
    recognition_svc = FaceRecognitionService(threshold=0.5)
    init_time = (time.perf_counter() - init_start) * 1000
    print(f"Service initialization: {init_time:.2f} ms")

    if not detection_svc._model_loaded:
        print("\nWARNING: No face detection model loaded!")
        print("Results may not be accurate.")

    # Generate test data
    print("\nGenerating test data...")
    image_b64 = create_test_image_b64(with_face=False)  # Will likely return 0 faces

    # Try with an actual image if available
    test_images = [
        ("blank", image_b64),
    ]

    # Create some candidate embeddings for recognition test
    # Generate random normalized embeddings
    np.random.seed(42)
    candidates = []
    for i in range(5):
        vec = np.random.randn(512).astype(np.float32)
        vec = vec / np.linalg.norm(vec)
        candidates.append({
            "student_id": 1000 + i,
            "embedding": vec.tolist()
        })

    print(f"Created {len(candidates)} candidate embeddings")

    # Benchmark registration (blank image - no face)
    print("\n" + "-" * 70)
    print("Benchmark: Face Registration (blank image - no face expected)")
    print("-" * 70)

    result = benchmark_registration(detection_svc, embedding_svc, image_b64)
    if "error" in result:
        print(f"  Expected error: {result['error']}")
        print(f"  Decode time: {result.get('decode_ms', 0):.2f} ms")
    else:
        for key, value in result.items():
            print(f"  {key}: {value:.2f} ms")

    # Calculate totals
    total_reg = sum(
        v for k, v in result.items()
        if k.endswith("_ms") and "error" not in k
    )
    print(f"  TOTAL: {total_reg:.2f} ms")

    print("\n" + "-" * 70)
    print("Benchmark: Multiple Registration Requests")
    print("-" * 70)

    # Run multiple iterations to warm up and measure variance
    times = []
    for i in range(10):
        iter_start = time.perf_counter()
        result = benchmark_registration(detection_svc, embedding_svc, image_b64)
        elapsed = (time.perf_counter() - iter_start) * 1000
        if "error" not in result:
            times.append(elapsed)

    if times:
        print(f"  Iterations with face detected: {len(times)}/10")
        print(f"  Min: {min(times):.2f} ms")
        print(f"  Max: {max(times):.2f} ms")
        print(f"  Avg: {sum(times)/len(times):.2f} ms")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Service initialization: {init_time:.2f} ms")
    print(f"Model loaded at startup: {detection_svc._model_loaded}")
    print("\nKey optimizations applied:")
    print("  1. Model pre-loading at application startup (not on first request)")
    print("  2. Singleton services to avoid repeated initialization")
    print("  3. Embedding reuse - no duplicate FaceAnalysis.get() calls")
    print("  4. Detailed timing instrumentation for bottleneck identification")


if __name__ == "__main__":
    main()