from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import EmergencyAlert, CampusZone, User
from app.schemas.schemas import EmergencyAlertCreate, EmergencyAlertUpdate, EmergencyAlertOut
from app.core.dependencies import require_admin, get_current_user

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts"])

def format_alert_out(alert: EmergencyAlert) -> EmergencyAlertOut:
    return EmergencyAlertOut(
        id=alert.id,
        title=alert.title,
        description=alert.description,
        severity=alert.severity,
        category=alert.category,
        zone_id=alert.zone_id,
        zone_name=alert.zone.name if alert.zone else "All Campus / Multiple Zones",
        status=alert.status,
        created_by=alert.created_by,
        created_at=alert.created_at,
        resolved_at=alert.resolved_at
    )

@router.get("", response_model=List[EmergencyAlertOut])
def list_alerts(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(EmergencyAlert)
    if status:
        query = query.filter(EmergencyAlert.status == status)
    alerts = query.order_by(EmergencyAlert.created_at.desc()).all()
    return [format_alert_out(a) for a in alerts]

@router.post("", response_model=EmergencyAlertOut, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert_in: EmergencyAlertCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    if alert_in.zone_id:
        zone = db.query(CampusZone).filter(CampusZone.id == alert_in.zone_id).first()
        if not zone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")

    new_alert = EmergencyAlert(
        title=alert_in.title,
        description=alert_in.description,
        severity=alert_in.severity,
        category=alert_in.category,
        zone_id=alert_in.zone_id,
        status="Active",
        created_by=admin.id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return format_alert_out(new_alert)

@router.patch("/{alert_id}", response_model=EmergencyAlertOut)
def update_alert(
    alert_id: int,
    alert_in: EmergencyAlertUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    
    if alert_in.title is not None:
        alert.title = alert_in.title
    if alert_in.description is not None:
        alert.description = alert_in.description
    if alert_in.severity is not None:
        alert.severity = alert_in.severity
    if alert_in.category is not None:
        alert.category = alert_in.category
    if alert_in.zone_id is not None:
        alert.zone_id = alert_in.zone_id
    if alert_in.status is not None:
        alert.status = alert_in.status
        if alert_in.status == "Resolved" and not alert.resolved_at:
            alert.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(alert)
    return format_alert_out(alert)

@router.post("/{alert_id}/resolve", response_model=EmergencyAlertOut)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    
    alert.status = "Resolved"
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(alert)
    return format_alert_out(alert)
