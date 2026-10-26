import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MapExplorerPage } from './pages/MapExplorerPage';
import { EvacuationPage } from './pages/EvacuationPage';
import { CrowdMonitoringPage } from './pages/CrowdMonitoringPage';
import { AlertsPage } from './pages/AlertsPage';
import { HazardsPage } from './pages/HazardsPage';
import { EventsPage } from './pages/EventsPage';
import { AssemblyPointsPage } from './pages/AssemblyPointsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardRouter } from './pages/DashboardRouter';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portal Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapExplorerPage />} />
            <Route path="/evacuation" element={<EvacuationPage />} />
            <Route path="/crowd" element={<CrowdMonitoringPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/hazards" element={<HazardsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/assembly-points" element={<AssemblyPointsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Standalone Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Command Center Dashboard */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardRouter />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
