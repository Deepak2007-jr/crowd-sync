# Testing Checklist & Verification Guide — Crowd-Sync

## 1. Automated Backend Test Suite

To run all automated unit and integration tests:
```bash
cd backend
.\venv\Scripts\python -m pytest -v app\tests
```

### Automated Test Coverage Summary
- `test_auth.py`:
  - ✅ Successful admin authentication & token generation
  - ✅ Rejection of invalid credentials (HTTP 401)
  - ✅ Student / visitor registration endpoint
- `test_crowd.py`:
  - ✅ Aggregate crowd status telemetry
  - ✅ Rejection of negative / invalid occupancy values
  - ✅ Successful admin occupancy updates
- `test_evacuation.py`:
  - ✅ Dynamic Dijkstra route computation
  - ✅ Assembly point routing
  - ✅ Rejection and fallback warning for unmapped starting nodes
- `test_hazards.py`:
  - ✅ Public hazard report submission and listing
  - ✅ Event creation venue attendance validation (preventing unsafe capacity overflows)

---

## 2. Manual End-to-End Verification Checklist

| # | Workflow / Scenario | Step-by-Step Instructions | Expected Result | Pass / Fail |
|---|---|---|---|:---:|
| 1 | **System Initialization** | Run `python scripts\seed_data.py` | Database tables created, 3 demo accounts, 6 zones, 16 nodes, 22 paths seeded cleanly | ✅ PASS |
| 2 | **1-Click Demo Login** | On `/login`, click "Safety Officer (Admin) Demo" | Authenticates immediately without typing; redirects to Command Center | ✅ PASS |
| 3 | **Interactive Map Inspection** | Navigate to `/map`, click "Grand Auditorium" | Node detail panel opens with occupancy (230/500), capacity, and crowd status | ✅ PASS |
| 4 | **Evacuation Route Engine** | Go to `/evacuation`, select "Grand Auditorium", target "Emergency Exits" | Visual animated cyan route appears on SVG map; turn-by-turn waypoints rendered | ✅ PASS |
| 5 | **Blocked Path Dynamic Rerouting** | Click "Simulate Auditorium Surge & Blocked Path" in Simulation Controls | Auditorium occupancy spikes to 96% (Critical), North Corridor is marked BLOCKED, route automatically recalculates to alternative exit (Exit C South Gate) | ✅ PASS |
| 6 | **Demo Scenario Reset** | Click "Reset Demo Scenario" | Blocked corridor unblocks, normal baseline occupancy restored, active demo alert resolved | ✅ PASS |
| 7 | **Student Hazard Reporting** | Switch to Student role, click "Report Hazard", submit "Slippery floor in Cafeteria" | Hazard appears in `/hazards` list under "Pending" status | ✅ PASS |
| 8 | **Admin Hazard Review** | In Admin Dashboard, click "Update Status" on the hazard, add resolution note | Status updates to "Under Review" or "Resolved" with timestamps | ✅ PASS |
| 9 | **Event Capacity Guardrail** | Log in as Organizer, attempt to create event with 5,000 attendance in 300-cap Library | Form validates and rejects attendance exceeding venue capacity | ✅ PASS |
| 10 | **CSV Report Export** | In Analytics page, click "Download CSV Audit Report" | Browser downloads `crowd_sync_campus_report.csv` with formatted zone audit data | ✅ PASS |
