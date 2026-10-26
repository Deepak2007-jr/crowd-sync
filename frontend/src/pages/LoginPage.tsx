import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Compass, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Demo login failed. Please ensure the backend is running and seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-600/30">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in to Crowd-Sync</h2>
          <p className="text-xs text-slate-400">Campus Event Evacuation & Safety Management Guide</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Accounts Section */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="text-center">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Quick Demonstration Accounts
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoClick('student')}
              className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/80 flex items-center justify-between transition group"
            >
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-blue-400">
                  Student / Visitor Demo
                </span>
                <span className="text-[10px] text-slate-400">student@campus.edu</span>
              </div>
              <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('organizer')}
              className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/80 flex items-center justify-between transition group"
            >
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-indigo-400">
                  Event Organizer Demo
                </span>
                <span className="text-[10px] text-slate-400">organizer@campus.edu</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/80 flex items-center justify-between transition group"
            >
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-emerald-400">
                  Safety Officer (Admin) Demo
                </span>
                <span className="text-[10px] text-slate-400">admin@campus.edu</span>
              </div>
              <Lock className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
            Register as a Student
          </Link>
        </div>
      </div>
    </div>
  );
};
