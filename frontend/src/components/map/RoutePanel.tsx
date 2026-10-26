import React, { useState } from 'react';
import { RouteCandidate, EvacuationRouteResponse } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Compass,
  Clock,
  Navigation,
  ShieldAlert,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface RoutePanelProps {
  routeData: EvacuationRouteResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectAlternative?: (alt: RouteCandidate) => void;
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  routeData,
  loading,
  onRefresh,
  onSelectAlternative,
}) => {
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(0);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-center space-y-3">
        <Compass className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <h4 className="text-sm font-bold text-white">Evaluating Dynamic Campus Paths...</h4>
        <p className="text-xs text-slate-400">
          Calculating Dijkstra cost factoring distance, simulated crowd congestion, and blocked corridors.
        </p>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-center space-y-2">
        <Compass className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-300">Select Starting Location</h4>
        <p className="text-xs text-slate-400">
          Click any building, corridor, or zone on the campus map or pick from the dropdown to compute the safest exit route.
        </p>
      </div>
    );
  }

  if (!routeData.is_safe_route_found) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-red-800/60 bg-red-950/30 text-left space-y-3">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 animate-bounce" />
          <span>EVACUATION WARNING: NO VERIFIED SAFE ROUTE</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {routeData.warning_message ||
            'All known routes are blocked or impassable. DO NOT ATTEMPT TO FORCE AN UNVERIFIED PATH.'}
        </p>
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-300 space-y-1">
          <p className="font-semibold">Immediate Emergency Instructions:</p>
          <p className="text-slate-400">• Follow instructions of designated campus safety officers.</p>
          <p className="text-slate-400">• Trigger nearest manual fire alarm pull station if life is threatened.</p>
          <p className="text-slate-400">• Call campus emergency dispatch immediately at +1 (800) 555-SAFE.</p>
        </div>
        <button
          onClick={onRefresh}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Recheck Path Availability
        </button>
      </div>
    );
  }

  const allCandidates = [
    ...(routeData.recommended_route ? [routeData.recommended_route] : []),
    ...routeData.alternative_routes,
  ];

  const currentRoute = allCandidates[selectedCandidateIndex] || routeData.recommended_route;

  if (!currentRoute) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Route Guidance Recommendation
            </h4>
            <span className="text-[10px] text-slate-400">
              Dijkstra Dynamic Cost Engine
            </span>
          </div>
        </div>
        <button
          onClick={onRefresh}
          title="Recalculate Route"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Candidate Tabs if alternatives exist */}
      {allCandidates.length > 1 && (
        <div className="flex gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          {allCandidates.map((c, idx) => (
            <button
              key={`cand-${idx}`}
              onClick={() => {
                setSelectedCandidateIndex(idx);
                if (onSelectAlternative) onSelectAlternative(c);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                selectedCandidateIndex === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {idx === 0 ? 'Optimal Route' : `Alternative ${idx}`}
            </button>
          ))}
        </div>
      )}

      {/* Primary Route Metrics */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Destination ({currentRoute.destination_type})
            </div>
            <div className="text-base font-extrabold text-white">
              {currentRoute.destination_name}
            </div>
          </div>
          <StatusBadge status={currentRoute.risk_level} size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">Walking Distance</div>
              <div className="font-bold text-white">{currentRoute.total_distance_meters} meters</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">Est. Traversal Time</div>
              <div className="font-bold text-white">{currentRoute.estimated_time_minutes} minutes</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 italic pt-1 leading-relaxed">
          "{currentRoute.explanation}"
        </p>
      </div>

      {/* Sequential Turn-by-Turn Steps */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Waypoint Path Breakdown</span>
          <span className="text-[10px] text-slate-500">{currentRoute.path_nodes.length} nodes</span>
        </div>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {currentRoute.path_nodes.map((step, idx) => (
            <div
              key={`step-${idx}`}
              className="flex items-center gap-2.5 text-xs p-2 rounded-lg bg-slate-800/40 border border-slate-800/60"
            >
              <div className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-white block truncate">{step.node_name}</span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {step.node_type} • {step.zone_name || 'Corridor'}
                </span>
              </div>
              {idx === currentRoute.path_nodes.length - 1 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimer Tag */}
      <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/20 text-[11px] text-amber-300/90 leading-tight">
        <Info className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
        <strong>Simulated Route:</strong> Requires verified clearance by campus emergency personnel before real-world adoption.
      </div>
    </div>
  );
};
