import api from './api';
import { CrowdStatus, CampusZone } from '../types';

export const crowdService = {
  getStatus: async (): Promise<CrowdStatus> => {
    const res = await api.get<CrowdStatus>('/crowd/status');
    return res.data;
  },

  getHistory: async (): Promise<{ data_source: string; snapshots: any[] }> => {
    const res = await api.get('/crowd/history');
    return res.data;
  },

  updateOccupancy: async (zoneId: number, estimatedOccupancy: number): Promise<CampusZone> => {
    const res = await api.patch<CampusZone>(`/zones/${zoneId}/occupancy`, {
      estimated_occupancy: estimatedOccupancy,
    });
    return res.data;
  },

  triggerScenario: async (): Promise<any> => {
    const res = await api.post('/crowd/simulate-scenario');
    return res.data;
  },

  resetScenario: async (): Promise<any> => {
    const res = await api.post('/crowd/reset-scenario');
    return res.data;
  },
};
