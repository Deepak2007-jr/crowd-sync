import React, { useState, useEffect } from 'react';
import { CampusMap } from '../components/map/CampusMap';
import { NodeDetailsPanel } from '../components/map/NodeDetailsPanel';
import { MapLegend } from '../components/map/MapLegend';
import { mapService } from '../services/mapService';
import { alertService } from '../services/alertService';
import { hazardService } from '../services/hazardService';
import { CampusMapData, CampusNode, CampusZone, EmergencyAlert, HazardReport } from '../types';
import { MapPin, Compass, Layers, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MapExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [mapData, setMapData] = useState<CampusMapData | null>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [selectedNode, setSelectedNode] = useState<CampusNode | null>(null);
  const [selectedZone, setSelectedZone] = useState<CampusZone | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [mData, aData, hData] = await Promise.all([
          mapService.getCampusMap(),
          alertService.getAlerts('Active'),
          hazardService.getHazards(),
        ]);
        setMapData(mData);
        setAlerts(aData);
        setHazards(hData);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-emerald-400" />
            Interactive Campus Map Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore academic blocks, emergency exits, assembly grounds, and live simulated crowd density heatmaps.
          </p>
        </div>

        <button
          onClick={() => navigate('/evacuation')}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          Launch Evacuation Engine
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {mapData ? (
            <CampusMap
              mapData={mapData}
              activeAlerts={alerts}
              hazardReports={hazards}
              onSelectNode={(node) => {
                setSelectedNode(node);
                if (node.zone_id) {
                  setSelectedZone(mapData.zones.find((z) => z.id === node.zone_id) || null);
                }
              }}
              onSelectZone={(zone) => {
                setSelectedZone(zone);
                setSelectedNode(null);
              }}
            />
          ) : (
            <div className="h-[580px] glass-panel rounded-2xl flex items-center justify-center">
              <span className="text-xs text-slate-400">Loading campus layout...</span>
            </div>
          )}
          <MapLegend />
        </div>

        <div className="space-y-4">
          {selectedNode || selectedZone ? (
            <NodeDetailsPanel
              selectedNode={selectedNode}
              selectedZone={selectedZone}
              alerts={alerts}
              exits={mapData?.exits || []}
              assemblyPoints={mapData?.assembly_points || []}
              onClose={() => {
                setSelectedNode(null);
                setSelectedZone(null);
              }}
            />
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Select a Building or Zone</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any zone to inspect live crowd numbers, check for hazards, and compute immediate evacuation paths.
              </p>
            </div>
          )}

          {/* Quick Zone Directory list */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Campus Facilities Directory
            </h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {mapData?.zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone(zone);
                    setSelectedNode(null);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{zone.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {zone.estimated_occupancy} / {zone.capacity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
