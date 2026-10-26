import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AlertBanner } from '../components/common/AlertBanner';
import { EmergencyAlert } from '../types';
import { alertService } from '../services/alertService';

export const MainLayout: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertService.getAlerts('Active');
        setAlerts(data);
      } catch (err) {
        console.error('Failed to load active alerts', err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // 10s poll
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1120] text-slate-100">
      <AlertBanner alerts={alerts} />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
