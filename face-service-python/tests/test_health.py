"""
Tests for the health check endpoint.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_200():
    """Health endpoint must return HTTP 200."""
    response = client.get("/api/face/health")
    assert response.status_code == 200


def test_health_returns_ok_status():
    """Health endpoint must return JSON with status='ok'."""
    response = client.get("/api/face/health")
    data = response.json()
    assert data["status"] == "ok"


def test_health_returns_service_name():
    """Health endpoint must include the service name."""
    response = client.get("/api/face/health")
    data = response.json()
    assert "service" in data
    assert len(data["service"]) > 0


def test_health_returns_version():
    """Health endpoint must include a version string."""
    response = client.get("/api/face/health")
    data = response.json()
    assert "version" in data
