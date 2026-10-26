export type UserRole = 'student' | 'organizer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface CampusZone {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  estimated_occupancy: number;
  occupancy_percentage: number;
  crowd_status: 'Low' | 'Moderate' | 'High' | 'Critical';
  zone_type: string;
  map_coordinates?: string;
}

export interface CampusNode {
  id: number;
  name: string;
  zone_id?: number | null;
  node_type: 'building' | 'intersection' | 'exit' | 'assembly_point';
  x_coordinate: number;
  y_coordinate: number;
  accessibility_verified: boolean;
}

export interface CampusPath {
  id: number;
  start_node_id: number;
  end_node_id: number;
  distance: number;
  estimated_time: number;
  crowd_penalty: number;
  is_blocked: boolean;
  is_accessible: boolean;
}

export interface EmergencyExit {
  id: number;
  name: string;
  node_id: number;
  configured_capacity: number;
  is_available: boolean;
}

export interface AssemblyPoint {
  id: number;
  name: string;
  node_id: number;
  configured_capacity: number;
  accessibility_information?: string;
}

export interface CampusMapData {
  zones: CampusZone[];
  nodes: CampusNode[];
  paths: CampusPath[];
  exits: EmergencyExit[];
  assembly_points: AssemblyPoint[];
}

export interface CampusEvent {
  id: number;
  name: string;
  venue_id: number;
  venue_name?: string;
  event_date: string;
  start_time: string;
  expected_attendance: number;
  status: string;
}

export interface EmergencyAlert {
  id: number;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Fire' | 'Medical' | 'Overcrowding' | 'Blocked Exit' | 'Other';
  zone_id?: number | null;
  zone_name?: string;
  status: 'Active' | 'Resolved';
  created_by?: number;
  created_at: string;
  resolved_at?: string | null;
}

export interface HazardReport {
  id: number;
  category: string;
  description: string;
  zone_id: number;
  zone_name?: string;
  reported_by?: number;
  reporter_name?: string;
  status: 'Pending' | 'Under Review' | 'Resolved';
  created_at: string;
  resolution_notes?: string;
}

export interface PathStep {
  node_id: number;
  node_name: string;
  x: number;
  y: number;
  node_type: string;
  zone_name?: string;
}

export interface RouteCandidate {
  exit_or_assembly_id: number;
  destination_name: string;
  destination_type: 'exit' | 'assembly_point';
  total_cost: number;
  total_distance_meters: number;
  estimated_time_minutes: number;
  path_nodes: PathStep[];
  is_accessible: boolean;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  explanation: string;
}

export interface EvacuationRouteResponse {
  is_safe_route_found: boolean;
  recommended_route?: RouteCandidate | null;
  alternative_routes: RouteCandidate[];
  disclaimer: string;
  warning_message?: string | null;
  active_alerts_count: number;
  simulated_congestion_factored: boolean;
}

export interface CrowdStatus {
  data_source: string;
  total_estimated_attendees: number;
  total_campus_capacity: number;
  overall_occupancy_percentage: number;
  total_monitored_zones: number;
  low_density_zones: number;
  moderate_density_zones: number;
  high_density_zones: number;
  critical_density_zones: number;
  zones: CampusZone[];
}

export interface EvacuationSimulationLog {
  id: number;
  name: string;
  starting_node_id: number;
  selected_exit_id?: number;
  route_summary: string;
  simulation_status: string;
  created_at: string;
}
