import React from 'react';
import { CampusNode, CampusZone, EmergencyAlert, EmergencyExit, AssemblyPoint } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MapPin, Users, Compass, ShieldAlert, LogOut, Shield, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NodeDetailsPanelProps {
  selectedNode: CampusNode | null;
  selectedZone: CampusZone | null;
  alerts: EmergencyAlert[];
  exits: EmergencyExit[];
  assemblyPoints: AssemblyPoint[];
  onClose: () => void;
  onSelectStartLocation?: (nodeId: number) => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  selectedNode,
  selectedZone,
  alerts,
  exits,
  assemblyPoints,
  onClose,
  onSelectStartLocation,
}) => {
  const navigate = useNavigate();

  if (!selectedNode && !selectedZone) return null;

  const relevantAlerts = alerts.filter(
    (a) => a.status === 'Active' && (selectedZone ? a.zone_id === selectedZone.id : true)
  );

  const handleEvacuateHere = () => {
    if (selectedNode) {
      if (onSelectStartLocation) {
        onSelectStartLocation(selectedNode.id);
      }
      navigate(`/evacuation?start=${selectedNode.id}`);
    }
  };

  return (
    <div className="glass-panel bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl relative w-full max-w-sm">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mt-0.5">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-base leading-snug">
            {selectedNode ? selectedNode.name : selectedZone?.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 capitalize">
              {selectedNode ? selectedNode.node_type : selectedZone?.zone_type}
            </span>
            {selectedZone && <StatusBadge status={selectedZone.crowd_status} size="sm" />}
          </div>
        </div>
      </div>

      {/* Zone Occupancy Metrics if available */}
      {selectedZone && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Current Occupancy
            </span>
            <span className="font-bold text-white">
              {selectedZone.estimated_occupancy} / {selectedZone.capacity}
            </span>
          </div>

          {/* Occupancy Progress Bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                selectedZone.occupancy_percentage >= 90
                  ? 'bg-red-500'
                  : selectedZone.occupancy_percentage >= 75
                  ? 'bg-orange-500'
                  : selectedZone.occupancy_percentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, selectedZone.occupancy_percentage)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>Density Ratio: {selectedZone.occupancy_percentage}%</span>
            <span className="italic text-slate-500">Simulated Demo Data</span>
          </div>
        </div>
      )}

      {/* Active Alerts in Zone */}
      {relevantAlerts.length > 0 && (
        <div className="mt-3.5 p-3 rounded-xl bg-red-950/40 border border-red-800/40 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Active Hazard / Emergency Alert</span>
          </div>
          {relevantAlerts.map((alt) => (
            <p key={alt.id} className="text-xs text-slate-300">
              • <strong>{alt.title}:</strong> {alt.description}
            </p>
          ))}
        </div>
      )}

      {/* Accessibility Badge */}
      {selectedNode && (
        <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
          <span>Wheelchair Step-Free Access:</span>
          <span
            className={`font-semibold ${
              selectedNode.accessibility_verified ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {selectedNode.accessibility_verified ? 'Verified Accessible' : 'Stairs / Unverified'}
          </span>
        </div>
      )}

      {/* Action Button */}
      {selectedNode && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={handleEvacuateHere}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
          >
            <Compass className="w-4 h-4" />
            Start Evacuation Guidance from Here
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
