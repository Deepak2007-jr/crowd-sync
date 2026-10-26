from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CampusZone, CampusNode, CampusPath, EmergencyExit, AssemblyPoint, User
from app.schemas.schemas import (
    CampusMapOut, CampusNodeOut, CampusPathOut, EmergencyExitOut, AssemblyPointOut
)
from app.api.zones import format_zone_out
from app.core.dependencies import require_admin

router = APIRouter(tags=["Campus Map"])

@router.get("/map", response_model=CampusMapOut)
def get_campus_map(db: Session = Depends(get_db)):
    zones = db.query(CampusZone).all()
    nodes = db.query(CampusNode).all()
    paths = db.query(CampusPath).all()
    exits = db.query(EmergencyExit).all()
    assembly_points = db.query(AssemblyPoint).all()

    return CampusMapOut(
        zones=[format_zone_out(z) for z in zones],
        nodes=[CampusNodeOut.model_validate(n) for n in nodes],
        paths=[CampusPathOut.model_validate(p) for p in paths],
        exits=[EmergencyExitOut.model_validate(e) for e in exits],
        assembly_points=[AssemblyPointOut.model_validate(a) for a in assembly_points]
    )

@router.get("/exits", response_model=List[EmergencyExitOut])
def list_emergency_exits(db: Session = Depends(get_db)):
    exits = db.query(EmergencyExit).all()
    return [EmergencyExitOut.model_validate(e) for e in exits]

@router.get("/assembly-points", response_model=List[AssemblyPointOut])
def list_assembly_points(db: Session = Depends(get_db)):
    points = db.query(AssemblyPoint).all()
    return [AssemblyPointOut.model_validate(p) for p in points]

@router.patch("/map/paths/{path_id}/toggle-block", response_model=CampusPathOut)
def toggle_path_blocked(
    path_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    path = db.query(CampusPath).filter(CampusPath.id == path_id).first()
    if not path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Path not found")
    
    path.is_blocked = not path.is_blocked
    db.commit()
    db.refresh(path)
    return CampusPathOut.model_validate(path)
