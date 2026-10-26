from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.models import CampusZone, CampusPath, CrowdSnapshot, EmergencyAlert, EvacuationSimulation

def get_crowd_status_label(occupancy_pct: float) -> str:
    if occupancy_pct >= 90.0:
        return "Critical"
    elif occupancy_pct >= 75.0:
        return "High"
    elif occupancy_pct >= 50.0:
        return "Moderate"
    return "Low"

def update_zone_occupancy(db: Session, zone_id: int, new_occupancy: int) -> CampusZone:
    zone = db.query(CampusZone).filter(CampusZone.id == zone_id).first()
    if not zone:
        raise ValueError("Zone not found")
    
    if new_occupancy < 0:
        raise ValueError("Occupancy cannot be negative")
    
    zone.estimated_occupancy = new_occupancy
    
    # Record in CrowdSnapshot for trend analysis
    snapshot = CrowdSnapshot(
        zone_id=zone.id,
        estimated_occupancy=new_occupancy,
        recorded_at=datetime.now(timezone.utc),
        data_source="Simulated Demo Data (Manual Adjustment)"
    )
    db.add(snapshot)
    db.commit()
    db.refresh(zone)
    return zone

def trigger_demo_scenario(db: Session) -> dict:
    """
    Simulates:
    1. High surge in Auditorium zone (occupancy -> 480 / 500 = 96% Critical)
    2. Blockage in corridor connecting Auditorium directly to North Main (Path #7 marked blocked)
    3. New emergency alert created for overcrowding & blocked path
    """
    auditorium = db.query(CampusZone).filter(CampusZone.name.like("%Auditorium%")).first()
    if auditorium:
        auditorium.estimated_occupancy = int(auditorium.capacity * 0.96)
        db.add(CrowdSnapshot(
            zone_id=auditorium.id,
            estimated_occupancy=auditorium.estimated_occupancy,
            data_source="Simulated Demo Scenario"
        ))

    # Mark path near auditorium as blocked
    paths = db.query(CampusPath).all()
    blocked_path_id = None
    for p in paths:
        # Block corridor path 3 or 4
        if p.id in (3, 4, 7):
            p.is_blocked = True
            blocked_path_id = p.id
            break

    # Add active alert
    alert = EmergencyAlert(
        title="Simulated Overcrowding & Corridor Obstruction",
        description="Auditorium capacity exceeded 95%. North-east connector corridor is temporarily blocked due to flow restriction. Evacuation rerouting in progress.",
        severity="Critical",
        category="Overcrowding",
        zone_id=auditorium.id if auditorium else None,
        status="Active"
    )
    db.add(alert)

    # Add simulation log
    sim = EvacuationSimulation(
        name="Demo Scenario: Auditorium Surge & Blocked Corridor",
        starting_node_id=auditorium.nodes[0].id if auditorium and auditorium.nodes else 1,
        selected_exit_id=None,
        route_summary="Automated test scenario initiated. Primary corridor blocked; routes rerouting to alternative exits.",
        simulation_status="Triggered"
    )
    db.add(sim)

    db.commit()
    return {
        "status": "Scenario Active",
        "zone_affected": auditorium.name if auditorium else "Auditorium",
        "new_occupancy": auditorium.estimated_occupancy if auditorium else 480,
        "blocked_path_id": blocked_path_id,
        "alert_id": alert.id
    }

def reset_demo_scenario(db: Session) -> dict:
    """
    Resets all paths to unblocked, restores baseline occupancy, and resolves demo alerts.
    """
    # Unblock all paths
    for p in db.query(CampusPath).all():
        p.is_blocked = False

    # Reset zone occupancies to healthy baseline
    for zone in db.query(CampusZone).all():
        if "Auditorium" in zone.name:
            zone.estimated_occupancy = int(zone.capacity * 0.45)
        elif "Cafeteria" in zone.name:
            zone.estimated_occupancy = int(zone.capacity * 0.55)
        elif "Computer Science" in zone.name:
            zone.estimated_occupancy = int(zone.capacity * 0.35)
        elif "Library" in zone.name:
            zone.estimated_occupancy = int(zone.capacity * 0.25)
        elif "Sports" in zone.name:
            zone.estimated_occupancy = int(zone.capacity * 0.40)
        else:
            zone.estimated_occupancy = int(zone.capacity * 0.30)

    # Resolve active demo alerts
    for a in db.query(EmergencyAlert).filter(EmergencyAlert.status == "Active").all():
        if "Simulated" in a.title or "Demo" in a.title:
            a.status = "Resolved"
            a.resolved_at = datetime.now(timezone.utc)

    db.commit()
    return {"status": "Demo scenario reset successfully to baseline."}
