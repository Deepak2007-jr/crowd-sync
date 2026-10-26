import React, { useState, useEffect } from 'react';
import {
  Shield,
  MapPin,
  Users,
  CheckCircle2,
  Accessibility,
  ArrowRight,
  Info
} from 'lucide-react';
import { mapService } from '../services/mapService';
import { AssemblyPoint, CampusNode } from '../types';
import { Link } from 'react-router-dom';

export const AssemblyPointsPage: React.FC = () => {
  const [assemblyPoints, setAssemblyPoints] = useState<AssemblyPoint[]>([]);
  const [nodes, setNodes] = useState<CampusNode[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const mapData = await mapService.getCampusMap();
        setAssemblyPoints(mapData.assembly_points);
        setNodes(mapData.nodes);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold text-blue-400 tracking-wider">
            Safe Zones & Muster Points
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-blue-400" />
          Campus Assembly Point Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Designated outdoor staging grounds equipped with triage zones and wide concrete evacuation routes.
          Report here during any building evacuation for official headcounts.
        </p>
      </div>

      {/* Assembly Points Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assemblyPoints.map((ap) => {
          const node = nodes.find((n) => n.id === ap.node_id);

          return (
            <div
              key={ap.id}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
                      AP-{ap.id}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{ap.name}</h2>
                      <span className="text-xs text-slate-400">Designated Evacuation Muster Ground</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    Verified Safe Zone
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Configured Safe Capacity</span>
                    <div className="text-xl font-extrabold text-white">{ap.configured_capacity}</div>
                    <span className="text-[10px] text-slate-500 italic">Open-air standing limit</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Wheelchair Access</span>
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                      <Accessibility className="w-4 h-4" /> Step-Free Ramps
                    </div>
                    <span className="text-[10px] text-slate-500">Paved concrete pathways</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-white block">Accessibility & Reaching Instructions:</span>
                  <p className="text-slate-300 leading-relaxed">
                    {ap.accessibility_information || 'Wide step-free pathways connecting adjacent buildings.'}
                  </p>
                  <p className="text-slate-400 text-[11px] pt-1">
                    • In emergencies, exit buildings via exterior fire doors.<br />
                    • Assemble with your department banner or assigned faculty safety warden.<br />
                    • Do not re-enter campus buildings until the "ALL CLEAR" horn sounds.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/map`}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  Locate on Campus Map <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/evacuation?target=assembly_point`}
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
                >
                  Route to this Point
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
