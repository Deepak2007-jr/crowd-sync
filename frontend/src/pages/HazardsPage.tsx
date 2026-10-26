import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  FileText,
  Filter
} from 'lucide-react';
import { hazardService, CreateHazardPayload } from '../services/hazardService';
import { mapService } from '../services/mapService';
import { HazardReport, CampusZone } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';

export const HazardsPage: React.FC = () => {
  const { user } = useAuth();
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [zones, setZones] = useState<CampusZone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState('Blocked Exit');
  const [zoneId, setZoneId] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [hData, mData] = await Promise.all([
        hazardService.getHazards(),
        mapService.getCampusMap(),
      ]);
      setHazards(hData);
      setZones(mData.zones);
      if (mData.zones.length > 0 && !zoneId) {
        setZoneId(mData.zones[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await hazardService.createHazard({
        category,
        description,
        zone_id: zoneId,
      });
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setDescription('');
        loadData();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
              Community Incident & Hazard Reporting
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
            Campus Hazard Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Report blocked stairways, crowd bottlenecks, slippery walkways, or safety hazards for prompt warden resolution.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Submit Hazard Report
        </button>
      </div>

      {/* Hazard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hazards.map((h) => (
          <div
            key={h.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-xs tracking-wide uppercase">
                  {h.category}
                </span>
                <StatusBadge status={h.status} size="sm" />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{h.description}</p>

              {h.resolution_notes && (
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300 space-y-0.5">
                  <span className="font-semibold block text-[10px] uppercase text-emerald-400">
                    Resolution Notes
                  </span>
                  <span>{h.resolution_notes}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Zone: <strong>{h.zone_name}</strong></span>
                <span>{h.reporter_name}</span>
              </div>
              <div className="text-[10px]">
                {new Date(h.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Hazard / Blocked Exit Report"
      >
        {success ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-base">Report Received</h4>
            <p className="text-xs text-slate-400">
              Campus safety personnel have logged your report. Thank you for keeping campus safe!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Blocked Exit">Blocked Exit / Obstruction</option>
                <option value="Excessive Crowding">Excessive Crowding / Surge</option>
                <option value="Slippery Floor">Slippery Floor / Spillage</option>
                <option value="Smoke or Fire">Smoke or Fire Observation</option>
                <option value="Medical Assistance">Medical Assistance Request</option>
                <option value="Other Hazard">Other Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Zone</label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Details & Location</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specific room, corridor, or details of obstruction..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
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
                disabled={loading}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
