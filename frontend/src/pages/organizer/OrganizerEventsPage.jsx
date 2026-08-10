import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useNotification } from '../../context/NotificationContext';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Calendar,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';

export const OrganizerEventsPage = () => {
  const { addToast } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getOrganizerEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch organizer events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await eventService.deleteEvent(id);
      addToast({ type: 'success', message: 'Event deleted successfully.' });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to delete event.' });
    }
  };

  const filteredEvents = activeTab === 'ALL'
    ? events
    : events.filter((e) => e.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">Live Published</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">Pending Review</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Draft</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">Changes Requested</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Manage My Events
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish, edit schedules, manage ticket tiers, and view attendance.
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Event</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 bg-slate-200/70 dark:bg-dark-500 p-1 rounded-2xl w-fit">
        {[
          { id: 'ALL', label: 'All Events' },
          { id: 'PUBLISHED', label: 'Live Published' },
          { id: 'PENDING_APPROVAL', label: 'Pending Approval' },
          { id: 'DRAFT', label: 'Drafts' },
          { id: 'REJECTED', label: 'Needs Changes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-dark-400 text-primary-600 dark:text-primary-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Table / Card List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center space-y-4 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            No Events Found in this View
          </h3>
          <Link
            to="/organizer/events/create"
            className="inline-block px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-slate-200 dark:border-dark-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-600/80 border-b border-slate-200 dark:border-dark-400 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Event</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Seats Left</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-400 font-medium text-slate-700 dark:text-slate-200">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-400/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ev.display_banner}
                          alt={ev.title}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-dark-400 flex-shrink-0"
                        />
                        <div className="max-w-xs">
                          <Link
                            to={`/events/${ev.slug}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-primary-600 truncate block"
                          >
                            {ev.title}
                          </Link>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {ev.venue_name || ev.city || 'Virtual'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {ev.category?.name || 'General'}
                    </td>

                    <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      <div>{new Date(ev.start_date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{ev.start_time?.slice(0, 5)}</div>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(ev.status)}
                    </td>

                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {ev.available_seats} / {ev.total_seats}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/events/${ev.slug}`}
                          title="View Public Page"
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-400 text-slate-600 dark:text-slate-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/organizer/events/edit/${ev.id}`}
                          title="Edit Event"
                          className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/40 text-primary-600 dark:text-primary-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(ev.id, ev.title)}
                          title="Delete Event"
                          className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
