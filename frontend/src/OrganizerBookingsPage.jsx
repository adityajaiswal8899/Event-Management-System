import React, { useState, useEffect } from 'react';
import { bookingService } from './bookingService';
import { TableSkeleton } from './components/common/LoadingSkeleton';
import { Ticket, Users, Search, Download, CheckCircle2, Clock, Calendar } from 'lucide-react';

export const OrganizerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getOrganizerBookings();
        setBookings(data);
      } catch (err) {
        console.error('Failed to load organizer bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.attendee_name?.toLowerCase().includes(term) ||
      b.attendee_email?.toLowerCase().includes(term) ||
      b.booking_number?.toLowerCase().includes(term) ||
      b.event_details?.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Attendee Roster & Bookings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View all attendee reservations and check-in readiness across your hosted events.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search attendee name, email, booking #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center space-y-3 max-w-md mx-auto">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            No Bookings Found
          </h3>
          <p className="text-xs text-slate-500">Attendee reservations will show up here once tickets are purchased.</p>
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-slate-200 dark:border-dark-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-600/80 border-b border-slate-200 dark:border-dark-400 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Booking #</th>
                  <th className="p-4">Attendee</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Passes</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-400 font-medium text-slate-700 dark:text-slate-200">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-400/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {b.booking_number}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{b.attendee_name}</div>
                      <div className="text-[11px] text-slate-400">{b.attendee_email}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-800 dark:text-slate-200">
                      {b.event_details?.title}
                    </td>
                    <td className="p-4">
                      {b.items?.map((item, i) => (
                        <div key={i} className="text-[11px]">
                          {item.ticket_type_details?.name} (×{item.quantity})
                        </div>
                      )) || '1 Pass'}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      ₹{Number(b.final_amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString()}
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
