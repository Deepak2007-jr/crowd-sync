import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_evacuation_route_recommendation():
    # Starting from Grand Auditorium (Node 4) to exits
    response = client.post("/api/evacuation/route", json={
        "starting_node_id": 4,
        "prefer_accessible": True,
        "target_type": "exit"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_safe_route_found"] is True
    assert data["recommended_route"] is not None
    assert "ACADEMIC PROTOTYPE" in data["disclaimer"]
    assert len(data["recommended_route"]["path_nodes"]) >= 2

def test_evacuation_assembly_point():
    # Starting from Library (Node 3) to assembly point
    response = client.post("/api/evacuation/route", json={
        "starting_node_id": 3,
        "prefer_accessible": False,
        "target_type": "assembly_point"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_safe_route_found"] is True
    assert data["recommended_route"]["destination_type"] == "assembly_point"

def test_evacuation_invalid_start_node():
    response = client.post("/api/evacuation/route", json={
        "starting_node_id": 999999,
        "prefer_accessible": False,
        "target_type": "exit"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_safe_route_found"] is False
    assert "not found" in data["warning_message"]
