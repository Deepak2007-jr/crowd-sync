import io
import csv
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CampusZone, EmergencyAlert, HazardReport, CampusEvent, User
from app.services.crowd_simulation import get_crowd_status_label
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    zones = db.query(CampusZone).all()
    active_alerts = db.query(EmergencyAlert).filter(EmergencyAlert.status == "Active").count()
    pending_hazards = db.query(HazardReport).filter(HazardReport.status == "Pending").count()
    events_count = db.query(CampusEvent).count()

    total_capacity = sum(z.capacity for z in zones)
    total_occupancy = sum(z.estimated_occupancy for z in zones)
    overall_percentage = round((total_occupancy / float(total_capacity)) * 100.0, 1) if total_capacity > 0 else 0.0

    return {
        "total_attendees": total_occupancy,
        "total_capacity": total_capacity,
        "overall_percentage": overall_percentage,
        "monitored_zones": len(zones),
        "active_alerts": active_alerts,
        "pending_hazards": pending_hazards,
        "total_events": events_count,
        "safety_readiness_score": max(20, 100 - (active_alerts * 15 + pending_hazards * 5))
    }

@router.get("/crowd")
def get_crowd_analytics(db: Session = Depends(get_db)):
    zones = db.query(CampusZone).all()
    data = []
    for z in zones:
        pct = round((z.estimated_occupancy / float(z.capacity)) * 100.0, 1) if z.capacity > 0 else 0.0
        data.append({
            "zone_id": z.id,
            "name": z.name,
            "capacity": z.capacity,
            "occupancy": z.estimated_occupancy,
            "percentage": pct,
            "status": get_crowd_status_label(pct),
            "zone_type": z.zone_type
        })
    return {"zones": data}

@router.get("/incidents")
def get_incident_analytics(db: Session = Depends(get_db)):
    alerts = db.query(EmergencyAlert).all()
    hazards = db.query(HazardReport).all()

    alert_severity = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for a in alerts:
        if a.severity in alert_severity:
            alert_severity[a.severity] += 1

    hazard_status = {"Pending": 0, "Under Review": 0, "Resolved": 0}
    hazard_categories = {}
    for h in hazards:
        if h.status in hazard_status:
            hazard_status[h.status] += 1
        hazard_categories[h.category] = hazard_categories.get(h.category, 0) + 1

    return {
        "alert_severity": alert_severity,
        "hazard_status": hazard_status,
        "hazard_categories": hazard_categories,
        "total_alerts": len(alerts),
        "total_hazards": len(hazards)
    }

@router.get("/export")
def export_csv_report(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Generates an exportable CSV summary of campus zones, alerts, and hazard reports."""
    output = io.StringIO()
    writer = csv.writer(output)

    # 1. Header
    writer.writerow(["CROWD-SYNC CAMPUS SAFETY & EVACUATION AUDIT REPORT"])
    writer.writerow(["Data Source", "Simulated Academic Demonstration Data"])
    writer.writerow([])

    # 2. Campus Zones
    writer.writerow(["--- CAMPUS ZONES & OCCUPANCY ---"])
    writer.writerow(["Zone ID", "Zone Name", "Zone Type", "Capacity", "Estimated Occupancy", "Occupancy %", "Status"])
    zones = db.query(CampusZone).all()
    for z in zones:
        pct = round((z.estimated_occupancy / float(z.capacity)) * 100.0, 1) if z.capacity > 0 else 0.0
        writer.writerow([z.id, z.name, z.zone_type, z.capacity, z.estimated_occupancy, f"{pct}%", get_crowd_status_label(pct)])
    writer.writerow([])

    # 3. Emergency Alerts
    writer.writerow(["--- EMERGENCY ALERTS ---"])
    writer.writerow(["Alert ID", "Title", "Severity", "Category", "Zone", "Status", "Created At"])
    alerts = db.query(EmergencyAlert).all()
    for a in alerts:
        writer.writerow([a.id, a.title, a.severity, a.category, a.zone.name if a.zone else "Campus-wide", a.status, a.created_at])
    writer.writerow([])

    # 4. Hazard Reports
    writer.writerow(["--- HAZARD REPORTS ---"])
    writer.writerow(["Hazard ID", "Category", "Description", "Zone", "Status", "Resolution Notes", "Created At"])
    hazards = db.query(HazardReport).all()
    for h in hazards:
        writer.writerow([h.id, h.category, h.description, h.zone.name if h.zone else "N/A", h.status, h.resolution_notes or "", h.created_at])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=crowd_sync_campus_report.csv"}
    )
