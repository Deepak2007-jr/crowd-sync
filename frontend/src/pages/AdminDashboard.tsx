import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  Users,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Plus,
  MapPin,
  Download,
  Clock,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { CampusMap } from '../components/map/CampusMap';
import { NodeDetailsPanel } from '../components/map/NodeDetailsPanel';
import { SimulationControls } from '../components/map/SimulationControls';
import { MapLegend } from '../components/map/MapLegend';

import { crowdService } from '../services/crowdService';
import { alertService, CreateAlertPayload } from '../services/alertService';
import { hazardService } from '../services/hazardService';
import { mapService } from '../services/mapService';
import { evacuationService } from '../services/evacuationService';
import { analyticsService } from '../services/analyticsService';

import {
  CrowdStatus,
  EmergencyAlert,
  HazardReport,
  CampusMapData,
  CampusNode,
  CampusZone,
  EvacuationSimulationLog
} from '../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [crowdData, setCrowdData] = useState<CrowdStatus | null>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [mapData, setMapData] = useState<CampusMapData | null>(null);
  const [simHistory, setSimHistory] = useState<EvacuationSimulationLog[]>([]);

  // Selected node / zone for map inspection
  const [selectedNode, setSelectedNode] = useState<CampusNode | null>(null);
  const [selectedZone, setSelectedZone] = useState<CampusZone | null>(null);

  // Create Alert Modal State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [alertCategory, setAlertCategory] = useState<'Fire' | 'Medical' | 'Overcrowding' | 'Blocked Exit' | 'Other'>('Overcrowding');
  const [alertZoneId, setAlertZoneId] = useState<number | null>(null);

  // Review Hazard Modal State
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState<HazardReport | null>(null);
  const [hazardStatus, setHazardStatus] = useState<'Pending' | 'Under Review' | 'Resolved'>('Under Review');
  const [hazardNotes, setHazardNotes] = useState('');

  // Zone Occupancy Slider State
  const [occupancyEdits, setOccupancyEdits] = useState<{ [zoneId: number]: number }>({});
  const [isSavingOccupancy, setIsSavingOccupancy] = useState(false);

  const loadAll = async () => {
    try {
      const [cData, aData, hData, mData, sHistory] = await Promise.all([
        crowdService.getStatus(),
        alertService.getAlerts(),
        hazardService.getHazards(),
        mapService.getCampusMap(),
        evacuationService.getHistory(),
      ]);
      setCrowdData(cData);
      setAlerts(aData);
      setHazards(hData);
      setMapData(mData);
      setSimHistory(sHistory);

      // Initialize occupancy edits
      const edits: { [k: number]: number } = {};
      cData.zones.forEach((z) => {
        edits[z.id] = z.estimated_occupancy;
      });
      setOccupancyEdits(edits);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await alertService.createAlert({
        title: alertTitle,
        description: alertDesc,
        severity: alertSeverity,
        category: alertCategory,
        zone_id: alertZoneId,
      });
      setIsAlertModalOpen(false);
      setAlertTitle('');
      setAlertDesc('');
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (id: number) => {
    try {
      await alertService.resolveAlert(id);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const openReviewHazard = (h: HazardReport) => {
    setSelectedHazard(h);
    setHazardStatus(h.status as any);
    setHazardNotes(h.resolution_notes || '');
    setIsHazardModalOpen(true);
  };

  const handleUpdateHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHazard) return;
    try {
      await hazardService.updateHazard(selectedHazard.id, {
        status: hazardStatus,
        resolution_notes: hazardNotes,
      });
      setIsHazardModalOpen(false);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOccupancySliderChange = (zoneId: number, val: number) => {
    setOccupancyEdits((prev) => ({ ...prev, [zoneId]: val }));
  };

  const handleApplyOccupancy = async (zoneId: number) => {
    setIsSavingOccupancy(true);
    try {
      const val = occupancyEdits[zoneId] || 0;
      await crowdService.updateOccupancy(zoneId, val);
      loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingOccupancy(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await analyticsService.exportCsvReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crowd_sync_campus_audit_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'Active');
  const pendingHazards = hazards.filter((h) => h.status !== 'Resolved');

  return (
    <div className="space-y-8">
      {/* Top Command Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
              Emergency Command & Safety Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Campus Safety Officer Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time zone monitoring, emergency alert dispatch, hazard review, and dynamic evacuation simulation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Safety CSV
          </button>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Broadcast Emergency Alert
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Campus Zones"
          value={crowdData?.total_monitored_zones || 6}
          subtitle="All zones actively synchronized"
          icon={<MapPin className="w-5 h-5 text-blue-400" />}
          trend="100% Online"
          trendType="positive"
        />

        <MetricCard
          title="Campus Estimated Occupancy"
          value={crowdData?.total_estimated_attendees || 0}
          subtitle={`Capacity: ${crowdData?.total_campus_capacity || 3000}`}
          icon={<Users className="w-5 h-5 text-indigo-400" />}
          trend={`${crowdData?.overall_occupancy_percentage || 0}% Total Load`}
          trendType={
            (crowdData?.overall_occupancy_percentage || 0) > 80 ? 'critical' : 'positive'
          }
        />

        <MetricCard
          title="Active Emergency Alerts"
          value={activeAlerts.length}
          subtitle="Requiring safety attention"
          icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
          trend={activeAlerts.length > 0 ? 'Action Required' : 'All Clear'}
          trendType={activeAlerts.length > 0 ? 'critical' : 'positive'}
        />

        <MetricCard
          title="Pending Hazard Reports"
          value={pendingHazards.length}
          subtitle="Reported by students & staff"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          trend={`${hazards.filter((h) => h.status === 'Resolved').length} Resolved`}
          trendType="neutral"
        />
      </div>

      {/* Simulation Controls & Scenario Trigger */}
      <SimulationControls onScenarioChange={loadAll} />

      {/* Interactive Map & Detail Inspector Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            Campus Emergency Telemetry Map
          </h2>
          <span className="text-xs text-slate-400">Click any zone or node to inspect</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {mapData && (
              <CampusMap
                mapData={mapData}
                activeAlerts={activeAlerts}
                hazardReports={hazards}
                onSelectNode={(node) => {
                  setSelectedNode(node);
                  if (node.zone_id && mapData) {
                    setSelectedZone(mapData.zones.find((z) => z.id === node.zone_id) || null);
                  }
                }}
                onSelectZone={(zone) => {
                  setSelectedZone(zone);
                  setSelectedNode(null);
                }}
              />
            )}
            <MapLegend />
          </div>

          <div className="space-y-4">
            {/* Inspector Panel */}
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
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                <MapPin className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Select Map Element</h4>
                <p className="text-xs text-slate-400">
                  Click on any campus building, corridor junction, exit, or assembly point to view occupancy, capacity, and active alerts.
                </p>
              </div>
            )}

            {/* Quick Live Occupancy Adjustment Card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  Live Crowd Density Adjuster
                </span>
                <span className="text-[10px] text-slate-500">Demo Sliders</span>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {crowdData?.zones.map((zone) => (
                  <div key={zone.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{zone.name}</span>
                      <span className="text-slate-400">
                        {occupancyEdits[zone.id] ?? zone.estimated_occupancy} / {zone.capacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max={zone.capacity * 1.1}
                        value={occupancyEdits[zone.id] ?? zone.estimated_occupancy}
                        onChange={(e) => handleOccupancySliderChange(zone.id, Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <button
                        onClick={() => handleApplyOccupancy(zone.id)}
                        disabled={isSavingOccupancy}
                        className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold shrink-0 transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alerts Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Emergency Alerts Registry
            </h2>
            <p className="text-xs text-slate-400">Active and resolved campus incident alerts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Affected Zone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <StatusBadge status={alert.severity} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {alert.title}
                    <span className="block text-[11px] text-slate-400 font-normal">{alert.description}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{alert.category}</td>
                  <td className="py-3 px-4 text-slate-300">{alert.zone_name || 'All Campus'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={alert.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {alert.status === 'Active' && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition"
                      >
                        Resolve Alert
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hazard Reports Queue */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Reported Safety Hazards Queue
            </h2>
            <p className="text-xs text-slate-400">Field hazards reported by students and staff awaiting action</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {hazards.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{h.category}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                    {h.description}
                    {h.resolution_notes && (
                      <span className="block text-[10px] text-emerald-400">Notes: {h.resolution_notes}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{h.zone_name}</td>
                  <td className="py-3 px-4 text-slate-400">{h.reporter_name}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={h.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openReviewHazard(h)}
                      className="py-1 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-bold transition"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evacuation Simulation History Log */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Recent Simulation & Evacuation Audits
          </h2>
        </div>

        <div className="space-y-2">
          {simHistory.slice(0, 5).map((sim) => (
            <div key={sim.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">{sim.name}</span>
                <span className="text-[11px] text-slate-400">{sim.route_summary}</span>
              </div>
              <StatusBadge status={sim.simulation_status} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Create Alert Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Broadcast Campus Emergency Alert"
      >
        <form onSubmit={handleCreateAlert} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Title</label>
            <input
              type="text"
              required
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              placeholder="e.g. Code Red - Fire Accident in Chemistry Wing"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
              <select
                value={alertSeverity}
                onChange={(e) => setAlertSeverity(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Category</label>
              <select
                value={alertCategory}
                onChange={(e) => setAlertCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Fire">Fire Incident</option>
                <option value="Medical">Medical Emergency</option>
                <option value="Overcrowding">Severe Overcrowding</option>
                <option value="Blocked Exit">Blocked Exit / Stairway</option>
                <option value="Other">Other Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Campus Zone</label>
            <select
              value={alertZoneId || ''}
              onChange={(e) => setAlertZoneId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Campus Wide / Multiple Locations</option>
              {mapData?.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Instruction & Description</label>
            <textarea
              required
              rows={3}
              value={alertDesc}
              onChange={(e) => setAlertDesc(e.target.value)}
              placeholder="Immediate directions for students and staff..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(false)}
              className="py-2 px-3.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
            >
              Broadcast Alert
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Hazard Modal */}
      <Modal
        isOpen={isHazardModalOpen}
        onClose={() => setIsHazardModalOpen(false)}
        title="Review & Update Hazard Report"
      >
        {selectedHazard && (
          <form onSubmit={handleUpdateHazard} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800 text-xs space-y-1">
              <span className="font-bold text-white block">{selectedHazard.category}</span>
              <p className="text-slate-300">{selectedHazard.description}</p>
              <span className="text-[11px] text-slate-500 block pt-1">
                Zone: {selectedHazard.zone_name} • Reported by: {selectedHazard.reporter_name}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Investigation Status</label>
              <select
                value={hazardStatus}
                onChange={(e) => setHazardStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Pending">Pending Verification</option>
                <option value="Under Review">Under Review / Wardens Dispatched</option>
                <option value="Resolved">Resolved / Hazard Cleared</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Notes</label>
              <textarea
                rows={3}
                value={hazardNotes}
                onChange={(e) => setHazardNotes(e.target.value)}
                placeholder="State actions taken to verify or resolve the hazard..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsHazardModalOpen(false)}
                className="py-2 px-3.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
              >
                Update Report
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
