import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  ShieldAlert,
  Users,
  AlertTriangle,
  ArrowRight,
  Shield,
  LifeBuoy,
  CheckCircle2,
  Lock,
  ChevronRight,
  Flame,
  Radio,
  FileText
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { crowdService } from '../services/crowdService';
import { alertService } from '../services/alertService';
import { CrowdStatus, EmergencyAlert } from '../types';

export const LandingPage: React.FC = () => {
  const { demoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [crowdData, setCrowdData] = useState<CrowdStatus | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    const loadQuickStats = async () => {
      try {
        const [crowd, alerts] = await Promise.all([
          crowdService.getStatus(),
          alertService.getAlerts('Active'),
        ]);
        setCrowdData(crowd);
        setActiveAlerts(alerts);
      } catch (err) {
        console.error(err);
      }
    };
    loadQuickStats();
  }, []);

  const handleQuickDemo = async (role: 'student' | 'organizer' | 'admin') => {
    await demoLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Intelligent Event Safety & Dynamic Evacuation System
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Every Second Counts.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Every Exit Matters.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Crowd-Sync guides students, event organizers, and campus emergency personnel with real-time
            crowd monitoring, Dijkstra-based safe route recommendations, and instant incident response.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/evacuation"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition group"
            >
              <Compass className="w-4 h-4 text-cyan-300 group-hover:rotate-45 transition-transform" />
              Emergency Evacuation Guide
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/map"
              className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-bold text-sm border border-slate-700 shadow-lg flex items-center gap-2 transition"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Explore Interactive Campus Map
            </Link>
          </div>

          {/* 1-Click Demo Account Quick Access */}
          <div className="pt-8 max-w-xl mx-auto">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Instant Demonstration Access
                </span>
                <span className="text-slate-500 text-[11px]">No password typing required</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickDemo('student')}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-blue-600/20 text-slate-200 hover:text-blue-300 border border-slate-700 text-xs font-semibold transition"
                >
                  Student / Visitor
                </button>
                <button
                  onClick={() => handleQuickDemo('organizer')}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600/20 text-slate-200 hover:text-indigo-300 border border-slate-700 text-xs font-semibold transition"
                >
                  Event Organizer
                </button>
                <button
                  onClick={() => handleQuickDemo('admin')}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-600/20 text-slate-200 hover:text-emerald-300 border border-slate-700 text-xs font-semibold transition"
                >
                  Safety Officer (Admin)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Telemetry Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Active Monitored Zones</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {crowdData?.total_monitored_zones || 6} Zones
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">Live Status Synchronized</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Estimated Campus Occupants</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {crowdData?.total_estimated_attendees || 1130} Attendees
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {crowdData?.overall_occupancy_percentage || 38}% Campus Load
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Emergency Exits & Assembly</span>
            <div className="text-2xl font-extrabold text-white mt-1">4 Exits / 2 Grounds</div>
            <span className="text-[11px] text-blue-400 mt-1 block">Ramps & Corridors Mapped</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Emergency Readiness</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">94% Safe</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {activeAlerts.length} Active Notice{activeAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Emergency Preparedness
          </h2>
          <p className="text-sm text-slate-400">
            Engineered to safeguard campuses through mathematical path optimization, real-time telemetry, and clear communication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-blue-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Crowd Monitoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time occupancy metrics for lecture blocks, auditoriums, and cafeterias with automated capacity threshold alerts.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Smart Route Guidance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic Dijkstra routing factors in crowd congestion and blocked corridors to recommend the safest, not just mathematically shortest, path.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-red-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Emergency Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant campus-wide broadcasting of critical hazard warnings including fire incidents, severe overcrowding, and blocked exits.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Hazard Reporting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students and visitors can submit instant field reports on blocked stairways or spills, enabling safety officers to respond rapidly.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Protocol Guide Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-950/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs uppercase font-extrabold text-blue-400 tracking-wider">
                Emergency Instructions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                What to Do in a Campus Emergency
              </h2>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span><strong>Stay Calm & Alert:</strong> Listen for campus siren announcements and follow directions from safety wardens.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span><strong>Avoid Elevators:</strong> Always use designated stairwells and external emergency stair towers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span><strong>Check the Route Engine:</strong> Use Crowd-Sync to verify whether primary corridors are congested or obstructed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span><strong>Report to Assembly Points:</strong> Convene at Central Oval or South Athletic Lawn for headcount verification.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-400" />
                Emergency Contact Directory
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Campus Police & Safety Command</span>
                  <span className="text-red-400 font-bold font-mono">+1 (800) 555-SAFE</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Campus Health & Paramedics</span>
                  <span className="text-red-400 font-bold font-mono">+1 (800) 555-MED1</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Facilities & Fire Wardens</span>
                  <span className="text-amber-400 font-bold font-mono">+1 (800) 555-FIRE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
