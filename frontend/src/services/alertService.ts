import api from './api';
import { EmergencyAlert } from '../types';

export interface CreateAlertPayload {
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Fire' | 'Medical' | 'Overcrowding' | 'Blocked Exit' | 'Other';
  zone_id?: number | null;
}

export const alertService = {
  getAlerts: async (status?: string): Promise<EmergencyAlert[]> => {
    const params = status ? { status } : {};
    const res = await api.get<EmergencyAlert[]>('/alerts', { params });
    return res.data;
  },

  createAlert: async (payload: CreateAlertPayload): Promise<EmergencyAlert> => {
    const res = await api.post<EmergencyAlert>('/alerts', payload);
    return res.data;
  },

  resolveAlert: async (alertId: number): Promise<EmergencyAlert> => {
    const res = await api.post<EmergencyAlert>(`/alerts/${alertId}/resolve`);
    return res.data;
  },
};
