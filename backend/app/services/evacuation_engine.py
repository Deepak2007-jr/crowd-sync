from sqlalchemy.orm import Session
from typing import Dict, List, Set, Optional
from app.models.models import (
    CampusNode, CampusPath, CampusZone, EmergencyExit, AssemblyPoint,
    EmergencyAlert, EvacuationSimulation
)
from app.schemas.schemas import (
    RouteRequest, EvacuationRouteResponse, RouteCandidate, PathStep
)
from app.algorithms.dijkstra import GraphEdge, dijkstra_shortest_path

def calculate_evacuation_routes(
    db: Session,
    request: RouteRequest
) -> EvacuationRouteResponse:
    """
    Main evacuation engine that evaluates campus paths, active alerts,
    and simulated crowd levels to recommend the safest available route.
    """
    start_node = db.query(CampusNode).filter(CampusNode.id == request.starting_node_id).first()
    if not start_node:
        return EvacuationRouteResponse(
            is_safe_route_found=False,
            recommended_route=None,
            alternative_routes=[],
            disclaimer="ACADEMIC PROTOTYPE: Simulated data only. In a real emergency, follow campus emergency staff instructions.",
            warning_message=f"Starting location (Node #{request.starting_node_id}) was not found in campus database.",
            active_alerts_count=0
        )

    # 1. Fetch zones, active alerts, and build zone risk multipliers
    zones = {z.id: z for z in db.query(CampusZone).all()}
    active_alerts = db.query(EmergencyAlert).filter(EmergencyAlert.status == "Active").all()
    
    # Map zone -> risk penalty
    zone_risk_penalty: Dict[int, float] = {}
    for alert in active_alerts:
        if alert.zone_id:
            penalty = 300.0 if alert.severity == "Critical" else (150.0 if alert.severity == "High" else 50.0)
            zone_risk_penalty[alert.zone_id] = zone_risk_penalty.get(alert.zone_id, 0.0) + penalty

    # Map zone -> crowd penalty factor (occupancy / capacity)
    zone_crowd_factors: Dict[int, float] = {}
    for z_id, zone in zones.items():
        if zone.capacity > 0:
            occ_ratio = zone.estimated_occupancy / float(zone.capacity)
            if occ_ratio >= 0.90:
                zone_crowd_factors[z_id] = 4.5  # Critical congestion
            elif occ_ratio >= 0.75:
                zone_crowd_factors[z_id] = 2.5  # High crowd
            elif occ_ratio >= 0.50:
                zone_crowd_factors[z_id] = 1.5  # Moderate crowd
            else:
                zone_crowd_factors[z_id] = 1.0  # Low crowd
        else:
            zone_crowd_factors[z_id] = 1.0

    # 2. Fetch all nodes and paths to build graph
    all_nodes = {n.id: n for n in db.query(CampusNode).all()}
    all_paths = db.query(CampusPath).all()

    # Build adjacency list with bidirectional traversal
    adjacency: Dict[int, List[GraphEdge]] = {}
    for path in all_paths:
        start_n = all_nodes.get(path.start_node_id)
        end_n = all_nodes.get(path.end_node_id)
        
        # Determine applicable crowd penalty from connected nodes' zones
        zone_factor = 1.0
        risk_penalty = 0.0
        if start_n and start_n.zone_id:
            zone_factor = max(zone_factor, zone_crowd_factors.get(start_n.zone_id, 1.0))
            risk_penalty = max(risk_penalty, zone_risk_penalty.get(start_n.zone_id, 0.0))
        if end_n and end_n.zone_id:
            zone_factor = max(zone_factor, zone_crowd_factors.get(end_n.zone_id, 1.0))
            risk_penalty = max(risk_penalty, zone_risk_penalty.get(end_n.zone_id, 0.0))

        dynamic_crowd_penalty = path.crowd_penalty * zone_factor

        # Forward edge
        edge_fwd = GraphEdge(
            edge_id=path.id,
            start_node_id=path.start_node_id,
            end_node_id=path.end_node_id,
            distance=path.distance,
            base_time=path.estimated_time,
            crowd_penalty=dynamic_crowd_penalty,
            is_blocked=path.is_blocked,
            is_accessible=path.is_accessible,
            risk_penalty=risk_penalty
        )
        # Reverse edge (campus walkways are bidirectional)
        edge_rev = GraphEdge(
            edge_id=path.id,
            start_node_id=path.end_node_id,
            end_node_id=path.start_node_id,
            distance=path.distance,
            base_time=path.estimated_time,
            crowd_penalty=dynamic_crowd_penalty,
            is_blocked=path.is_blocked,
            is_accessible=path.is_accessible,
            risk_penalty=risk_penalty
        )

        adjacency.setdefault(path.start_node_id, []).append(edge_fwd)
        adjacency.setdefault(path.end_node_id, []).append(edge_rev)

    # 3. Target destinations: Exits or Assembly points
    destinations = []
    target_node_ids: Set[int] = set()

    if request.target_type == "assembly_point":
        assembly_points = db.query(AssemblyPoint).all()
        for ap in assembly_points:
            target_node_ids.add(ap.node_id)
            destinations.append(("assembly_point", ap.id, ap.name, ap.node_id, ap.accessibility_information))
    else:
        # Default: Emergency Exits
        exits = db.query(EmergencyExit).filter(EmergencyExit.is_available == True).all()
        for ex in exits:
            target_node_ids.add(ex.node_id)
            destinations.append(("exit", ex.id, ex.name, ex.node_id, "Standard exit path"))

    if not target_node_ids:
        return EvacuationRouteResponse(
            is_safe_route_found=False,
            recommended_route=None,
            alternative_routes=[],
            disclaimer="ACADEMIC PROTOTYPE: Simulated data only. In a real emergency, follow campus emergency staff instructions.",
            warning_message="CRITICAL: No active emergency exits or assembly points are currently registered in the system. Follow on-site emergency personnel immediately.",
            active_alerts_count=len(active_alerts)
        )

    # 4. Run Dijkstra with dynamic cost
    routes_found = dijkstra_shortest_path(
        adjacency_list=adjacency,
        start_node_id=request.starting_node_id,
        target_node_ids=target_node_ids,
        prefer_accessible=request.prefer_accessible
    )

    if not routes_found:
        warning_text = (
            "SAFETY WARNING: All known routes to emergency destinations are either blocked, overcrowded, "
            "or non-accessible. DO NOT FABRICATE AN UNAUTHORIZED ROUTE. Immediately follow campus emergency personnel, "
            "sound manual alarms, and await verified evacuation instructions."
        )
        if request.prefer_accessible:
            warning_text += " Note: Step-free / wheelchair accessibility filter was enabled, which restricted non-accessible stairways."

        # Log failed simulation
        sim_log = EvacuationSimulation(
            name=f"Evacuation from {start_node.name}",
            starting_node_id=start_node.id,
            selected_exit_id=None,
            route_summary=f"No viable route found: {warning_text}",
            simulation_status="No Valid Route"
        )
        db.add(sim_log)
        db.commit()

        return EvacuationRouteResponse(
            is_safe_route_found=False,
            recommended_route=None,
            alternative_routes=[],
            disclaimer="ACADEMIC PROTOTYPE: Simulated data only. In a real emergency, follow campus emergency staff instructions.",
            warning_message=warning_text,
            active_alerts_count=len(active_alerts)
        )

    # 5. Format candidate routes
    candidates: List[RouteCandidate] = []
    
    for dest_type, dest_id, dest_name, dest_node_id, extra_info in destinations:
        if dest_node_id in routes_found:
            cost, path_ids, total_distance, total_time = routes_found[dest_node_id]

            # Construct PathSteps
            steps: List[PathStep] = []
            is_route_fully_accessible = True
            max_zone_factor = 1.0

            for nid in path_ids:
                node_obj = all_nodes.get(nid)
                if node_obj:
                    zone_name = zones[node_obj.zone_id].name if (node_obj.zone_id and node_obj.zone_id in zones) else "General Corridor"
                    steps.append(PathStep(
                        node_id=node_obj.id,
                        node_name=node_obj.name,
                        x=node_obj.x_coordinate,
                        y=node_obj.y_coordinate,
                        node_type=node_obj.node_type,
                        zone_name=zone_name
                    ))
                    if not node_obj.accessibility_verified:
                        is_route_fully_accessible = False
                    if node_obj.zone_id:
                        max_zone_factor = max(max_zone_factor, zone_crowd_factors.get(node_obj.zone_id, 1.0))

            # Risk level
            if max_zone_factor >= 4.0:
                risk_lvl = "High"
            elif max_zone_factor >= 2.0:
                risk_lvl = "Moderate"
            else:
                risk_lvl = "Low"

            # Explanation
            explanation = (
                f"Route to {dest_name}: {int(total_distance)}m walking distance, est. {round(total_time, 1)} min. "
                f"Dynamic cost score: {round(cost, 1)}. "
            )
            if max_zone_factor > 1.5:
                explanation += f"Includes minor congestion slowdown in adjoining zones. "
            else:
                explanation += "Clear traversal corridors with minimal crowd impedance. "
            if request.prefer_accessible:
                explanation += "Wheelchair accessible paths verified. "

            candidates.append(RouteCandidate(
                exit_or_assembly_id=dest_id,
                destination_name=dest_name,
                destination_type=dest_type,
                total_cost=cost,
                total_distance_meters=round(total_distance, 1),
                estimated_time_minutes=round(max(0.5, total_time), 1),
                path_nodes=steps,
                is_accessible=is_route_fully_accessible,
                risk_level=risk_lvl,
                explanation=explanation
            ))

    # Sort candidates by total dynamic cost (lowest cost is optimal)
    candidates.sort(key=lambda c: c.total_cost)

    recommended = candidates[0] if candidates else None
    alternatives = candidates[1:] if len(candidates) > 1 else []

    # Log successful simulation
    if recommended:
        summary_str = f"Recommended: {recommended.destination_name} ({recommended.total_distance_meters}m, {recommended.estimated_time_minutes} min, score {recommended.total_cost})"
        sim_log = EvacuationSimulation(
            name=f"Evacuation from {start_node.name}",
            starting_node_id=start_node.id,
            selected_exit_id=recommended.exit_or_assembly_id if request.target_type == "exit" else None,
            route_summary=summary_str,
            simulation_status="Completed"
        )
        db.add(sim_log)
        db.commit()

    return EvacuationRouteResponse(
        is_safe_route_found=True,
        recommended_route=recommended,
        alternative_routes=alternatives,
        disclaimer="ACADEMIC PROTOTYPE: Simulated data only. In a real emergency, official campus emergency instructions and emergency responders take priority.",
        warning_message=None,
        active_alerts_count=len(active_alerts),
        simulated_congestion_factored=True
    )
