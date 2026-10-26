import React from 'react';
import { Shield, AlertTriangle, LogOut, CheckCircle2, Flame, Ban } from 'lucide-react';

export const MapLegend: React.FC = () => {
  return (
    <div className="glass-panel rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300">
      <div className="font-bold text-white mb-2 flex items-center justify-between">
        <span>Map Legend</span>
        <span className="text-[10px] text-slate-400 font-normal">Interactive SVG Layout</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <span>Low Crowd (&lt;50%)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/60 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
          <span>Moderate (50-75%)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-orange-500/20 border border-orange-500/60 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          </div>
          <span>High (75-90%)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-red-500/20 border border-red-500/60 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          </div>
          <span>Critical (&gt;90%)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
            <LogOut className="w-2.5 h-2.5" />
          </div>
          <span>Emergency Exit</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            <Shield className="w-2.5 h-2.5" />
          </div>
          <span>Assembly Point</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-1 border-b-2 border-dashed border-red-500" />
          <span className="flex items-center gap-1 text-red-400 font-semibold">
            <Ban className="w-3 h-3" /> Blocked Corridor
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-cyan-400 shadow-sm shadow-cyan-400/50" />
          <span className="text-cyan-300 font-semibold">Recommended Route</span>
        </div>
      </div>
    </div>
  );
};
