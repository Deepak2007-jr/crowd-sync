import api from './api';
import { CampusMapData, EmergencyExit, AssemblyPoint, CampusPath } from '../types';

export const mapService = {
  getCampusMap: async (): Promise<CampusMapData> => {
    const res = await api.get<CampusMapData>('/map');
    return res.data;
  },

  getExits: async (): Promise<EmergencyExit[]> => {
    const res = await api.get<EmergencyExit[]>('/exits');
    return res.data;
  },

  getAssemblyPoints: async (): Promise<AssemblyPoint[]> => {
    const res = await api.get<AssemblyPoint[]>('/assembly-points');
    return res.data;
  },

  togglePathBlocked: async (pathId: number): Promise<CampusPath> => {
    const res = await api.patch<CampusPath>(`/map/paths/${pathId}/toggle-block`);
    return res.data;
  },
};
