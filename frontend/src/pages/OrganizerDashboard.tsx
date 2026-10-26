import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Users,
  MapPin,
  AlertTriangle,
  Clock,
  Trash2,
  Edit,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { eventService, CreateEventPayload } from '../services/eventService';
import { crowdService } from '../services/crowdService';
import { hazardService } from '../services/hazardService';
import { CampusEvent, CampusZone, HazardReport } from '../types';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [zones, setZones] = useState<CampusZone[]>([]);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Create Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [venueId, setVenueId] = useState<number>(1);
  const [eventDate, setEventDate] = useState('2026-11-01');
  const [startTime, setStartTime] = useState('10:00');
  const [expectedAttendance, setExpectedAttendance] = useState<number>(150);
  const [eventStatus, setEventStatus] = useState('Scheduled');
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [eventsData, crowdData, hazardsData] = await Promise.all([
        eventService.getEvents(),
        crowdService.getStatus(),
        hazardService.getHazards(),
      ]);
      setEvents(eventsData);
      setZones(crowdData.zones);
      setHazards(hazardsData);
      if (crowdData.zones.length > 0 && !venueId) {
        setVenueId(crowdData.zones[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingEventId(null);
    setName('');
    setEventDate('2026-11-01');
    setStartTime('10:00');
    setExpectedAttendance(150);
    setEventStatus('Scheduled');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (evt: CampusEvent) => {
    setEditingEventId(evt.id);
    setName(evt.name);
    setVenueId(evt.venue_id);
    setEventDate(evt.event_date);
    setStartTime(evt.start_time);
    setExpectedAttendance(evt.expected_attendance);
    setEventStatus(evt.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const venue = zones.find((z) => z.id === venueId);
    if (venue && expectedAttendance > venue.capacity * 1.5) {
      setFormError(`Attendance (${expectedAttendance}) exceeds safe limit for ${venue.name} (Max: ${venue.capacity})`);
      return;
    }

    try {
      if (editingEventId) {
        await eventService.updateEvent(editingEventId, {
          name,
          venue_id: venueId,
          event_date: eventDate,
          start_time: startTime,
          expected_attendance: expectedAttendance,
          status: eventStatus,
        });
      } else {
        await eventService.createEvent({
          name,
          venue_id: venueId,
          event_date: eventDate,
          start_time: startTime,
          expected_attendance: expectedAttendance,
          status: eventStatus,
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">
              Event Operations & Crowd Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Event Organizer Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Schedule campus gatherings, monitor venue crowd limits, and oversee safety compliance.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </button>
      </div>

      {/* Events Table / Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          Managed Campus Events ({events.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => {
            const venue = zones.find((z) => z.id === evt.venue_id);
            const loadRatio = venue && venue.capacity > 0 ? (evt.expected_attendance / venue.capacity) * 100 : 0;
            const isHighLoad = loadRatio > 80;

            return (
              <div
                key={evt.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">{evt.event_date}</span>
                    <StatusBadge status={evt.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug">{evt.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Venue: {evt.venue_name || `Zone #${evt.venue_id}`}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Time: {evt.start_time}</span>
                  </div>

                  {/* Capacity & Attendance Indicator */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Attendance</span>
                      <span className="font-bold text-white">{evt.expected_attendance}</span>
                    </div>
                    {venue && (
                      <div className="flex justify-between text-slate-400">
                        <span>Venue Capacity</span>
                        <span>{venue.capacity} seats</span>
                      </div>
                    )}
                    {isHighLoad && (
                      <div className="text-amber-400 text-[11px] font-semibold flex items-center gap-1 pt-1">
                        <AlertTriangle className="w-3 h-3" />
                        High Expected Venue Load ({Math.round(loadRatio)}%)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => openEditModal(evt)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Edit Event"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/40 text-red-400 transition"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reported Hazards in Monitored Event Zones */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Hazards in Event Venues ({hazards.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hazards.slice(0, 4).map((h) => (
            <div key={h.id} className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{h.category}</span>
                <StatusBadge status={h.status} size="sm" />
              </div>
              <p className="text-xs text-slate-300">{h.description}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Zone: {h.zone_name}</span>
                <span>Reported by: {h.reporter_name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEventId ? 'Edit Campus Event' : 'Create New Campus Event'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Annual Tech Symposium"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Campus Zone</label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} (Max Capacity: {z.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Attendance</label>
              <input
                type="number"
                min={1}
                required
                value={expectedAttendance}
                onChange={(e) => setExpectedAttendance(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="py-2 px-3.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              {editingEventId ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
