import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_crowd_status():
    response = client.get("/api/crowd/status")
    assert response.status_code == 200
    data = response.json()
    assert "total_estimated_attendees" in data
    assert "total_monitored_zones" in data
    assert data["total_monitored_zones"] >= 6
    assert data["data_source"] == "Simulated Demo Data"

def test_zone_occupancy_validation():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@campus.edu",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Negative occupancy should fail validation
    res_neg = client.patch("/api/zones/1/occupancy", json={"estimated_occupancy": -50}, headers=headers)
    assert res_neg.status_code == 422 or res_neg.status_code == 400

    # Valid occupancy should succeed
    res_valid = client.patch("/api/zones/1/occupancy", json={"estimated_occupancy": 210}, headers=headers)
    assert res_valid.status_code == 200
    assert res_valid.json()["estimated_occupancy"] == 210
