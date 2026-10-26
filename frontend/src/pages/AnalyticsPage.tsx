import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  ShieldAlert,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  PieChart as PieIcon,
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { analyticsService, AnalyticsOverview } from '../services/analyticsService';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [crowdData, setCrowdData] = useState<any[]>([]);
  const [incidentData, setIncidentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [oData, cData, iData] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getCrowdDistribution(),
          analyticsService.getIncidentAnalytics(),
        ]);
        setOverview(oData);
        setCrowdData(cData.zones);
        setIncidentData(iData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await analyticsService.exportCsvReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crowd_sync_campus_audit_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  // Prepare Pie Chart data for Alert Severity
  const alertSeverityData = incidentData?.alert_severity
    ? Object.entries(incidentData.alert_severity).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const SEVERITY_COLORS: { [k: string]: string } = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#EAB308',
    Low: '#10B981',
  };

  // Prepare Hazard Categories data
  const hazardCategoryData = incidentData?.hazard_categories
    ? Object.entries(incidentData.hazard_categories).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider">
              Safety Intelligence & Historical Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-teal-400" />
            Safety Analytics & Reporting
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive telemetry summaries, alert classifications, and exportable campus safety audits.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/30 flex items-center gap-2 transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Download CSV Audit Report'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Safety Readiness Score"
          value={`${overview?.safety_readiness_score || 90}%`}
          subtitle="Dynamic preparedness index"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          trend="Optimal Readiness"
          trendType="positive"
        />

        <MetricCard
          title="Estimated Campus Occupants"
          value={overview?.total_attendees || 0}
          subtitle={`Capacity: ${overview?.total_capacity || 0}`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          trend={`${overview?.overall_percentage || 0}% Total Load`}
          trendType="positive"
        />

        <MetricCard
          title="Total Incidents & Alerts"
          value={incidentData?.total_alerts || 0}
          subtitle={`${overview?.active_alerts || 0} Active Notices`}
          icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
          trend="Logged in System"
          trendType="neutral"
        />

        <MetricCard
          title="Reported Campus Hazards"
          value={incidentData?.total_hazards || 0}
          subtitle={`${overview?.pending_hazards || 0} Awaiting Action`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          trend="Field Observations"
          trendType="neutral"
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Alerts Breakdown by Severity */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Emergency Alerts by Severity
            </h3>
            <span className="text-xs text-slate-400">Total: {incidentData?.total_alerts || 0}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertSeverityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {alertSeverityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEVERITY_COLORS[entry.name] || '#64748B'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hazard Reports by Category */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Hazard Reports by Category
            </h3>
            <span className="text-xs text-slate-400">Total: {incidentData?.total_hazards || 0}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hazardCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campus Zones Occupancy Breakdown Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Zone Occupancy & Capacity Audit
          </h3>
          <span className="text-xs text-slate-400">Data Source: Simulated Demo Data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Zone Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Current Occupants</th>
                <th className="py-3 px-4">Load %</th>
                <th className="py-3 px-4 text-right">Crowd Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {crowdData.map((z) => (
                <tr key={z.zone_id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{z.name}</td>
                  <td className="py-3 px-4 capitalize text-slate-400">{z.zone_type}</td>
                  <td className="py-3 px-4 text-slate-300">{z.capacity}</td>
                  <td className="py-3 px-4 font-semibold text-white">{z.occupancy}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono">{z.percentage}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={z.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
