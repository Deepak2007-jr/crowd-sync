import api from './api';
import { EvacuationRouteResponse, EvacuationSimulationLog } from '../types';

export interface RouteRequestPayload {
  starting_node_id: number;
  prefer_accessible?: boolean;
  target_type?: 'exit' | 'assembly_point';
}

export const evacuationService = {
  getRoute: async (payload: RouteRequestPayload): Promise<EvacuationRouteResponse> => {
    const res = await api.post<EvacuationRouteResponse>('/evacuation/route', {
      starting_node_id: payload.starting_node_id,
      prefer_accessible: payload.prefer_accessible || false,
      target_type: payload.target_type || 'exit',
    });
    return res.data;
  },

  getHistory: async (): Promise<EvacuationSimulationLog[]> => {
    const res = await api.get<EvacuationSimulationLog[]>('/evacuation/history');
    return res.data;
  },
};
