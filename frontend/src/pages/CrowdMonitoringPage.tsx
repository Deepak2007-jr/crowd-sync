import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Sliders,
  Clock,
  Shield,
  Layers,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { crowdService } from '../services/crowdService';
import { CrowdStatus, CampusZone } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';
import { useAuth } from '../hooks/useAuth';

export const CrowdMonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const [crowdData, setCrowdData] = useState<CrowdStatus | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [occupancyEdits, setOccupancyEdits] = useState<{ [zoneId: number]: number }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const loadCrowd = async () => {
    try {
      const [status, history] = await Promise.all([
        crowdService.getStatus(),
        crowdService.getHistory(),
      ]);
      setCrowdData(status);
      setLastUpdated(new Date().toLocaleTimeString());

      // Format snapshot history for Recharts
      const formatted = history.snapshots.map((s: any) => ({
        time: s.recorded_at ? new Date(s.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        occupants: s.estimated_occupancy,
        zone: s.zone_name,
      }));
      setHistoryData(formatted);

      // Populate local edit states
      const edits: { [k: number]: number } = {};
      status.zones.forEach((z) => {
        edits[z.id] = z.estimated_occupancy;
      });
      setOccupancyEdits(edits);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCrowd();
    const interval = setInterval(loadCrowd, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyOccupancy = async (zoneId: number) => {
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      const val = occupancyEdits[zoneId] || 0;
      await crowdService.updateOccupancy(zoneId, val);
      setUpdateMsg(`Occupancy updated successfully for Zone #${zoneId}.`);
      loadCrowd();
    } catch (err: any) {
      setUpdateMsg(err.response?.data?.detail || 'Failed to update occupancy.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getBarColor = (pct: number) => {
    if (pct >= 90) return '#EF4444'; // Red
    if (pct >= 75) return '#F97316'; // Orange
    if (pct >= 50) return '#EAB308'; // Amber
    return '#10B981'; // Green
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-blue-400 tracking-wider">
              Real-Time Campus Telemetry
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-400" />
            Campus Crowd Monitoring Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitors live and historical pedestrian load, venue capacities, and density classifications.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-slate-300">
            Data Source: <span className="text-blue-400 font-mono">Simulated Demo Data</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Last Updated: {lastUpdated || 'Synchronizing...'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Estimated Attendees"
          value={crowdData?.total_estimated_attendees || 0}
          subtitle={`Max Safe Capacity: ${crowdData?.total_campus_capacity || 0}`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          trend={`${crowdData?.overall_occupancy_percentage || 0}% Total Load`}
          trendType={
            (crowdData?.overall_occupancy_percentage || 0) > 85 ? 'critical' : 'positive'
          }
        />

        <MetricCard
          title="Monitored Campus Zones"
          value={crowdData?.total_monitored_zones || 0}
          subtitle="Lecture blocks, grounds & cafes"
          icon={<Layers className="w-5 h-5 text-indigo-400" />}
          trend="All Monitored"
          trendType="positive"
        />

        <MetricCard
          title="High & Critical Zones"
          value={
            (crowdData?.high_density_zones || 0) + (crowdData?.critical_density_zones || 0)
          }
          subtitle={`${crowdData?.critical_density_zones || 0} Critical (>90%)`}
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          trend={
            (crowdData?.critical_density_zones || 0) > 0 ? 'Surge Warning' : 'Within Limits'
          }
          trendType={
            (crowdData?.critical_density_zones || 0) > 0 ? 'critical' : 'positive'
          }
        />

        <MetricCard
          title="Low & Moderate Zones"
          value={
            (crowdData?.low_density_zones || 0) + (crowdData?.moderate_density_zones || 0)
          }
          subtitle="Operating under 75% load"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          trend="Optimal Flow"
          trendType="positive"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Historical Crowd Trend */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Crowd Density Trend Over Time
              </h3>
              <p className="text-xs text-slate-400">
                Hourly occupancy records across campus zones
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">6-Hour Window</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="occupants"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#occupancyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Zone Occupancy Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Zone-Wise Occupancy vs Capacity
              </h3>
              <p className="text-xs text-slate-400">
                Comparative load percentage across all 6 monitored areas
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crowdData?.zones || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={11} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Occupancy Ratio']}
                />
                <Bar dataKey="occupancy_percentage" radius={[0, 6, 6, 0]}>
                  {(crowdData?.zones || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.occupancy_percentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zone Occupancy Detailed Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Campus Zone Detailed Breakdown
          </h2>
          {isAdmin && (
            <span className="text-xs text-blue-400 font-semibold">
              Admin Manual Adjustment Enabled
            </span>
          )}
        </div>

        {updateMsg && (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300">
            {updateMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {crowdData?.zones.map((zone) => {
            const isExceeded = zone.occupancy_percentage >= 90;
            return (
              <div
                key={zone.id}
                className={`glass-panel p-5 rounded-2xl border transition space-y-4 ${
                  isExceeded ? 'border-red-600/60 bg-red-950/15' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{zone.name}</h3>
                    <span className="text-xs text-slate-400 capitalize">{zone.zone_type} Zone</span>
                  </div>
                  <StatusBadge status={zone.crowd_status} size="sm" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Occupants / Capacity</span>
                    <span className="font-bold text-white">
                      {zone.estimated_occupancy} / {zone.capacity}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
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

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <span>Density Ratio: {zone.occupancy_percentage}%</span>
                    {isExceeded && (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overload Warning
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin Occupancy Updater */}
                {isAdmin && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <label className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-blue-400" /> Adjust Sample Occupancy:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={zone.capacity * 2}
                        value={occupancyEdits[zone.id] ?? zone.estimated_occupancy}
                        onChange={(e) =>
                          setOccupancyEdits({
                            ...occupancyEdits,
                            [zone.id]: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        onClick={() => handleApplyOccupancy(zone.id)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
