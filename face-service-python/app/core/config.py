"""
Application configuration loaded from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Centralizes all application configuration."""

    # Server
    APP_NAME: str = "Face Recognition Service"
    APP_VERSION: str = "1.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PYTHON_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Face recognition parameters
    RECOGNITION_THRESHOLD: float = float(os.getenv("RECOGNITION_THRESHOLD", "0.5"))
    MIN_FACE_QUALITY_SCORE: float = float(os.getenv("MIN_FACE_QUALITY_SCORE", "0.3"))
    MAX_EMBEDDING_DIM: int = int(os.getenv("MAX_EMBEDDING_DIM", "512"))

    # Model settings
    INSIGHTFACE_MODEL_NAME: str = os.getenv("INSIGHTFACE_MODEL_NAME", "buffalo_s")
    INSIGHTFACE_CTX_ID: int = int(os.getenv("INSIGHTFACE_CTX_ID", "-1"))  # -1 = CPU

    # Temporary performance instrumentation (see app/utils/perf.py).
    # When false (default), no [PERF] lines are printed and no extra
    # CPU/memory sampling happens — safe to leave in any environment.
    PERFORMANCE_MONITORING: bool = os.getenv("PERFORMANCE_MONITORING", "true").lower() == "true"


settings = Settings()
