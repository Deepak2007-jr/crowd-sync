import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  MapPin,
  Compass,
  Users,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/common/StatusBadge';
import { AlertBanner } from '../components/common/AlertBanner';
import { alertService } from '../services/alertService';
import { EmergencyAlert } from '../types';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertService.getAlerts('Active');
        setAlerts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Role Dashboard', path: '/dashboard', icon: <Shield className="w-4 h-4 text-blue-400" /> },
    { label: 'Campus Map', path: '/map', icon: <MapPin className="w-4 h-4 text-emerald-400" /> },
    { label: 'Evacuation Guide', path: '/evacuation', icon: <Compass className="w-4 h-4 text-cyan-400" /> },
    { label: 'Crowd Monitoring', path: '/crowd', icon: <Users className="w-4 h-4 text-indigo-400" /> },
    { label: 'Emergency Alerts', path: '/alerts', icon: <ShieldAlert className="w-4 h-4 text-red-400" /> },
    { label: 'Hazard Reports', path: '/hazards', icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
    { label: 'Campus Events', path: '/events', icon: <Calendar className="w-4 h-4 text-purple-400" /> },
    { label: 'Assembly Points', path: '/assembly-points', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
    { label: 'Analytics & Reports', path: '/analytics', icon: <BarChart3 className="w-4 h-4 text-teal-400" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      <AlertBanner alerts={alerts} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-[#090E1A] border-r border-slate-800 shrink-0">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">CROWD-SYNC</span>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400">Control Center</span>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[140px]">{user?.name}</span>
              <StatusBadge status={user?.role || 'student'} size="sm" />
            </div>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">{user?.email}</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out / Bottom link */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-2 py-1.5 transition"
            >
              <Home className="w-4 h-4" /> Back to Public Portal
            </Link>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-red-950/20 hover:bg-red-900/40 text-red-400 text-xs font-semibold border border-red-800/30 flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar for Mobile & Breadcrumbs */}
          <header className="h-16 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                aria-label="Toggle navigation sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link to="/" className="hover:text-white">Portal</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white font-medium capitalize">
                  {location.pathname.replace('/', '') || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2.5 py-1 rounded-full">
                System Active • Demo Mode
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Mobile Drawer */}
          {sidebarOpen && (
            <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                    location.pathname === item.path
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Page Body */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
