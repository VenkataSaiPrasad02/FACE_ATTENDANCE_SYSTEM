"""
Utility functions for image decoding and preprocessing.
"""
import base64
import logging
from typing import Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)


def decode_base64_image(image_base64: str) -> Optional[np.ndarray]:
    """
    Decode a base64-encoded image string into a NumPy BGR array.

    Args:
        image_base64: Base64-encoded image string (with or without data URI prefix).

    Returns:
        BGR NumPy array if decoding succeeds, None otherwise.
    """
    try:
        # Strip data URI prefix if present (e.g., "data:image/jpeg;base64,")
        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]

        image_bytes = base64.b64decode(image_base64)
        np_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        if image is None:
            logger.warning("cv2.imdecode returned None — invalid image data")
            return None

        return image

    except Exception as exc:
        logger.error("Failed to decode base64 image: %s", exc)
        return None


def preprocess_image(image: np.ndarray, target_size: tuple = (640, 640)) -> np.ndarray:
    """
    Resize image to target size while preserving aspect ratio with padding.

    Args:
        image: BGR NumPy array.
        target_size: (width, height) tuple.

    Returns:
        Resized and padded BGR NumPy array.
    """
    h, w = image.shape[:2]
    target_w, target_h = target_size

    scale = min(target_w / w, target_h / h)
    new_w = int(w * scale)
    new_h = int(h * scale)

    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    padded = np.zeros((target_h, target_w, 3), dtype=np.uint8)
    pad_x = (target_w - new_w) // 2
    pad_y = (target_h - new_h) // 2
    padded[pad_y : pad_y + new_h, pad_x : pad_x + new_w] = resized

    return padded


def compute_cosine_similarity(embedding_a: list, embedding_b: list) -> float:
    """
    Compute cosine similarity between two embedding vectors.

    Args:
        embedding_a: First embedding as list of floats.
        embedding_b: Second embedding as list of floats.

    Returns:
        Cosine similarity score in range [0.0, 1.0].
    """
    a = np.array(embedding_a, dtype=np.float32)
    b = np.array(embedding_b, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    similarity = float(np.dot(a, b) / (norm_a * norm_b))
    # Clamp to [0.0, 1.0] — cosine similarity can be negative for dissimilar faces
    return max(0.0, similarity)
