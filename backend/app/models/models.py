import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # 'student', 'organizer', 'admin'
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    alerts_created = relationship("EmergencyAlert", back_populates="creator")
    hazard_reports = relationship("HazardReport", back_populates="reporter")


class CampusZone(Base):
    __tablename__ = "campus_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    capacity = Column(Integer, nullable=False, default=100)
    estimated_occupancy = Column(Integer, nullable=False, default=0)
    zone_type = Column(String(50), nullable=False, default="academic")  # academic, auditorium, cafeteria, outdoor, sports
    map_coordinates = Column(String(255), nullable=True)  # JSON or bounding box descriptor

    # Relationships
    nodes = relationship("CampusNode", back_populates="zone", cascade="all, delete-orphan")
    events = relationship("CampusEvent", back_populates="venue")
    alerts = relationship("EmergencyAlert", back_populates="zone")
    hazard_reports = relationship("HazardReport", back_populates="zone")
    snapshots = relationship("CrowdSnapshot", back_populates="zone", cascade="all, delete-orphan")


class CampusNode(Base):
    __tablename__ = "campus_nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    zone_id = Column(Integer, ForeignKey("campus_zones.id", ondelete="SET NULL"), nullable=True)
    node_type = Column(String(50), nullable=False, default="corridor")  # building, intersection, exit, assembly_point
    x_coordinate = Column(Float, nullable=False)
    y_coordinate = Column(Float, nullable=False)
    accessibility_verified = Column(Boolean, default=True)

    # Relationships
    zone = relationship("CampusZone", back_populates="nodes")
    outgoing_paths = relationship("CampusPath", foreign_keys="CampusPath.start_node_id", back_populates="start_node")
    incoming_paths = relationship("CampusPath", foreign_keys="CampusPath.end_node_id", back_populates="end_node")
    exit_info = relationship("EmergencyExit", back_populates="node", uselist=False)
    assembly_point = relationship("AssemblyPoint", back_populates="node", uselist=False)


class CampusPath(Base):
    __tablename__ = "campus_paths"

    id = Column(Integer, primary_key=True, index=True)
    start_node_id = Column(Integer, ForeignKey("campus_nodes.id", ondelete="CASCADE"), nullable=False)
    end_node_id = Column(Integer, ForeignKey("campus_nodes.id", ondelete="CASCADE"), nullable=False)
    distance = Column(Float, nullable=False)  # in meters
    estimated_time = Column(Float, nullable=False)  # in seconds / minutes
    crowd_penalty = Column(Float, default=1.0)  # multiplier based on congestion
    is_blocked = Column(Boolean, default=False)
    is_accessible = Column(Boolean, default=True)  # Wheelchair accessibility

    # Relationships
    start_node = relationship("CampusNode", foreign_keys=[start_node_id], back_populates="outgoing_paths")
    end_node = relationship("CampusNode", foreign_keys=[end_node_id], back_populates="incoming_paths")


class EmergencyExit(Base):
    __tablename__ = "emergency_exits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    node_id = Column(Integer, ForeignKey("campus_nodes.id", ondelete="CASCADE"), nullable=False, unique=True)
    configured_capacity = Column(Integer, nullable=False, default=150)
    is_available = Column(Boolean, default=True)

    # Relationship
    node = relationship("CampusNode", back_populates="exit_info")


class AssemblyPoint(Base):
    __tablename__ = "assembly_points"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    node_id = Column(Integer, ForeignKey("campus_nodes.id", ondelete="CASCADE"), nullable=False, unique=True)
    configured_capacity = Column(Integer, nullable=False, default=500)
    accessibility_information = Column(String(255), nullable=True, default="Paved ramps and step-free access verified")

    # Relationship
    node = relationship("CampusNode", back_populates="assembly_point")


class CampusEvent(Base):
    __tablename__ = "campus_events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    venue_id = Column(Integer, ForeignKey("campus_zones.id", ondelete="CASCADE"), nullable=False)
    event_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    start_time = Column(String(10), nullable=False)  # HH:MM
    expected_attendance = Column(Integer, nullable=False, default=50)
    status = Column(String(50), default="Scheduled")  # Scheduled, Ongoing, Completed, Cancelled

    # Relationship
    venue = relationship("CampusZone", back_populates="events")


class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default="Medium")  # Low, Medium, High, Critical
    category = Column(String(50), nullable=False, default="Other")  # Fire, Medical, Overcrowding, Blocked Exit, Other
    zone_id = Column(Integer, ForeignKey("campus_zones.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), default="Active")  # Active, Resolved
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    zone = relationship("CampusZone", back_populates="alerts")
    creator = relationship("User", back_populates="alerts_created")


class HazardReport(Base):
    __tablename__ = "hazard_reports"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)  # Blocked exit, Excessive crowding, Slippery floor, Smoke/fire, Medical, Other
    description = Column(Text, nullable=False)
    zone_id = Column(Integer, ForeignKey("campus_zones.id", ondelete="CASCADE"), nullable=False)
    reported_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), default="Pending")  # Pending, Under Review, Resolved
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    resolution_notes = Column(Text, nullable=True)

    # Relationships
    zone = relationship("CampusZone", back_populates="hazard_reports")
    reporter = relationship("User", back_populates="hazard_reports")


class CrowdSnapshot(Base):
    __tablename__ = "crowd_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("campus_zones.id", ondelete="CASCADE"), nullable=False)
    estimated_occupancy = Column(Integer, nullable=False)
    recorded_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    data_source = Column(String(100), default="Simulated Demo Data")

    # Relationship
    zone = relationship("CampusZone", back_populates="snapshots")


class EvacuationSimulation(Base):
    __tablename__ = "evacuation_simulations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    starting_node_id = Column(Integer, ForeignKey("campus_nodes.id", ondelete="CASCADE"), nullable=False)
    selected_exit_id = Column(Integer, nullable=True)
    route_summary = Column(Text, nullable=False)
    simulation_status = Column(String(50), default="Completed")  # Completed, No Valid Route, Warning
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
