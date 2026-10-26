import api from './api';

export interface AnalyticsOverview {
  total_attendees: number;
  total_capacity: number;
  overall_percentage: number;
  monitored_zones: number;
  active_alerts: number;
  pending_hazards: number;
  total_events: number;
  safety_readiness_score: number;
}

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const res = await api.get<AnalyticsOverview>('/analytics/overview');
    return res.data;
  },

  getCrowdDistribution: async (): Promise<{ zones: any[] }> => {
    const res = await api.get('/analytics/crowd');
    return res.data;
  },

  getIncidentAnalytics: async (): Promise<any> => {
    const res = await api.get('/analytics/incidents');
    return res.data;
  },

  exportCsvReport: async (): Promise<Blob> => {
    const res = await api.get('/analytics/export', {
      responseType: 'blob',
    });
    return res.data;
  },
};
