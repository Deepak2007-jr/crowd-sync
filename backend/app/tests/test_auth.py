import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@campus.edu",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == "admin@campus.edu"

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "admin@campus.edu",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_register_student():
    response = client.post("/api/auth/register", json={
        "name": "Jane Doe",
        "email": "jane.doe@campus.edu",
        "password": "password123",
        "role": "student"
    })
    # Either 201 or 400 if already created in repeat runs
    assert response.status_code in [201, 400]
    if response.status_code == 201:
        data = response.json()
        assert data["user"]["role"] == "student"
        assert "access_token" in data
