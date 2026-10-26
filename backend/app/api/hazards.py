from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import HazardReport, CampusZone, User
from app.schemas.schemas import HazardReportCreate, HazardReportUpdate, HazardReportOut
from app.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/hazards", tags=["Hazard Reports"])

def format_hazard_out(hazard: HazardReport) -> HazardReportOut:
    return HazardReportOut(
        id=hazard.id,
        category=hazard.category,
        description=hazard.description,
        zone_id=hazard.zone_id,
        zone_name=hazard.zone.name if hazard.zone else f"Zone #{hazard.zone_id}",
        reported_by=hazard.reported_by,
        reporter_name=hazard.reporter.name if hazard.reporter else "Anonymous / Visitor",
        status=hazard.status,
        created_at=hazard.created_at,
        resolution_notes=hazard.resolution_notes
    )

@router.get("", response_model=List[HazardReportOut])
def list_hazards(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(HazardReport)
    if status:
        query = query.filter(HazardReport.status == status)
    hazards = query.order_by(HazardReport.created_at.desc()).all()
    return [format_hazard_out(h) for h in hazards]

@router.post("", response_model=HazardReportOut, status_code=status.HTTP_201_CREATED)
def submit_hazard(
    hazard_in: HazardReportCreate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user)
):
    zone = db.query(CampusZone).filter(CampusZone.id == hazard_in.zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")

    new_report = HazardReport(
        category=hazard_in.category,
        description=hazard_in.description,
        zone_id=hazard_in.zone_id,
        reported_by=user.id if user else None,
        status="Pending",
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return format_hazard_out(new_report)

@router.patch("/{report_id}", response_model=HazardReportOut)
def update_hazard(
    report_id: int,
    hazard_in: HazardReportUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hazard report not found")
    
    if hazard_in.status is not None:
        report.status = hazard_in.status
    if hazard_in.resolution_notes is not None:
        report.resolution_notes = hazard_in.resolution_notes

    db.commit()
    db.refresh(report)
    return format_hazard_out(report)
