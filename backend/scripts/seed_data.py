import sys
import os
from datetime import datetime, timedelta, timezone

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models.models import (
    User, CampusZone, CampusNode, CampusPath, EmergencyExit, AssemblyPoint,
    CampusEvent, EmergencyAlert, HazardReport, CrowdSnapshot
)
from app.core.security import get_password_hash

def seed_database():
    print("Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding demo users...")
        users = [
            User(
                name="Chief Officer Sarah Jenkins",
                email="admin@campus.edu",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            ),
            User(
                name="Prof. Marcus Vance (Events Chair)",
                email="organizer@campus.edu",
                hashed_password=get_password_hash("organizer123"),
                role="organizer"
            ),
            User(
                name="Alex Chen (Student Council)",
                email="student@campus.edu",
                hashed_password=get_password_hash("student123"),
                role="student"
            )
        ]
        db.add_all(users)
        db.flush()

        print("Seeding campus zones...")
        zones = [
            CampusZone(
                id=1,
                name="Main Academic Block",
                description="Central lecture halls, administrative offices, and main entrance rotunda.",
                capacity=600,
                estimated_occupancy=190,
                zone_type="academic",
                map_coordinates="300,180"
            ),
            CampusZone(
                id=2,
                name="Computer Science Block",
                description="Computer labs, high-tech research centers, and seminar galleries.",
                capacity=400,
                estimated_occupancy=140,
                zone_type="academic",
                map_coordinates="700,180"
            ),
            CampusZone(
                id=3,
                name="Campus Library",
                description="3-tier silent reading areas, archive vaults, and digital learning wings.",
                capacity=300,
                estimated_occupancy=75,
                zone_type="library",
                map_coordinates="240,400"
            ),
            CampusZone(
                id=4,
                name="Grand Auditorium",
                description="Main staging arena for college festivals, conferences, and symposia.",
                capacity=500,
                estimated_occupancy=230,
                zone_type="auditorium",
                map_coordinates="500,360"
            ),
            CampusZone(
                id=5,
                name="Student Cafeteria",
                description="Dining hall, student lounge, coffee stations, and food court.",
                capacity=350,
                estimated_occupancy=185,
                zone_type="cafeteria",
                map_coordinates="240,560"
            ),
            CampusZone(
                id=6,
                name="Sports Grounds & Arena",
                description="Outdoor athletic field, spectator stands, running track, and gym pavilion.",
                capacity=800,
                estimated_occupancy=310,
                zone_type="sports",
                map_coordinates="740,540"
            )
        ]
        db.add_all(zones)
        db.flush()

        print("Seeding campus nodes...")
        nodes = [
            # Building Nodes
            CampusNode(id=1, name="Main Academic Block", zone_id=1, node_type="building", x_coordinate=300.0, y_coordinate=180.0, accessibility_verified=True),
            CampusNode(id=2, name="CS Block", zone_id=2, node_type="building", x_coordinate=700.0, y_coordinate=180.0, accessibility_verified=True),
            CampusNode(id=3, name="Library", zone_id=3, node_type="building", x_coordinate=240.0, y_coordinate=400.0, accessibility_verified=True),
            CampusNode(id=4, name="Grand Auditorium", zone_id=4, node_type="building", x_coordinate=500.0, y_coordinate=360.0, accessibility_verified=True),
            CampusNode(id=5, name="Cafeteria", zone_id=5, node_type="building", x_coordinate=240.0, y_coordinate=560.0, accessibility_verified=True),
            CampusNode(id=6, name="Sports Grounds", zone_id=6, node_type="building", x_coordinate=740.0, y_coordinate=540.0, accessibility_verified=True),

            # Pathway Intersections
            CampusNode(id=7, name="North Plaza Junction", zone_id=1, node_type="intersection", x_coordinate=500.0, y_coordinate=180.0, accessibility_verified=True),
            CampusNode(id=8, name="Central Crossroads", zone_id=4, node_type="intersection", x_coordinate=500.0, y_coordinate=480.0, accessibility_verified=True),
            CampusNode(id=9, name="East Quadrangle", zone_id=2, node_type="intersection", x_coordinate=700.0, y_coordinate=360.0, accessibility_verified=True),
            CampusNode(id=10, name="West Promenade", zone_id=3, node_type="intersection", x_coordinate=240.0, y_coordinate=270.0, accessibility_verified=True),

            # Emergency Exits
            CampusNode(id=11, name="Exit A - North Gate", zone_id=1, node_type="exit", x_coordinate=500.0, y_coordinate=60.0, accessibility_verified=True),
            CampusNode(id=12, name="Exit B - East Perimeter Gate", zone_id=2, node_type="exit", x_coordinate=920.0, y_coordinate=180.0, accessibility_verified=True),
            CampusNode(id=13, name="Exit C - South Athletic Gate", zone_id=6, node_type="exit", x_coordinate=500.0, y_coordinate=660.0, accessibility_verified=True),
            CampusNode(id=14, name="Exit D - West Cafeteria Gate", zone_id=5, node_type="exit", x_coordinate=80.0, y_coordinate=560.0, accessibility_verified=False),

            # Assembly Points
            CampusNode(id=15, name="Assembly Point 1 (Central Oval Field)", zone_id=None, node_type="assembly_point", x_coordinate=500.0, y_coordinate=270.0, accessibility_verified=True),
            CampusNode(id=16, name="Assembly Point 2 (South Athletic Lawn)", zone_id=6, node_type="assembly_point", x_coordinate=820.0, y_coordinate=640.0, accessibility_verified=True),
        ]
        db.add_all(nodes)
        db.flush()

        print("Seeding campus paths...")
        paths = [
            # North Corridor Connections
            CampusPath(id=1, start_node_id=1, end_node_id=7, distance=80.0, estimated_time=1.1, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=2, start_node_id=7, end_node_id=2, distance=80.0, estimated_time=1.1, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=3, start_node_id=7, end_node_id=11, distance=50.0, estimated_time=0.7, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=4, start_node_id=7, end_node_id=15, distance=45.0, estimated_time=0.6, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            
            # Central Auditorium Connections
            CampusPath(id=5, start_node_id=15, end_node_id=4, distance=45.0, estimated_time=0.6, crowd_penalty=1.2, is_blocked=False, is_accessible=True),
            CampusPath(id=6, start_node_id=4, end_node_id=8, distance=60.0, estimated_time=0.8, crowd_penalty=1.2, is_blocked=False, is_accessible=True),
            CampusPath(id=7, start_node_id=4, end_node_id=9, distance=90.0, estimated_time=1.2, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=8, start_node_id=4, end_node_id=3, distance=110.0, estimated_time=1.5, crowd_penalty=1.1, is_blocked=False, is_accessible=True),

            # West Pathway
            CampusPath(id=9, start_node_id=1, end_node_id=10, distance=55.0, estimated_time=0.7, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=10, start_node_id=10, end_node_id=3, distance=65.0, estimated_time=0.9, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=11, start_node_id=3, end_node_id=5, distance=75.0, estimated_time=1.0, crowd_penalty=1.1, is_blocked=False, is_accessible=True),
            CampusPath(id=12, start_node_id=5, end_node_id=14, distance=70.0, estimated_time=0.9, crowd_penalty=1.0, is_blocked=False, is_accessible=False),  # Stairway exit

            # South Crossroads & Athletic grounds
            CampusPath(id=13, start_node_id=5, end_node_id=8, distance=120.0, estimated_time=1.6, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=14, start_node_id=8, end_node_id=13, distance=80.0, estimated_time=1.1, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=15, start_node_id=8, end_node_id=6, distance=115.0, estimated_time=1.5, crowd_penalty=1.1, is_blocked=False, is_accessible=True),
            CampusPath(id=16, start_node_id=6, end_node_id=16, distance=65.0, estimated_time=0.8, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=17, start_node_id=6, end_node_id=13, distance=100.0, estimated_time=1.3, crowd_penalty=1.0, is_blocked=False, is_accessible=True),

            # East Quadrangle & Exit B
            CampusPath(id=18, start_node_id=2, end_node_id=12, distance=90.0, estimated_time=1.2, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=19, start_node_id=2, end_node_id=9, distance=75.0, estimated_time=1.0, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=20, start_node_id=9, end_node_id=6, distance=95.0, estimated_time=1.3, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=21, start_node_id=9, end_node_id=8, distance=100.0, estimated_time=1.4, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
            CampusPath(id=22, start_node_id=3, end_node_id=8, distance=110.0, estimated_time=1.5, crowd_penalty=1.0, is_blocked=False, is_accessible=True),
        ]
        db.add_all(paths)
        db.flush()

        print("Seeding emergency exits and assembly points...")
        exits = [
            EmergencyExit(id=1, name="Exit A - North Gate", node_id=11, configured_capacity=250, is_available=True),
            EmergencyExit(id=2, name="Exit B - East Perimeter Gate", node_id=12, configured_capacity=200, is_available=True),
            EmergencyExit(id=3, name="Exit C - South Athletic Gate", node_id=13, configured_capacity=350, is_available=True),
            EmergencyExit(id=4, name="Exit D - West Cafeteria Gate", node_id=14, configured_capacity=150, is_available=True),
        ]
        db.add_all(exits)

        assembly_points = [
            AssemblyPoint(
                id=1,
                name="Assembly Point 1 - Central Oval Field",
                node_id=15,
                configured_capacity=1000,
                accessibility_information="Wheelchair accessible flat grass field with wide concrete walkways."
            ),
            AssemblyPoint(
                id=2,
                name="Assembly Point 2 - South Athletic Lawn",
                node_id=16,
                configured_capacity=1200,
                accessibility_information="Paved ramp access, wide open lawn, designated triage area."
            )
        ]
        db.add_all(assembly_points)
        db.flush()

        print("Seeding campus events...")
        events = [
            CampusEvent(
                name="National Tech Symposium 2026",
                venue_id=2,
                event_date="2026-10-28",
                start_time="09:30",
                expected_attendance=280,
                status="Scheduled"
            ),
            CampusEvent(
                name="Annual Campus Cultural Fest - Resonance",
                venue_id=4,
                event_date="2026-10-26",
                start_time="14:00",
                expected_attendance=420,
                status="Ongoing"
            ),
            CampusEvent(
                name="Inter-Collegiate Track & Field Meet",
                venue_id=6,
                event_date="2026-10-29",
                start_time="08:00",
                expected_attendance=350,
                status="Scheduled"
            )
        ]
        db.add_all(events)

        print("Seeding sample alerts & hazards...")
        alerts = [
            EmergencyAlert(
                title="Moderate Congestion Alert - Main Quad",
                description="High pedestrian volume near Central Oval connecting pathway during afternoon interval. Proceed calmly.",
                severity="Medium",
                category="Overcrowding",
                zone_id=4,
                status="Active",
                created_by=users[0].id,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=45)
            )
        ]
        db.add_all(alerts)

        hazards = [
            HazardReport(
                category="Blocked Exit",
                description="Maintenance scaffolding temporarily narrowing corridor leading to Exit D stairwell.",
                zone_id=5,
                reported_by=users[2].id,
                status="Under Review",
                created_at=datetime.now(timezone.utc) - timedelta(hours=2),
                resolution_notes="Campus safety team alerted. Clear path verification scheduled."
            ),
            HazardReport(
                category="Slippery Floor",
                description="Water spillage reported near Library West Wing ground floor water dispenser.",
                zone_id=3,
                reported_by=users[2].id,
                status="Pending",
                created_at=datetime.now(timezone.utc) - timedelta(minutes=30)
            )
        ]
        db.add_all(hazards)

        print("Seeding historical crowd trend snapshots...")
        now = datetime.now(timezone.utc)
        snapshots = []
        # Generate 6 hourly data points for each zone to power Recharts trend charts
        for hours_ago in range(6, -1, -1):
            t = now - timedelta(hours=hours_ago)
            factor = 0.6 + (0.05 * (6 - hours_ago))
            for z in zones:
                base = z.estimated_occupancy
                snapshots.append(CrowdSnapshot(
                    zone_id=z.id,
                    estimated_occupancy=max(15, int(base * factor)),
                    recorded_at=t,
                    data_source="Simulated Demo Data"
                ))
        db.add_all(snapshots)

        db.commit()
        print("Database successfully seeded with realistic campus data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
