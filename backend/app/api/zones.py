from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CampusZone, User
from app.schemas.schemas import CampusZoneOut, CampusZoneOccupancyUpdate
from app.services.crowd_simulation import get_crowd_status_label, update_zone_occupancy
from app.core.dependencies import require_admin

router = APIRouter(prefix="/zones", tags=["Campus Zones"])

def format_zone_out(zone: CampusZone) -> CampusZoneOut:
    pct = round((zone.estimated_occupancy / float(zone.capacity)) * 100.0, 1) if zone.capacity > 0 else 0.0
    status_label = get_crowd_status_label(pct)
    return CampusZoneOut(
        id=zone.id,
        name=zone.name,
        description=zone.description,
        capacity=zone.capacity,
        estimated_occupancy=zone.estimated_occupancy,
        occupancy_percentage=pct,
        crowd_status=status_label,
        zone_type=zone.zone_type,
        map_coordinates=zone.map_coordinates
    )

@router.get("", response_model=List[CampusZoneOut])
def list_zones(db: Session = Depends(get_db)):
    zones = db.query(CampusZone).all()
    return [format_zone_out(z) for z in zones]

@router.get("/{zone_id}", response_model=CampusZoneOut)
def get_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(CampusZone).filter(CampusZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    return format_zone_out(zone)

@router.patch("/{zone_id}/occupancy", response_model=CampusZoneOut)
def update_occupancy(
    zone_id: int,
    payload: CampusZoneOccupancyUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    try:
        updated = update_zone_occupancy(db, zone_id, payload.estimated_occupancy)
        return format_zone_out(updated)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
