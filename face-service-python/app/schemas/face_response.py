"""
Pydantic response schemas for the Face Service API.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class FaceRegisterResponse(BaseModel):
    """Response body for a successful face registration."""

    student_id: int = Field(..., description="Student ID for which the face was registered")
    embedding: List[float] = Field(..., description="Generated face embedding vector")
    embedding_dim: int = Field(..., description="Dimensionality of the embedding vector")
    message: str = Field(default="Face registered successfully")


class FaceRecognizeResponse(BaseModel):
    """Response body for face recognition."""

    matched: bool = Field(..., description="Whether a matching student was found")
    confidence: Optional[float] = Field(
        default=None,
        description="Similarity score between 0.0 and 1.0; null when matched=false",
        ge=0.0,
        le=1.0,
    )
    student_id: Optional[int] = Field(
        default=None,
        description="Matched student ID; null when matched=false",
    )


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(default="ok")
    service: str = Field(default="Face Recognition Service")
    version: str = Field(default="1.0.0")


class ErrorResponse(BaseModel):
    """Standard error response body."""

    detail: str = Field(..., description="Human-readable error message")
    code: str = Field(..., description="Machine-readable error code")
