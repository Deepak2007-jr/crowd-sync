import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Users,
  LogOut,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Plus,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { crowdService } from '../services/crowdService';
import { alertService } from '../services/alertService';
import { hazardService } from '../services/hazardService';
import { eventService } from '../services/eventService';
import { mapService } from '../services/mapService';
import {
  CampusZone,
  EmergencyAlert,
  HazardReport,
  CampusEvent,
  CampusNode,
  EmergencyExit,
  AssemblyPoint
} from '../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [zones, setZones] = useState<CampusZone[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [nodes, setNodes] = useState<CampusNode[]>([]);
  const [exits, setExits] = useState<EmergencyExit[]>([]);
  const [assemblyPoints, setAssemblyPoints] = useState<AssemblyPoint[]>([]);

  // Selected current location of the student
  const [myLocationNodeId, setMyLocationNodeId] = useState<number>(4); // Default: Grand Auditorium
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Hazard report form state
  const [reportCategory, setReportCategory] = useState('Blocked Exit');
  const [reportZoneId, setReportZoneId] = useState<number>(1);
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crowdData, alertData, eventData, mapData] = await Promise.all([
          crowdService.getStatus(),
          alertService.getAlerts('Active'),
          eventService.getEvents(),
          mapService.getCampusMap(),
        ]);
        setZones(crowdData.zones);
        setAlerts(alertData);
        setEvents(eventData);
        setNodes(mapData.nodes.filter((n) => n.node_type === 'building' || n.node_type === 'intersection'));
        setExits(mapData.exits);
        setAssemblyPoints(mapData.assembly_points);
        if (crowdData.zones.length > 0) {
          setReportZoneId(crowdData.zones[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleStartEvacuation = () => {
    navigate(`/evacuation?start=${myLocationNodeId}`);
  };

  const handleSubmitHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      await hazardService.createHazard({
        category: reportCategory,
        description: reportDesc,
        zone_id: reportZoneId,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportDesc('');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === myLocationNodeId);
  const currentZone = zones.find((z) => z.id === selectedNode?.zone_id);

  return (
    <div className="space-y-6">
      {/* Welcome & Campus Safety Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-blue-400 tracking-wider">
              Student / Visitor Safety Portal
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor real-time campus crowd levels, check active safety notices, and request immediate evacuation routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Report Hazard / Blocked Exit
          </button>

          <button
            onClick={handleStartEvacuation}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/30 animate-pulse-subtle"
          >
            <Compass className="w-4 h-4" />
            Start Evacuation Guidance
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency Guidance Quick Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: My Current Location */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> Current Location
            </span>
            {currentZone && <StatusBadge status={currentZone.crowd_status} size="sm" />}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Select where you are right now:</label>
            <select
              value={myLocationNodeId}
              onChange={(e) => setMyLocationNodeId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>

          {currentZone && (
            <div className="text-xs text-slate-300 pt-1">
              Estimated Zone Occupancy: <strong>{currentZone.estimated_occupancy}</strong> / {currentZone.capacity} ({currentZone.occupancy_percentage}%)
            </div>
          )}
        </div>

        {/* Card 2: Nearest Emergency Exits */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5 text-emerald-400" /> Nearest Exit Gates
          </span>
          <div className="space-y-2">
            {exits.slice(0, 2).map((exit) => (
              <div key={exit.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{exit.name}</span>
                <span className="text-emerald-400 text-[11px] font-bold">Available</span>
              </div>
            ))}
          </div>
          <Link to="/map" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold pt-1">
            View on Interactive Map <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Designated Assembly Points */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" /> Safe Assembly Grounds
          </span>
          <div className="space-y-2">
            {assemblyPoints.map((ap) => (
              <div key={ap.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{ap.name.split('-')[0]}</span>
                  <span className="text-[10px] text-slate-400">Cap: {ap.configured_capacity}</span>
                </div>
                <span className="text-blue-400 text-[11px] font-bold">Step-free</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Campus Alerts Section */}
      {alerts.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-amber-800/40 bg-amber-950/15 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>Active Campus Emergency Alerts ({alerts.length})</span>
            </div>
            <Link to="/alerts" className="text-xs text-amber-300 hover:text-amber-200 font-semibold">
              View All Alerts →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{alert.title}</span>
                  <StatusBadge status={alert.severity} size="sm" />
                </div>
                <p className="text-xs text-slate-300">{alert.description}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Zone: {alert.zone_name || 'Campus Wide'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone Crowd Summary Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Campus Zone Crowd Status
          </h2>
          <Link to="/crowd" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
            Detailed Crowd Analytics →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{zone.name}</h3>
                  <span className="text-[11px] text-slate-400 capitalize">{zone.zone_type}</span>
                </div>
                <StatusBadge status={zone.crowd_status} size="sm" />
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Occupancy</span>
                  <span className="font-bold">{zone.estimated_occupancy} / {zone.capacity}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      zone.occupancy_percentage >= 90
                        ? 'bg-red-500'
                        : zone.occupancy_percentage >= 75
                        ? 'bg-orange-500'
                        : zone.occupancy_percentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, zone.occupancy_percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>{zone.occupancy_percentage}% capacity</span>
                  <span className="italic">Simulated Data</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ongoing Campus Events */}
      {events.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Scheduled Campus Events
            </h2>
            <Link to="/events" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
              Event Directory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((evt) => (
              <div key={evt.id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">{evt.event_date}</span>
                  <StatusBadge status={evt.status} size="sm" />
                </div>
                <h4 className="font-bold text-white text-sm">{evt.name}</h4>
                <div className="text-xs text-slate-400">
                  Venue: <span className="text-slate-200">{evt.venue_name}</span> • {evt.start_time}
                </div>
                <div className="text-[11px] text-slate-400">
                  Expected Attendance: <strong>{evt.expected_attendance}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Hazard Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Campus Hazard or Blocked Exit"
      >
        {reportSuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-base">Hazard Report Submitted</h4>
            <p className="text-xs text-slate-400">
              Campus Safety Officers have been notified and will verify the report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitHazard} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Category</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Blocked Exit">Blocked Exit / Corridor Obstruction</option>
                <option value="Excessive Crowding">Excessive Crowding / Stampede Risk</option>
                <option value="Slippery Floor">Slippery Floor / Spillage</option>
                <option value="Smoke or Fire">Smoke or Fire Observation</option>
                <option value="Medical Assistance">Medical Assistance Request</option>
                <option value="Other Hazard">Other Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Campus Zone</label>
              <select
                value={reportZoneId}
                onChange={(e) => setReportZoneId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Details</label>
              <textarea
                required
                rows={3}
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Describe exact corridor, landmarks, or nature of blockage..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportLoading}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {reportLoading ? 'Submitting...' : 'Submit Hazard Report'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
