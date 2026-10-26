import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { crowdService } from '../services/crowdService';
import { CampusEvent, CampusZone } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [zones, setZones] = useState<CampusZone[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [eData, cData] = await Promise.all([
          eventService.getEvents(),
          crowdService.getStatus(),
        ]);
        setEvents(eData);
        setZones(cData.zones);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.venue_name && e.venue_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-purple-400 tracking-wider">
              Campus Gathering Schedule
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-purple-400" />
            Campus Events Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Overview of upcoming fests, conferences, symposia, and expected venue occupancy.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events or venues..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => {
          const venue = zones.find((z) => z.id === evt.venue_id);
          const ratio = venue && venue.capacity > 0 ? (evt.expected_attendance / venue.capacity) * 100 : 0;

          return (
            <div
              key={evt.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {evt.event_date}
                  </span>
                  <StatusBadge status={evt.status} size="sm" />
                </div>

                <h3 className="font-bold text-white text-lg leading-snug">{evt.name}</h3>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Venue: <strong className="text-white">{evt.venue_name || `Zone #${evt.venue_id}`}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Time: <strong className="text-slate-300">{evt.start_time}</strong></span>
                  </div>
                </div>

                {/* Venue Capacity Meter */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected Attendees:</span>
                    <span className="font-bold text-white">{evt.expected_attendance}</span>
                  </div>
                  {venue && (
                    <div className="flex justify-between text-slate-400">
                      <span>Venue Seating Limit:</span>
                      <span>{venue.capacity} seats</span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        ratio >= 90 ? 'bg-red-500' : ratio >= 75 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/evacuation?start=${evt.venue_id}`}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  View Evacuation Route →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
