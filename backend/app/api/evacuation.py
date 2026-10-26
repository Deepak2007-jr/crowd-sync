from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import EvacuationSimulation, User
from app.schemas.schemas import RouteRequest, EvacuationRouteResponse, EvacuationSimulationOut
from app.services.evacuation_engine import calculate_evacuation_routes
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/evacuation", tags=["Evacuation Guidance"])

@router.post("/route", response_model=EvacuationRouteResponse)
def get_evacuation_route(
    request: RouteRequest,
    db: Session = Depends(get_db)
):
    """
    Computes optimal safe evacuation route using dynamic Dijkstra algorithm.
    Factors in distance, simulated crowd congestion, active emergency alerts,
    and excludes blocked corridors.
    """
    response = calculate_evacuation_routes(db, request)
    return response

@router.get("/history", response_model=List[EvacuationSimulationOut])
def get_simulation_history(db: Session = Depends(get_db)):
    """Returns recent evacuation simulation runs and audits."""
    sims = db.query(EvacuationSimulation).order_by(EvacuationSimulation.created_at.desc()).limit(20).all()
    return [EvacuationSimulationOut.model_validate(s) for s in sims]
