import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from './bookingService';
import { useNotification } from './NotificationContext';
import { DigitalTicketCard } from './components/common/DigitalTicketCard';
import { TableSkeleton } from './components/common/LoadingSkeleton';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const MyBookingsPage = () => {
  const { addToast } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Modal states
  const [selectedBookingForTickets, setSelectedBookingForTickets] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancelModalBooking) return;

    try {
      setCancelling(true);
      await bookingService.cancelBooking(cancelModalBooking.id, cancelReason);
      addToast({ type: 'success', message: 'Booking cancelled. Inventory restored.' });
      setCancelModalBooking(null);
      fetchBookings();
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.error || 'Failed to cancel booking.' });
    } finally {
      setCancelling(false);
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const pastBookings = bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REFUNDED' || b.status === 'FAILED');

  const displayedBookings = activeTab === 'active' ? activeBookings : pastBookings;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Attendee Wallet
          </span>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            My Bookings & QR Passes
          </h1>
        </div>

        {/* Tabs Switcher */}
        <div className="flex bg-slate-200/80 dark:bg-dark-500 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-white dark:bg-dark-400 text-primary-600 dark:text-primary-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Active Passes ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-white dark:bg-dark-400 text-primary-600 dark:text-primary-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Past & Cancelled ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : displayedBookings.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-dark-500 text-primary-500 mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            {activeTab === 'active' ? 'No Active Bookings' : 'No Past Bookings'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeTab === 'active'
              ? "You haven't booked any upcoming events yet. Explore upcoming summits and concerts!"
              : 'Any cancelled or expired bookings will appear here.'}
          </p>
          <Link
            to="/events"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-xs shadow-md"
          >
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedBookings.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-3xl glass-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-slate-200 dark:border-dark-300"
            >
              {/* Event Image & Info */}
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center flex-1">
                <img
                  src={b.event_details?.display_banner}
                  alt={b.event_details?.title}
                  className="w-full sm:w-36 h-28 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-dark-400 flex-shrink-0"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-dark-500 text-slate-700 dark:text-slate-300">
                      {b.booking_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <Link
                    to={`/events/${b.event_details?.slug}`}
                    className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white hover:text-primary-600 block transition-colors"
                  >
                    {b.event_details?.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      <span>{new Date(b.event_details?.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-500" />
                      <span>{b.event_details?.venue_name || b.event_details?.city}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                      <Ticket className="w-3.5 h-3.5 text-primary-500" />
                      <span>{b.tickets?.length || b.items?.length || 1} Passes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-dark-400">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Paid</span>
                  <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                    ₹{Number(b.final_amount).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => setSelectedBookingForTickets(b)}
                        className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 inline-flex items-center gap-1.5 transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View QR Passes</span>
                      </button>

                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR TICKETS MODAL */}
      {selectedBookingForTickets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-dark-500 rounded-3xl p-6 max-w-2xl w-full my-8 space-y-6 shadow-2xl border border-slate-200 dark:border-dark-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-400">
              <div className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary-500" />
                <span>Digital QR Event Passes</span>
              </div>
              <button
                onClick={() => setSelectedBookingForTickets(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              {selectedBookingForTickets.tickets?.map((t) => (
                <DigitalTicketCard key={t.id} ticket={t} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CANCEL BOOKING MODAL */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-500 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-dark-300 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Cancel Booking #{cancelModalBooking.booking_number}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cancelling will invalidate your QR passes and release the reserved tickets back into public inventory.
            </p>

            <form onSubmit={handleCancelBooking} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400 text-xs"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Emergency conflict">Emergency conflict</option>
                  <option value="Booked by mistake">Booked by mistake</option>
                  <option value="Travel arrangement issue">Travel arrangement issue</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-400"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
