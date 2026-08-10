import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/bookingService';
import { useNotification } from '../../context/NotificationContext';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  X
} from 'lucide-react';

export const AdminEventsPage = () => {
  const { addToast } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');

  // Reject modal
  const [rejectEventTarget, setRejectEventTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Event details do not meet platform publishing guidelines.');
  const [processing, setProcessing] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingApprovals(statusFilter);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load moderation events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const handleApprove = async (id, title) => {
    try {
      setProcessing(true);
      await adminService.approveEvent(id);
      addToast({ type: 'success', message: `"${title}" has been approved and is now live!` });
      fetchEvents();
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to approve event.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectEventTarget) return;

    try {
      setProcessing(true);
      await adminService.rejectEvent(rejectEventTarget.id, rejectionReason);
      addToast({ type: 'info', message: `Event "${rejectEventTarget.title}" rejected.` });
      setRejectEventTarget(null);
      fetchEvents();
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to reject event.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Event Moderation & Approvals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review event submissions from organizers before they are published to the public catalog.
          </p>
        </div>

        <div className="flex bg-slate-200/70 dark:bg-dark-500 p-1 rounded-2xl">
          {[
            { id: 'PENDING_APPROVAL', label: 'Pending Review' },
            { id: 'PUBLISHED', label: 'Approved & Live' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-dark-400 text-primary-600 dark:text-primary-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : events.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center space-y-3 max-w-md mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Queue is Clear!
          </h3>
          <p className="text-xs text-slate-500">No events currently waiting for {statusFilter.replace('_', ' ').toLowerCase()}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-dark-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center flex-1">
                <img
                  src={ev.display_banner}
                  alt={ev.title}
                  className="w-full sm:w-36 h-28 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-dark-400 flex-shrink-0"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                      {ev.category?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Submitted by <strong>{ev.organizer?.organization_name || ev.organizer?.full_name}</strong>
                    </span>
                  </div>

                  <Link
                    to={`/events/${ev.slug}`}
                    className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white hover:text-primary-600 block transition-colors"
                  >
                    {ev.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      <span>{new Date(ev.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-500" />
                      <span>{ev.venue_name || ev.city}</span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{ev.lowest_price} - ₹{ev.highest_price} ({ev.total_seats} seats)
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-dark-400">
                <Link
                  to={`/events/${ev.slug}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-dark-500 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Link>

                {statusFilter === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleApprove(ev.id, ev.title)}
                      disabled={processing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      onClick={() => setRejectEventTarget(ev)}
                      disabled={processing}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectEventTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-500 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-dark-300 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Reject Event Submission?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide feedback for <strong>{rejectEventTarget.organizer?.organization_name || 'Organizer'}</strong> so they can make necessary amendments.
            </p>

            <form onSubmit={handleReject} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectEventTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {processing ? 'Rejecting...' : 'Reject Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
