from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CampusZone, CrowdSnapshot, User
from app.schemas.schemas import CampusZoneOccupancyUpdate, CampusZoneOut
from app.services.crowd_simulation import (
    get_crowd_status_label, update_zone_occupancy, trigger_demo_scenario, reset_demo_scenario
)
from app.api.zones import format_zone_out
from app.core.dependencies import require_admin

router = APIRouter(prefix="/crowd", tags=["Crowd Monitoring"])

@router.get("/status")
def get_crowd_status(db: Session = Depends(get_db)):
    zones = db.query(CampusZone).all()
    formatted_zones = [format_zone_out(z) for z in zones]

    total_capacity = sum(z.capacity for z in zones)
    total_occupancy = sum(z.estimated_occupancy for z in zones)
    overall_percentage = round((total_occupancy / float(total_capacity)) * 100.0, 1) if total_capacity > 0 else 0.0

    counts = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
    for fz in formatted_zones:
        counts[fz.crowd_status] = counts.get(fz.crowd_status, 0) + 1

    return {
        "data_source": "Simulated Demo Data",
        "total_estimated_attendees": total_occupancy,
        "total_campus_capacity": total_capacity,
        "overall_occupancy_percentage": overall_percentage,
        "total_monitored_zones": len(zones),
        "low_density_zones": counts["Low"],
        "moderate_density_zones": counts["Moderate"],
        "high_density_zones": counts["High"],
        "critical_density_zones": counts["Critical"],
        "zones": formatted_zones
    }

@router.get("/history")
def get_crowd_history(db: Session = Depends(get_db)):
    """Returns historical hourly trend snapshots for charting."""
    snapshots = db.query(CrowdSnapshot).order_by(CrowdSnapshot.recorded_at.desc()).limit(30).all()
    data = []
    for s in reversed(snapshots):
        data.append({
            "id": s.id,
            "zone_id": s.zone_id,
            "zone_name": s.zone.name if s.zone else f"Zone #{s.zone_id}",
            "estimated_occupancy": s.estimated_occupancy,
            "recorded_at": s.recorded_at.isoformat() if s.recorded_at else None,
            "data_source": s.data_source
        })
    return {
        "data_source": "Simulated Demo Data",
        "snapshots": data
    }

@router.patch("/zones/{zone_id}", response_model=CampusZoneOut)
def patch_zone_occupancy(
    zone_id: int,
    payload: CampusZoneOccupancyUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    try:
        updated = update_zone_occupancy(db, zone_id, payload.estimated_occupancy)
        return format_zone_out(updated)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/simulate-scenario")
def trigger_scenario(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    result = trigger_demo_scenario(db)
    return result

@router.post("/reset-scenario")
def reset_scenario(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    result = reset_demo_scenario(db)
    return result
