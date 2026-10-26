# REST API Documentation — Crowd-Sync

Base URL: `http://127.0.0.1:8000/api`  
Interactive Swagger UI: `http://127.0.0.1:8000/docs`  
ReDoc UI: `http://127.0.0.1:8000/redoc`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Description**: Registers a new Student or Visitor account.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@campus.edu",
    "password": "password123",
    "role": "student"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 4,
      "name": "Jane Doe",
      "email": "jane@campus.edu",
      "role": "student"
    }
  }
  ```

### `POST /api/auth/login`
- **Description**: Authenticates user and returns JWT bearer token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@campus.edu",
    "password": "admin123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { "id": 1, "name": "Chief Officer Sarah Jenkins", "email": "admin@campus.edu", "role": "admin" }
  }
  ```

### `GET /api/auth/me`
- **Description**: Returns authenticated user profile.
- **Access**: Authenticated (`Bearer <token>`)

---

## 2. Campus Zones & Map (`/api/zones`, `/api/map`, `/api/exits`, `/api/assembly-points`)

### `GET /api/zones`
- **Description**: Returns all campus zones with capacity, occupancy, and status label.
- **Access**: Public

### `GET /api/map`
- **Description**: Returns full campus map graph including zones, nodes, paths, exits, and assembly points.
- **Access**: Public

### `PATCH /api/zones/{zone_id}/occupancy`
- **Description**: Updates estimated occupancy of a zone.
- **Access**: Admin only (`Role: admin`)
- **Request Body**: `{"estimated_occupancy": 320}`

### `PATCH /api/map/paths/{path_id}/toggle-block`
- **Description**: Toggles corridor blocked status (`is_blocked: boolean`).
- **Access**: Admin only

---

## 3. Evacuation Guidance Engine (`/api/evacuation`)

### `POST /api/evacuation/route`
- **Description**: Evaluates campus graph with dynamic Dijkstra edge penalties (distance + crowd density + risk) and returns recommended and alternative evacuation paths.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "starting_node_id": 4,
    "prefer_accessible": false,
    "target_type": "exit"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "is_safe_route_found": true,
    "recommended_route": {
      "exit_or_assembly_id": 3,
      "destination_name": "Exit C - South Athletic Gate",
      "destination_type": "exit",
      "total_cost": 220.0,
      "total_distance_meters": 220.0,
      "estimated_time_minutes": 3.1,
      "path_nodes": [
        { "node_id": 4, "node_name": "Grand Auditorium", "x": 500.0, "y": 360.0, "node_type": "building" },
        { "node_id": 8, "node_name": "Central Crossroads", "x": 500.0, "y": 480.0, "node_type": "intersection" },
        { "node_id": 13, "node_name": "Exit C - South Athletic Gate", "x": 500.0, "y": 660.0, "node_type": "exit" }
      ],
      "is_accessible": true,
      "risk_level": "Low",
      "explanation": "Route recommended with minimal crowd impedance avoiding blocked North corridors."
    },
    "alternative_routes": [],
    "disclaimer": "ACADEMIC PROTOTYPE: Simulated data only. In a real emergency, official campus emergency instructions and emergency responders take priority."
  }
  ```

---

## 4. Emergency Alerts & Hazards (`/api/alerts`, `/api/hazards`)

### `GET /api/alerts` & `POST /api/alerts`
- `GET`: List alerts (`status=Active` query parameter optional).
- `POST`: Broadcast emergency alert (`Role: admin`).

### `POST /api/alerts/{alert_id}/resolve`
- Marks alert as resolved (`Role: admin`).

### `POST /api/hazards`
- Submits hazard report (Students, Visitors, Staff).

### `PATCH /api/hazards/{report_id}`
- Updates hazard investigation status and resolution notes (`Role: admin`).

---

## 5. Analytics & CSV Export (`/api/analytics`)

### `GET /api/analytics/overview`
- Returns system KPIs: Total attendees, Monitored zones, Safety score.

### `GET /api/analytics/export`
- Generates downloadable CSV audit report containing formatted zones, alerts, and hazard records.
