from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CampusEvent, CampusZone, User
from app.schemas.schemas import CampusEventCreate, CampusEventUpdate, CampusEventOut
from app.core.dependencies import require_organizer_or_admin

router = APIRouter(prefix="/events", tags=["Campus Events"])

def format_event_out(evt: CampusEvent) -> CampusEventOut:
    return CampusEventOut(
        id=evt.id,
        name=evt.name,
        venue_id=evt.venue_id,
        venue_name=evt.venue.name if evt.venue else f"Zone #{evt.venue_id}",
        event_date=evt.event_date,
        start_time=evt.start_time,
        expected_attendance=evt.expected_attendance,
        status=evt.status
    )

@router.get("", response_model=List[CampusEventOut])
def list_events(db: Session = Depends(get_db)):
    events = db.query(CampusEvent).all()
    return [format_event_out(e) for e in events]

@router.post("", response_model=CampusEventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: CampusEventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_organizer_or_admin)
):
    venue = db.query(CampusZone).filter(CampusZone.id == event_in.venue_id).first()
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue zone not found.")
    
    if event_in.expected_attendance > venue.capacity * 1.5:
        # Warning/validation: prevent wildly invalid attendance exceeding venue capacity drastically
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Expected attendance ({event_in.expected_attendance}) exceeds maximum safe limit for venue ({venue.capacity})."
        )

    new_event = CampusEvent(
        name=event_in.name,
        venue_id=event_in.venue_id,
        event_date=event_in.event_date,
        start_time=event_in.start_time,
        expected_attendance=event_in.expected_attendance,
        status=event_in.status or "Scheduled"
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return format_event_out(new_event)

@router.put("/{event_id}", response_model=CampusEventOut)
def update_event(
    event_id: int,
    event_in: CampusEventUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_organizer_or_admin)
):
    event = db.query(CampusEvent).filter(CampusEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    if event_in.name is not None:
        event.name = event_in.name
    if event_in.venue_id is not None:
        event.venue_id = event_in.venue_id
    if event_in.event_date is not None:
        event.event_date = event_in.event_date
    if event_in.start_time is not None:
        event.start_time = event_in.start_time
    if event_in.expected_attendance is not None:
        event.expected_attendance = event_in.expected_attendance
    if event_in.status is not None:
        event.status = event_in.status

    db.commit()
    db.refresh(event)
    return format_event_out(event)

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_organizer_or_admin)
):
    event = db.query(CampusEvent).filter(CampusEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    db.delete(event)
    db.commit()
    return None
