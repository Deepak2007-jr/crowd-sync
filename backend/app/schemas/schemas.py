from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- User Schemas -----------------
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ----------------- Zone Schemas -----------------
class CampusZoneOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    capacity: int
    estimated_occupancy: int
    occupancy_percentage: float = 0.0
    crowd_status: str = "Low"  # Low, Moderate, High, Critical
    zone_type: str
    map_coordinates: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CampusZoneOccupancyUpdate(BaseModel):
    estimated_occupancy: int = Field(..., ge=0)

# ----------------- Map & Node Schemas -----------------
class CampusNodeOut(BaseModel):
    id: int
    name: str
    zone_id: Optional[int] = None
    node_type: str
    x_coordinate: float
    y_coordinate: float
    accessibility_verified: bool

    model_config = ConfigDict(from_attributes=True)

class CampusPathOut(BaseModel):
    id: int
    start_node_id: int
    end_node_id: int
    distance: float
    estimated_time: float
    crowd_penalty: float
    is_blocked: bool
    is_accessible: bool

    model_config = ConfigDict(from_attributes=True)

class EmergencyExitOut(BaseModel):
    id: int
    name: str
    node_id: int
    configured_capacity: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)

class AssemblyPointOut(BaseModel):
    id: int
    name: str
    node_id: int
    configured_capacity: int
    accessibility_information: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CampusMapOut(BaseModel):
    zones: List[CampusZoneOut]
    nodes: List[CampusNodeOut]
    paths: List[CampusPathOut]
    exits: List[EmergencyExitOut]
    assembly_points: List[AssemblyPointOut]

# ----------------- Event Schemas -----------------
class CampusEventCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    venue_id: int
    event_date: str
    start_time: str
    expected_attendance: int = Field(..., gt=0)
    status: Optional[str] = "Scheduled"

class CampusEventUpdate(BaseModel):
    name: Optional[str] = None
    venue_id: Optional[int] = None
    event_date: Optional[str] = None
    start_time: Optional[str] = None
    expected_attendance: Optional[int] = None
    status: Optional[str] = None

class CampusEventOut(BaseModel):
    id: int
    name: str
    venue_id: int
    venue_name: Optional[str] = None
    event_date: str
    start_time: str
    expected_attendance: int
    status: str

    model_config = ConfigDict(from_attributes=True)

# ----------------- Emergency Alert Schemas -----------------
class EmergencyAlertCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=5)
    severity: str = "Medium"  # Low, Medium, High, Critical
    category: str = "Other"   # Fire, Medical, Overcrowding, Blocked Exit, Other
    zone_id: Optional[int] = None

class EmergencyAlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    zone_id: Optional[int] = None
    status: Optional[str] = None

class EmergencyAlertOut(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    category: str
    zone_id: Optional[int] = None
    zone_name: Optional[str] = None
    status: str
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Hazard Report Schemas -----------------
class HazardReportCreate(BaseModel):
    category: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=5)
    zone_id: int

class HazardReportUpdate(BaseModel):
    status: Optional[str] = None
    resolution_notes: Optional[str] = None

class HazardReportOut(BaseModel):
    id: int
    category: str
    description: str
    zone_id: int
    zone_name: Optional[str] = None
    reported_by: Optional[int] = None
    reporter_name: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Route & Evacuation Schemas -----------------
class RouteRequest(BaseModel):
    starting_node_id: int
    prefer_accessible: bool = False
    target_type: str = "exit"  # "exit" or "assembly_point"

class PathStep(BaseModel):
    node_id: int
    node_name: str
    x: float
    y: float
    node_type: str
    zone_name: Optional[str] = None

class RouteCandidate(BaseModel):
    exit_or_assembly_id: int
    destination_name: str
    destination_type: str
    total_cost: float
    total_distance_meters: float
    estimated_time_minutes: float
    path_nodes: List[PathStep]
    is_accessible: bool
    risk_level: str  # "Low", "Moderate", "High", "Critical"
    explanation: str

class EvacuationRouteResponse(BaseModel):
    is_safe_route_found: bool
    recommended_route: Optional[RouteCandidate] = None
    alternative_routes: List[RouteCandidate] = []
    disclaimer: str
    warning_message: Optional[str] = None
    active_alerts_count: int = 0
    simulated_congestion_factored: bool = True

class EvacuationSimulationOut(BaseModel):
    id: int
    name: str
    starting_node_id: int
    selected_exit_id: Optional[int] = None
    route_summary: str
    simulation_status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SimulationTriggerRequest(BaseModel):
    scenario: str = "auditorium_congestion_blocked_exit"  # or "reset"
