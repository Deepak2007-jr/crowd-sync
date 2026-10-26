import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Shield,
  LogOut,
  Navigation,
  Accessibility,
  RotateCw,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import { CampusMap } from '../components/map/CampusMap';
import { RoutePanel } from '../components/map/RoutePanel';
import { MapLegend } from '../components/map/MapLegend';
import { SimulationControls } from '../components/map/SimulationControls';
import { mapService } from '../services/mapService';
import { evacuationService } from '../services/evacuationService';
import { alertService } from '../services/alertService';
import {
  CampusMapData,
  CampusNode,
  EvacuationRouteResponse,
  RouteCandidate,
  EmergencyAlert
} from '../types';

export const EvacuationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStartNode = Number(searchParams.get('start')) || 4; // Default to Auditorium (Node 4)

  const [mapData, setMapData] = useState<CampusMapData | null>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [startNodeId, setStartNodeId] = useState<number>(initialStartNode);
  const [preferAccessible, setPreferAccessible] = useState<boolean>(false);
  const [targetType, setTargetType] = useState<'exit' | 'assembly_point'>('exit');

  const [routeResult, setRouteResult] = useState<EvacuationRouteResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteCandidate | null>(null);
  const [loading, setLoading] = useState(false);

  // Load campus map and initial alerts
  const loadMapAndAlerts = async () => {
    try {
      const [mData, aData] = await Promise.all([
        mapService.getCampusMap(),
        alertService.getAlerts('Active'),
      ]);
      setMapData(mData);
      setAlerts(aData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMapAndAlerts();
  }, []);

  // Compute evacuation route whenever starting node, target type, or accessibility setting changes
  const calculateRoute = async () => {
    if (!startNodeId) return;
    setLoading(true);
    try {
      const res = await evacuationService.getRoute({
        starting_node_id: startNodeId,
        prefer_accessible: preferAccessible,
        target_type: targetType,
      });
      setRouteResult(res);
      setSelectedRoute(res.recommended_route || null);
    } catch (err) {
      console.error('Evacuation routing error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mapData) {
      calculateRoute();
    }
  }, [startNodeId, preferAccessible, targetType, mapData]);

  const buildingNodes = mapData?.nodes.filter(
    (n) => n.node_type === 'building' || n.node_type === 'intersection'
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Emergency Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-cyan-400 tracking-wider">
              Dijkstra Safe Evacuation Recommendation Engine
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-cyan-400" />
            Campus Evacuation Guidance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Dynamically computes optimal routes by evaluating simulated crowd congestion, active hazard alerts, and excluding blocked corridors.
          </p>
        </div>

        {/* Academic Prototype Tag */}
        <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 max-w-xs">
          <Info className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
          <strong>Simulated Guidance:</strong> Does not guarantee real-world path clearance. In emergencies, official safety instructions and responders take priority.
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Starting Location Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Starting Location
            </label>
            <select
              value={startNodeId}
              onChange={(e) => setStartNodeId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-cyan-500"
            >
              {buildingNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.node_type})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Target Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              Target Destination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('exit')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  targetType === 'exit'
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <LogOut className="w-3 h-3" />
                Emergency Exits
              </button>
              <button
                type="button"
                onClick={() => setTargetType('assembly_point')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  targetType === 'assembly_point'
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Shield className="w-3 h-3" />
                Assembly Grounds
              </button>
            </div>
          </div>

          {/* Accessibility Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Accessibility className="w-3.5 h-3.5 text-purple-400" />
              Mobility Preference
            </label>
            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preferAccessible}
                onChange={(e) => setPreferAccessible(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                Step-Free / Wheelchair Ramps Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Map & Route Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {mapData ? (
            <CampusMap
              mapData={mapData}
              activeAlerts={alerts}
              activeRoute={selectedRoute}
              selectedStartNodeId={startNodeId}
              onSelectNode={(node) => setStartNodeId(node.id)}
            />
          ) : (
            <div className="h-[580px] glass-panel rounded-2xl flex items-center justify-center text-xs text-slate-400">
              Loading campus graph topology...
            </div>
          )}
          <MapLegend />
        </div>

        <div className="space-y-4">
          <RoutePanel
            routeData={routeResult}
            loading={loading}
            onRefresh={calculateRoute}
            onSelectAlternative={(alt) => setSelectedRoute(alt)}
          />

          {/* Demonstration Scenario Controls in Evacuation Page */}
          <SimulationControls
            onScenarioChange={async () => {
              await loadMapAndAlerts();
              calculateRoute();
            }}
          />
        </div>
      </div>
    </div>
  );
};
