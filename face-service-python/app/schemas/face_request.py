"""
Pydantic request schemas for the Face Service API.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class FaceRegisterRequest(BaseModel):
    """Request body for face registration endpoint."""

    student_id: int = Field(..., description="Unique identifier of the student", gt=0)
    image_base64: str = Field(
        ...,
        description="Base64-encoded face image (JPEG or PNG)",
        min_length=100,
    )


class CandidateEmbedding(BaseModel):
    """A single candidate: student ID + stored embedding vector."""

    student_id: int = Field(..., description="Student ID", gt=0)
    embedding: List[float] = Field(..., description="Stored face embedding vector")


class FaceRecognizeRequest(BaseModel):
    """Request body for face recognition endpoint."""

    image_base64: str = Field(
        ...,
        description="Base64-encoded face image to recognize (JPEG or PNG)",
        min_length=100,
    )
    candidates: List[CandidateEmbedding] = Field(
        ...,
        description="List of candidate students with their stored embeddings",
        min_items=1,
    )


class FaceDetectRequest(BaseModel):
    """Request body for camera face-location detection."""

    image_base64: str = Field(
        ...,
        description="Base64-encoded camera frame",
        min_length=100,
    )
