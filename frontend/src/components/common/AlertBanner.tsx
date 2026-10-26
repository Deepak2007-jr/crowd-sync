import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, X, ChevronRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmergencyAlert } from '../../types';

interface AlertBannerProps {
  alerts: EmergencyAlert[];
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts }) => {
  const [dismissed, setDismissed] = useState(false);

  // Filter only active high or critical alerts for banner
  const criticalAlerts = alerts.filter(
    (a) => a.status === 'Active' && (a.severity === 'Critical' || a.severity === 'High')
  );

  if (dismissed || criticalAlerts.length === 0) {
    return null;
  }

  const activeAlert = criticalAlerts[0];
  const isCritical = activeAlert.severity === 'Critical';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`border-b transition-all duration-300 ${
        isCritical
          ? 'bg-red-950/80 border-red-600/50 text-red-100'
          : 'bg-amber-950/80 border-amber-600/50 text-amber-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isCritical ? 'bg-red-600/30 text-red-300' : 'bg-amber-600/30 text-amber-300'
            }`}
          >
            {isCritical ? <ShieldAlert className="w-5 h-5 animate-bounce" /> : <AlertTriangle className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs uppercase font-extrabold px-2 py-0.5 rounded tracking-wide ${
                  isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-slate-900'
                }`}
              >
                {activeAlert.severity} ALERT
              </span>
              <span className="font-semibold text-sm sm:text-base">
                {activeAlert.title}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {activeAlert.description} • Affected Zone: <span className="font-semibold text-white">{activeAlert.zone_name || 'Campus Wide'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <Link
            to="/evacuation"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
              isCritical
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            Evacuation Guide
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss Alert Banner"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
