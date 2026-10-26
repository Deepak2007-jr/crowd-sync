import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Flame, ShieldCheck, Play, ArrowRight, Ban } from 'lucide-react';
import { crowdService } from '../../services/crowdService';

interface SimulationControlsProps {
  onScenarioChange: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ onScenarioChange }) => {
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleTriggerScenario = async () => {
    setLoading(true);
    try {
      const res = await crowdService.triggerScenario();
      setLastAction('Scenario Active: Auditorium surge (96% critical) + Corridor #7 blocked.');
      onScenarioChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetScenario = async () => {
    setLoading(true);
    try {
      await crowdService.resetScenario();
      setLastAction('Scenario Reset: Corridors unblocked and normal baseline restored.');
      onScenarioChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Safety Simulation & Demo Controls
            </h4>
            <p className="text-[11px] text-slate-400">
              Simulate emergency bottlenecks & observe dynamic Dijkstra rerouting
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleTriggerScenario}
          disabled={loading}
          className="py-2.5 px-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Simulate Auditorium Surge & Blocked Path
        </button>

        <button
          onClick={handleResetScenario}
          disabled={loading}
          className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Scenario
        </button>
      </div>

      {lastAction && (
        <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/30 text-xs text-blue-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{lastAction}</span>
        </div>
      )}
    </div>
  );
};
