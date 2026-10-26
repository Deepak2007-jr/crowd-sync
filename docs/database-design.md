# Database Design — Crowd-Sync

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o{ EmergencyAlert : "broadcasts"
    User ||--o{ HazardReport : "submits"
    CampusZone ||--o{ CampusNode : "contains"
    CampusZone ||--o{ CampusEvent : "hosts"
    CampusZone ||--o{ EmergencyAlert : "affects"
    CampusZone ||--o{ HazardReport : "locates"
    CampusZone ||--o{ CrowdSnapshot : "records"
    CampusNode ||--o{ CampusPath : "starts_at"
    CampusNode ||--o{ CampusPath : "ends_at"
    CampusNode ||--o| EmergencyExit : "designates"
    CampusNode ||--o| AssemblyPoint : "designates"
    CampusNode ||--o{ EvacuationSimulation : "starts_at"

    User {
        int id PK
        string name
        string email UK
        string hashed_password
        string role
        datetime created_at
    }

    CampusZone {
        int id PK
        string name UK
        text description
        int capacity
        int estimated_occupancy
        string zone_type
        string map_coordinates
    }

    CampusNode {
        int id PK
        string name
        int zone_id FK
        string node_type
        float x_coordinate
        float y_coordinate
        boolean accessibility_verified
    }

    CampusPath {
        int id PK
        int start_node_id FK
        int end_node_id FK
        float distance
        float estimated_time
        float crowd_penalty
        boolean is_blocked
        boolean is_accessible
    }

    EmergencyExit {
        int id PK
        string name
        int node_id FK,UK
        int configured_capacity
        boolean is_available
    }

    AssemblyPoint {
        int id PK
        string name
        int node_id FK,UK
        int configured_capacity
        string accessibility_information
    }

    CampusEvent {
        int id PK
        string name
        int venue_id FK
        string event_date
        string start_time
        int expected_attendance
        string status
    }

    EmergencyAlert {
        int id PK
        string title
        text description
        string severity
        string category
        int zone_id FK
        string status
        int created_by FK
        datetime created_at
        datetime resolved_at
    }

    HazardReport {
        int id PK
        string category
        text description
        int zone_id FK
        int reported_by FK
        string status
        datetime created_at
        text resolution_notes
    }

    CrowdSnapshot {
        int id PK
        int zone_id FK
        int estimated_occupancy
        datetime recorded_at
        string data_source
    }

    EvacuationSimulation {
        int id PK
        string name
        int starting_node_id FK
        int selected_exit_id
        text route_summary
        string simulation_status
        datetime created_at
    }
```

## 2. Table Specifications and Constraints

| Table Name | Description | Key Indexes & Constraints |
|---|---|---|
| `users` | Accounts for students, organizers, and admins | `email` (UNIQUE), `id` (PK) |
| `campus_zones` | Major campus sectors with capacities | `name` (UNIQUE), `capacity >= 0` |
| `campus_nodes` | Vertices in the campus routing graph | `id` (PK), `zone_id` (FK to `campus_zones.id`) |
| `campus_paths` | Bidirectional edges connecting nodes | `start_node_id` & `end_node_id` (FKs to `campus_nodes.id`) |
| `emergency_exits` | Registered campus perimeter exits | `node_id` (UNIQUE, FK to `campus_nodes.id`) |
| `assembly_points` | Safe muster fields and lawn areas | `node_id` (UNIQUE, FK to `campus_nodes.id`) |
| `campus_events` | Scheduled gatherings with venue associations | `venue_id` (FK to `campus_zones.id`) |
| `emergency_alerts` | Live emergency broadcast notices | `zone_id` (FK to `campus_zones.id`), `created_by` (FK) |
| `hazard_reports` | Field incident reports from users | `zone_id` (FK to `campus_zones.id`), `reported_by` (FK) |
| `crowd_snapshots` | Historical telemetry records for analytics | `zone_id` (FK to `campus_zones.id`), `recorded_at` (Index) |
| `evacuation_simulations`| Audit log of computed evacuation routes | `starting_node_id` (FK to `campus_nodes.id`) |
