import api from './api';
import { CampusEvent } from '../types';

export interface CreateEventPayload {
  name: string;
  venue_id: number;
  event_date: string;
  start_time: string;
  expected_attendance: number;
  status?: string;
}

export const eventService = {
  getEvents: async (): Promise<CampusEvent[]> => {
    const res = await api.get<CampusEvent[]>('/events');
    return res.data;
  },

  createEvent: async (payload: CreateEventPayload): Promise<CampusEvent> => {
    const res = await api.post<CampusEvent>('/events', payload);
    return res.data;
  },

  updateEvent: async (eventId: number, payload: Partial<CreateEventPayload>): Promise<CampusEvent> => {
    const res = await api.put<CampusEvent>(`/events/${eventId}`, payload);
    return res.data;
  },

  deleteEvent: async (eventId: number): Promise<void> => {
    await api.delete(`/events/${eventId}`);
  },
};
