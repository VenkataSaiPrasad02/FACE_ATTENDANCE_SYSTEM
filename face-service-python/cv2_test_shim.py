"""Lightweight pure-Python cv2 shim for test environments without OpenCV.

This provides a minimal subset of the OpenCV API used by the project's tests:
- `imencode` (JPEG encoding via Pillow)
- `cvtColor`, `COLOR_BGR2GRAY` (noop for tests)
- `equalizeHist` (noop)
- `CascadeClassifier` with `detectMultiScale` returning no faces
"""
from io import BytesIO
import numpy as np
try:
    from PIL import Image
except Exception:  # pragma: no cover - Pillow may be installed via requirements
    Image = None


class _Data:
    haarcascades = ""


data = _Data()

COLOR_BGR2GRAY = 6
CASCADE_SCALE_IMAGE = 2


class CascadeClassifier:
    def __init__(self, path=None):
        self._path = path

    def empty(self):
        return False

    def detectMultiScale(self, *args, **kwargs):
        # Return no faces by default
        return []


def cvtColor(img, code):
    # Tests operate on simple arrays; return a single-channel view
    if img is None:
        return img
    # If color conversion to gray requested, average channels
    if code == COLOR_BGR2GRAY and img.ndim == 3:
        return np.mean(img, axis=2).astype(np.uint8)
    return img


def equalizeHist(img):
    return img


def imencode(ext, img):
    """Encode a NumPy image (BGR) to JPEG bytes and return (True, buffer).

    This uses Pillow to avoid OpenCV native wheels in CI/dev machines.
    """
    if Image is None:
        raise RuntimeError("Pillow is required for cv2 shim imencode")

    # Convert BGR numpy array to RGB for Pillow
    if img.ndim == 3 and img.shape[2] == 3:
        rgb = img[:, :, ::-1]
        pil = Image.fromarray(rgb)
    elif img.ndim == 2:
        pil = Image.fromarray(img)
    else:
        raise ValueError("Unsupported image shape for imencode: %s" % (img.shape,))

    bio = BytesIO()
    fmt = ext.lstrip('.') .upper()
    pil.save(bio, format=fmt)
    data = bio.getvalue()
    arr = np.frombuffer(data, dtype=np.uint8)
    return True, arr


__version__ = "shim-0.0"
