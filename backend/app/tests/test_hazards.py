import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_hazards_list_and_create():
    # Public / user submission
    login_res = client.post("/api/auth/login", json={
        "email": "student@campus.edu",
        "password": "student123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post("/api/hazards", json={
        "category": "Overcrowding",
        "description": "Corridor entrance restricted near Cafeteria main foyer.",
        "zone_id": 5
    }, headers=headers)
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # List hazards
    list_res = client.get("/api/hazards")
    assert list_res.status_code == 200
    assert any(h["id"] == created_id for h in list_res.json())

def test_events_list_and_validation():
    # Organizer login
    login_res = client.post("/api/auth/login", json={
        "email": "organizer@campus.edu",
        "password": "organizer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Excessively large attendance beyond venue capacity limit should fail
    fail_res = client.post("/api/events", json={
        "name": "Impossible Overcrowded Fest",
        "venue_id": 3,  # Library cap 300
        "event_date": "2026-11-01",
        "start_time": "10:00",
        "expected_attendance": 20000
    }, headers=headers)
    assert fail_res.status_code == 400

    # Valid event creation
    ok_res = client.post("/api/events", json={
        "name": "Robotics Exhibition 2026",
        "venue_id": 2,  # CS Block
        "event_date": "2026-11-05",
        "start_time": "11:00",
        "expected_attendance": 150
    }, headers=headers)
    assert ok_res.status_code == 201
    assert ok_res.json()["name"] == "Robotics Exhibition 2026"
