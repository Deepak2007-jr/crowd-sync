import React from 'react';
import { Compass, PhoneCall, ShieldAlert, Heart, ExternalLink, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070B14] border-t border-slate-800/80 text-slate-400 text-sm mt-auto">
      {/* Disclaimer Banner */}
      <div className="bg-amber-950/20 border-b border-amber-800/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-amber-300 font-medium">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>ACADEMIC PROTOTYPE NOTICE:</strong> All crowd densities, sensor figures, and evacuation paths are simulated for college demonstration purposes. In a real emergency, official campus safety personnel, sirens, and emergency responders take precedence.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                CROWD<span className="text-blue-500">-SYNC</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Crowd-Sync is an intelligent campus safety and emergency evacuation system.
              Empowering students, organizers, and emergency officers with dynamic Dijkstra routing,
              zone-based crowd analytics, and live incident mitigation.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-red-400 font-medium">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Campus Emergency Desk: +1 (800) 555-SAFE</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/map" className="hover:text-blue-400 transition">Interactive Campus Map</Link>
              </li>
              <li>
                <Link to="/evacuation" className="hover:text-blue-400 transition">Evacuation Route Engine</Link>
              </li>
              <li>
                <Link to="/crowd" className="hover:text-blue-400 transition">Crowd Monitoring Board</Link>
              </li>
              <li>
                <Link to="/assembly-points" className="hover:text-blue-400 transition">Assembly Points Directory</Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-blue-400 transition">Safety Analytics & CSV Export</Link>
              </li>
            </ul>
          </div>

          {/* Emergency Protocols */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Emergency Protocols
            </h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Code Red / Evacuation</span>
              </div>
              <p className="text-[11px] text-slate-400">
                1. Avoid elevators.<br />
                2. Move to nearest designated exit.<br />
                3. Assemble at Central Oval or South Athletic Field.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Crowd-Sync Campus Safety System. Academic Demonstration.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Simulation Engine Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
