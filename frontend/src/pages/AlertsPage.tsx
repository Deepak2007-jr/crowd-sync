import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Flame,
  Radio,
  Clock,
  MapPin
} from 'lucide-react';
import { alertService, CreateAlertPayload } from '../services/alertService';
import { mapService } from '../services/mapService';
import { EmergencyAlert, CampusZone } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [zones, setZones] = useState<CampusZone[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [category, setCategory] = useState<'Fire' | 'Medical' | 'Overcrowding' | 'Blocked Exit' | 'Other'>('Overcrowding');
  const [zoneId, setZoneId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [alertsData, mapData] = await Promise.all([
        alertService.getAlerts(),
        mapService.getCampusMap(),
      ]);
      setAlerts(alertsData);
      setZones(mapData.zones);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await alertService.createAlert({
        title,
        description,
        severity,
        category,
        zone_id: zoneId,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await alertService.resolveAlert(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'Active') return a.status === 'Active';
    if (statusFilter === 'Resolved') return a.status === 'Resolved';
    return true;
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-red-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-red-400 tracking-wider">
              Emergency Broadcasting & Incident Log
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-red-400" />
            Campus Emergency Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Official emergency notices broadcasted across campus digital boards and student guides.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Broadcast Emergency Alert
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['All', 'Active', 'Resolved'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter} Alerts
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">{filteredAlerts.length} notices</span>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'Critical';
          const isResolved = alert.status === 'Resolved';

          return (
            <div
              key={alert.id}
              className={`glass-panel p-5 rounded-2xl border transition space-y-4 flex flex-col justify-between ${
                !isResolved && isCritical
                  ? 'border-red-600/70 bg-red-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={alert.severity} size="sm" />
                  <StatusBadge status={alert.status} size="sm" />
                </div>

                <h3 className="font-bold text-white text-base leading-snug">{alert.title}</h3>

                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Zone: <strong className="text-white">{alert.zone_name || 'All Campus'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-slate-500" />
                    <span>Category: <strong className="text-white">{alert.category}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {isAdmin && alert.status === 'Active' && (
                <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Broadcast Alert Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Emergency Campus Alert"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smoke Detected near CS Labs"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Fire">Fire</option>
                <option value="Medical">Medical</option>
                <option value="Overcrowding">Overcrowding</option>
                <option value="Blocked Exit">Blocked Exit</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Zone</label>
            <select
              value={zoneId || ''}
              onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Campus Wide / Multiple Locations</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Advice</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State clear instructions for campus occupants..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
    </div>
  );
};
