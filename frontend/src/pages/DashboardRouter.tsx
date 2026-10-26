import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AdminDashboard } from './AdminDashboard';
import { OrganizerDashboard } from './OrganizerDashboard';
import { StudentDashboard } from './StudentDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'organizer') {
    return <OrganizerDashboard />;
  }

  return <StudentDashboard />;
};
