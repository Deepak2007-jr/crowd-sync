import React, { useState, useRef } from 'react';
import {
  CampusMapData,
  CampusNode,
  CampusZone,
  EmergencyAlert,
  RouteCandidate,
  HazardReport,
} from '../../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  LogOut,
  Shield,
  AlertTriangle,
  Compass,
  Ban,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface CampusMapProps {
  mapData: CampusMapData;
  activeAlerts?: EmergencyAlert[];
  hazardReports?: HazardReport[];
  activeRoute?: RouteCandidate | null;
  selectedStartNodeId?: number | null;
  onSelectNode?: (node: CampusNode) => void;
  onSelectZone?: (zone: CampusZone) => void;
  className?: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  mapData,
  activeAlerts = [],
  hazardReports = [],
  activeRoute = null,
  selectedStartNodeId = null,
  onSelectNode,
  onSelectZone,
  className = '',
}) => {
  // Pan and zoom states
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map Filter Toggles
  const [showExits, setShowExits] = useState(true);
  const [showAssembly, setShowAssembly] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showCrowdColor, setShowCrowdColor] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<CampusNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Build node lookup map
  const nodeMap = new Map<number, CampusNode>();
  mapData.nodes.forEach((n) => nodeMap.set(n.id, n));

  // Determine zone colors based on occupancy percentage
  const getZoneFillColor = (zoneName: string) => {
    if (!showCrowdColor) return 'rgba(30, 41, 59, 0.5)';
    const zone = mapData.zones.find((z) => z.name.toLowerCase().includes(zoneName.toLowerCase()));
    if (!zone) return 'rgba(30, 41, 59, 0.5)';

    const pct = zone.occupancy_percentage;
    if (pct >= 90) return 'rgba(239, 68, 68, 0.28)';   // Red (Critical)
    if (pct >= 75) return 'rgba(249, 115, 22, 0.25)';  // Orange (High)
    if (pct >= 50) return 'rgba(234, 179, 8, 0.22)';   // Amber (Moderate)
    return 'rgba(16, 185, 129, 0.20)';                 // Emerald (Low)
  };

  const getZoneStrokeColor = (zoneName: string) => {
    const zone = mapData.zones.find((z) => z.name.toLowerCase().includes(zoneName.toLowerCase()));
    if (!zone) return '#334155';
    const pct = zone.occupancy_percentage;
    if (pct >= 90) return '#EF4444';
    if (pct >= 75) return '#F97316';
    if (pct >= 50) return '#EAB308';
    return '#10B981';
  };

  // Determine if a path is on the active route
  const isPathOnActiveRoute = (startId: number, endId: number) => {
    if (!activeRoute || !activeRoute.path_nodes || activeRoute.path_nodes.length < 2) return false;
    for (let i = 0; i < activeRoute.path_nodes.length - 1; i++) {
      const u = activeRoute.path_nodes[i].node_id;
      const v = activeRoute.path_nodes[i + 1].node_id;
      if ((u === startId && v === endId) || (u === endId && v === startId)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[580px] lg:h-[640px] rounded-2xl bg-gradient-to-b from-[#090E1A] to-[#0D1527] border border-slate-800 overflow-hidden shadow-2xl select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Map Control Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center glass-panel rounded-xl p-1 border border-slate-700/80 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Visibility Filter Toggles */}
        <div className="hidden sm:flex items-center gap-1.5 glass-panel rounded-xl px-2.5 py-1 text-xs border border-slate-700/80 shadow-lg">
          <button
            onClick={() => setShowExits(!showExits)}
            className={`px-2 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              showExits ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50' : 'text-slate-400'
            }`}
          >
            <LogOut className="w-3 h-3" /> Exits
          </button>
          <button
            onClick={() => setShowAssembly(!showAssembly)}
            className={`px-2 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              showAssembly ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'text-slate-400'
            }`}
          >
            <Shield className="w-3 h-3" /> Assembly
          </button>
          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              showHazards ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3" /> Hazards
          </button>
          <button
            onClick={() => setShowCrowdColor(!showCrowdColor)}
            className={`px-2 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              showCrowdColor ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3" /> Crowd Heat
          </button>
        </div>
      </div>

      {/* Starting Location Quick Badge */}
      {selectedStartNodeId && (
        <div className="absolute top-4 right-4 z-20 glass-panel bg-blue-950/80 border border-blue-500/40 rounded-xl px-3 py-1.5 text-xs text-blue-300 flex items-center gap-2 shadow-lg">
          <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>
            Selected Start: <strong>{nodeMap.get(selectedStartNodeId)?.name || `Node #${selectedStartNodeId}`}</strong>
          </span>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 1000 720"
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '500px 360px',
        }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" opacity="0.4" />
          </pattern>

          {/* Blocked corridor danger stripe pattern */}
          <pattern id="blocked-stripes" width="16" height="16" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="16" stroke="#EF4444" strokeWidth="6" opacity="0.8" />
            <line x1="8" y1="0" x2="8" y2="16" stroke="#1E1B4B" strokeWidth="6" opacity="0.8" />
          </pattern>

          {/* Glow Filter for Active Route */}
          <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="1000" height="720" fill="url(#campus-grid)" />

        {/* ---------------- ZONE SHAPES & FOOTPRINTS ---------------- */}
        <g id="campus-zones">
          {/* Main Academic Block (Zone 1) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => onSelectZone && onSelectZone(mapData.zones.find((z) => z.id === 1)!)}
          >
            <rect
              x="180"
              y="110"
              width="240"
              height="140"
              rx="16"
              fill={getZoneFillColor('Main Academic')}
              stroke={getZoneStrokeColor('Main Academic')}
              strokeWidth="2"
            />
            <text x="300" y="165" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
              Main Academic Block
            </text>
            <text x="300" y="185" textAnchor="middle" fill="#94A3B8" fontSize="10">
              Lecture Halls & Admin
            </text>
          </g>

          {/* Computer Science Block (Zone 2) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => onSelectZone && onSelectZone(mapData.zones.find((z) => z.id === 2)!)}
          >
            <rect
              x="580"
              y="110"
              width="240"
              height="140"
              rx="16"
              fill={getZoneFillColor('Computer Science')}
              stroke={getZoneStrokeColor('Computer Science')}
              strokeWidth="2"
            />
            <text x="700" y="165" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
              CS Block & Tech Labs
            </text>
            <text x="700" y="185" textAnchor="middle" fill="#94A3B8" fontSize="10">
              Galleries & Seminars
            </text>
          </g>

          {/* Central Oval Field / Assembly Point 1 */}
          <g className="cursor-pointer">
            <ellipse
              cx="500"
              cy="270"
              rx="65"
              ry="45"
              fill="rgba(59, 130, 246, 0.15)"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <text x="500" y="275" textAnchor="middle" fill="#60A5FA" fontSize="11" fontWeight="bold">
              Central Oval Lawn
            </text>
          </g>

          {/* Campus Library (Zone 3) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => onSelectZone && onSelectZone(mapData.zones.find((z) => z.id === 3)!)}
          >
            <rect
              x="140"
              y="330"
              width="200"
              height="140"
              rx="16"
              fill={getZoneFillColor('Library')}
              stroke={getZoneStrokeColor('Library')}
              strokeWidth="2"
            />
            <text x="240" y="390" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
              Campus Library
            </text>
            <text x="240" y="410" textAnchor="middle" fill="#94A3B8" fontSize="10">
              3-Tier Reading Halls
            </text>
          </g>

          {/* Grand Auditorium (Zone 4) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => onSelectZone && onSelectZone(mapData.zones.find((z) => z.id === 4)!)}
          >
            <rect
              x="400"
              y="310"
              width="200"
              height="150"
              rx="20"
              fill={getZoneFillColor('Auditorium')}
              stroke={getZoneStrokeColor('Auditorium')}
              strokeWidth="2.5"
            />
            <text x="500" y="375" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
              Grand Auditorium
            </text>
            <text x="500" y="395" textAnchor="middle" fill="#94A3B8" fontSize="10">
              Capacity: 500 Seats
            </text>
          </g>

          {/* Student Cafeteria (Zone 5) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => onSelectZone && onSelectZone(mapData.zones.find((z) => z.id === 5)!)}
          >
            <rect
              x="140"
              y="500"
              width="200"
              height="120"
              rx="16"
              fill={getZoneFillColor('Cafeteria')}
              stroke={getZoneStrokeColor('Cafeteria')}
              strokeWidth="2"
            />
            <text x="240" y="555" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
              Student Cafeteria
            </text>
            <text x="240" y="575" textAnchor="middle" fill="#94A3B8" fontSize="10">
              Food Court & Lounges
            </text>
          </g>

          {/* Sports Grounds & Arena (Zone 6) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => onSelectZone && onSelectZone(mapData.zones.find((z) => z.id === 6)!)}
          >
            <rect
              x="620"
              y="450"
              width="240"
              height="180"
              rx="18"
              fill={getZoneFillColor('Sports')}
              stroke={getZoneStrokeColor('Sports')}
              strokeWidth="2"
            />
            <text x="740" y="530" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
              Sports Arena & Field
            </text>
            <text x="740" y="550" textAnchor="middle" fill="#94A3B8" fontSize="10">
              Track, Stands & Pavilion
            </text>
          </g>
        </g>

        {/* ---------------- WALKING PATHS & EDGES ---------------- */}
        <g id="campus-paths">
          {mapData.paths.map((path) => {
            const start = nodeMap.get(path.start_node_id);
            const end = nodeMap.get(path.end_node_id);
            if (!start || !end) return null;

            const onActiveRoute = isPathOnActiveRoute(path.start_node_id, path.end_node_id);

            // Path coordinates
            const midX = (start.x_coordinate + end.x_coordinate) / 2;
            const midY = (start.y_coordinate + end.y_coordinate) / 2;

            return (
              <g key={`path-${path.id}`}>
                {/* Regular corridor path */}
                {!path.is_blocked && !onActiveRoute && (
                  <line
                    x1={start.x_coordinate}
                    y1={start.y_coordinate}
                    x2={end.x_coordinate}
                    y2={end.y_coordinate}
                    stroke="#1E293B"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                )}

                {/* Blocked corridor representation */}
                {path.is_blocked && (
                  <>
                    <line
                      x1={start.x_coordinate}
                      y1={start.y_coordinate}
                      x2={end.x_coordinate}
                      y2={end.y_coordinate}
                      stroke="#EF4444"
                      strokeWidth="7"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                    />
                    {/* Danger blocked badge on midpoint */}
                    <g transform={`translate(${midX - 35}, ${midY - 10})`}>
                      <rect width="70" height="20" rx="4" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1" />
                      <text x="35" y="14" textAnchor="middle" fill="#FCA5A5" fontSize="9" fontWeight="bold">
                        BLOCKED
                      </text>
                    </g>
                  </>
                )}

                {/* Active Recommended Evacuation Route Line */}
                {onActiveRoute && (
                  <>
                    {/* Glowing under-line */}
                    <line
                      x1={start.x_coordinate}
                      y1={start.y_coordinate}
                      x2={end.x_coordinate}
                      y2={end.y_coordinate}
                      stroke="#06B6D4"
                      strokeWidth="9"
                      strokeLinecap="round"
                      opacity="0.5"
                      filter="url(#route-glow)"
                    />
                    {/* Animated animated-dash primary line */}
                    <line
                      x1={start.x_coordinate}
                      y1={start.y_coordinate}
                      x2={end.x_coordinate}
                      y2={end.y_coordinate}
                      stroke="#22D3EE"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="animate-route-flow"
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* ---------------- NODES, EXITS & ASSEMBLY POINTS ---------------- */}
        <g id="campus-nodes">
          {mapData.nodes.map((node) => {
            const isStart = node.id === selectedStartNodeId;
            const isIntersection = node.node_type === 'intersection';
            const isExit = node.node_type === 'exit';
            const isAssembly = node.node_type === 'assembly_point';

            if (isExit && !showExits) return null;
            if (isAssembly && !showAssembly) return null;

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${node.x_coordinate}, ${node.y_coordinate})`}
                className="cursor-pointer group"
                onClick={() => onSelectNode && onSelectNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Start node beacon */}
                {isStart && (
                  <circle r="18" fill="none" stroke="#3B82F6" strokeWidth="2.5" className="animate-ping" />
                )}

                {/* Node representation based on type */}
                {isExit ? (
                  // Emergency Exit Box
                  <g transform="translate(-16, -16)">
                    <rect
                      width="32"
                      height="32"
                      rx="8"
                      fill="#059669"
                      stroke="#34D399"
                      strokeWidth="2"
                      className="shadow-lg"
                    />
                    <path
                      d="M12 20 L20 16 L12 12"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="16" y="44" textAnchor="middle" fill="#34D399" fontSize="10" fontWeight="bold">
                      {node.name.split('-')[0]}
                    </text>
                  </g>
                ) : isAssembly ? (
                  // Assembly Point Shield
                  <g transform="translate(-16, -16)">
                    <rect
                      width="32"
                      height="32"
                      rx="8"
                      fill="#2563EB"
                      stroke="#60A5FA"
                      strokeWidth="2"
                    />
                    <circle cx="16" cy="16" r="6" fill="#FFFFFF" />
                    <text x="16" y="44" textAnchor="middle" fill="#60A5FA" fontSize="10" fontWeight="bold">
                      {node.name.includes('1') ? 'AP-1' : 'AP-2'}
                    </text>
                  </g>
                ) : isIntersection ? (
                  // Pathway Junction Dot
                  <circle
                    r={isStart ? '8' : '5'}
                    fill={isStart ? '#3B82F6' : '#64748B'}
                    stroke="#0F172A"
                    strokeWidth="2"
                    className="group-hover:fill-blue-400 group-hover:scale-125 transition-transform"
                  />
                ) : (
                  // Building Center Anchor
                  <circle
                    r={isStart ? '10' : '6'}
                    fill={isStart ? '#10B981' : '#38BDF8'}
                    stroke="#0F172A"
                    strokeWidth="2"
                    className="group-hover:fill-emerald-400 group-hover:scale-125 transition-transform"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* ---------------- HAZARD REPORT PINS ---------------- */}
        {showHazards &&
          hazardReports
            .filter((h) => h.status !== 'Resolved')
            .map((hazard) => {
              const zone = mapData.zones.find((z) => z.id === hazard.zone_id);
              if (!zone || !zone.map_coordinates) return null;
              const coords = zone.map_coordinates.split(',').map(Number);
              if (coords.length < 2) return null;

              return (
                <g
                  key={`hazard-pin-${hazard.id}`}
                  transform={`translate(${coords[0] + 30}, ${coords[1] - 15})`}
                  className="cursor-pointer"
                >
                  <circle r="12" fill="#7F1D1D" stroke="#EF4444" strokeWidth="2" className="animate-pulse" />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                    !
                  </text>
                </g>
              );
            })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 z-20 glass-panel bg-slate-900/95 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs shadow-xl pointer-events-none">
          <div className="font-bold text-white">{hoveredNode.name}</div>
          <div className="text-slate-400 capitalize">Type: {hoveredNode.node_type}</div>
          <div className="text-[11px] text-blue-400 mt-0.5">Click to view details or set start point</div>
        </div>
      )}
    </div>
  );
};
