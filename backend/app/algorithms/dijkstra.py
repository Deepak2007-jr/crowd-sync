import heapq
from typing import Dict, List, Tuple, Optional, Set

class GraphEdge:
    def __init__(
        self,
        edge_id: int,
        start_node_id: int,
        end_node_id: int,
        distance: float,
        base_time: float,
        crowd_penalty: float,
        is_blocked: bool,
        is_accessible: bool,
        risk_penalty: float = 0.0
    ):
        self.edge_id = edge_id
        self.start_node_id = start_node_id
        self.end_node_id = end_node_id
        self.distance = distance
        self.base_time = base_time
        self.crowd_penalty = crowd_penalty
        self.is_blocked = is_blocked
        self.is_accessible = is_accessible
        self.risk_penalty = risk_penalty

    @property
    def dynamic_cost(self) -> float:
        """Calculate dynamic route cost: distance + congestion penalty + risk penalty."""
        if self.is_blocked:
            return float('inf')
        
        # Route cost = distance + (distance * (crowd_penalty - 1.0)) + risk_penalty
        # When crowd_penalty is 1.0, cost = distance.
        # When crowd_penalty is 3.5, congestion penalty adds substantial weight.
        congestion_cost = self.distance * max(0.0, self.crowd_penalty - 1.0)
        return self.distance + congestion_cost + self.risk_penalty

    @property
    def estimated_traversal_time(self) -> float:
        """Estimated traversal time in minutes factoring in crowd slowdown."""
        # Average walking speed ~ 1.2 m/s (~72 m/min) under free flow
        # Traversal time slows proportionally to crowd penalty
        base_speed_m_per_min = 70.0
        congested_speed = base_speed_m_per_min / max(1.0, self.crowd_penalty)
        return (self.distance / congested_speed)


def dijkstra_shortest_path(
    adjacency_list: Dict[int, List[GraphEdge]],
    start_node_id: int,
    target_node_ids: Set[int],
    prefer_accessible: bool = False
) -> Dict[int, Tuple[float, List[int], float, float]]:
    """
    Computes shortest safe paths from start_node_id to any reachable target node.
    Returns:
        dict mapping target_node_id -> (total_cost, path_node_ids, total_distance, total_time_minutes)
    """
    # Priority queue: (cost, current_node_id, path_so_far, total_distance, total_time)
    pq = [(0.0, start_node_id, [start_node_id], 0.0, 0.0)]
    visited_costs: Dict[int, float] = {}
    found_targets: Dict[int, Tuple[float, List[int], float, float]] = {}

    while pq:
        current_cost, u, path, total_dist, total_time = heapq.heappop(pq)

        if u in visited_costs and visited_costs[u] <= current_cost:
            continue
        visited_costs[u] = current_cost

        # If this node is one of our target destinations, record the best path to it
        if u in target_node_ids:
            if u not in found_targets:
                found_targets[u] = (current_cost, path, total_dist, total_time)

        # Explore outgoing edges
        for edge in adjacency_list.get(u, []):
            if edge.is_blocked:
                continue
            if prefer_accessible and not edge.is_accessible:
                continue

            v = edge.end_node_id
            edge_cost = edge.dynamic_cost
            if edge_cost == float('inf'):
                continue

            next_cost = current_cost + edge_cost
            next_dist = total_dist + edge.distance
            next_time = total_time + edge.estimated_traversal_time

            if v not in visited_costs or next_cost < visited_costs[v]:
                heapq.heappush(pq, (next_cost, v, path + [v], next_dist, next_time))

    return found_targets
