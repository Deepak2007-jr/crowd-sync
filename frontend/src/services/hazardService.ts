import api from './api';
import { HazardReport } from '../types';

export interface CreateHazardPayload {
  category: string;
  description: string;
  zone_id: number;
}

export interface UpdateHazardPayload {
  status?: 'Pending' | 'Under Review' | 'Resolved';
  resolution_notes?: string;
}

export const hazardService = {
  getHazards: async (status?: string): Promise<HazardReport[]> => {
    const params = status ? { status } : {};
    const res = await api.get<HazardReport[]>('/hazards', { params });
    return res.data;
  },

  createHazard: async (payload: CreateHazardPayload): Promise<HazardReport> => {
    const res = await api.post<HazardReport>('/hazards', payload);
    return res.data;
  },

  updateHazard: async (hazardId: number, payload: UpdateHazardPayload): Promise<HazardReport> => {
    const res = await api.patch<HazardReport>(`/hazards/${hazardId}`, payload);
    return res.data;
  },
};
