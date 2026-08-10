import React, { useState } from 'react';
import { ticketService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  User,
  Calendar,
  MapPin,
  Ticket
} from 'lucide-react';

export const TicketVerificationPage = () => {
  const { user, isOrganizer, isAdmin } = useAuth();
  const { addToast } = useNotification();
  const [ticketInput, setTicketInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    try {
      setVerifying(true);
      setVerificationResult(null);
      
      // Check if raw JSON string was pasted from a QR scanner
      let queryVal = ticketInput.trim();
      try {
        const parsed = JSON.parse(queryVal);
        if (parsed.ticket_number) queryVal = parsed.ticket_number;
        else if (parsed.ticket_id) queryVal = parsed.ticket_id;
      } catch (_) {}

      const res = await ticketService.verifyTicket(queryVal);
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({
        valid: false,
        message: err.response?.data?.message || 'Ticket not found or invalid QR code.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckIn = async () => {
    if (!verificationResult?.ticket?.id) return;
    try {
      setCheckingIn(true);
      const res = await ticketService.checkInTicket(verificationResult.ticket.id);
      addToast({ type: 'success', message: res.message });
      setVerificationResult((prev) => ({
        ...prev,
        is_checked_in: true,
        checked_in_at: new Date().toISOString(),
        message: 'Attendee Checked In Successfully!'
      }));
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.error || 'Failed to check-in attendee.' });
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
          Ticket Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Enter ticket number (e.g. <code>TKT-ESPH-89421</code>) or paste scanned QR code JSON payload.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={handleVerify} className="p-4 rounded-3xl glass-panel shadow-lg flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            placeholder="TKT-ESPH-XXXX or scan QR code..."
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-300 text-xs sm:text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
        <button
          type="submit"
          disabled={verifying}
          className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
        >
          {verifying ? 'Verifying...' : 'Verify Pass'}
        </button>
      </form>

      {/* Verification Result Box */}
      {verificationResult && (
        <div className="animate-slide-up">
          {verificationResult.valid ? (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 space-y-6">
              
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-dark-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-emerald-700 dark:text-emerald-400">
                      Valid Verified Ticket
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      #{verificationResult.ticket.ticket_number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      verificationResult.is_checked_in
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {verificationResult.is_checked_in ? 'ALREADY CHECKED IN' : 'UNCHECKED (READY)'}
                  </span>
                </div>
              </div>

              {/* Event & Attendee Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-dark-500 border border-slate-200/80 dark:border-dark-400">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Event Details</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {verificationResult.ticket.event_details?.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    <span>{new Date(verificationResult.ticket.event_details?.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                    <span>{verificationResult.ticket.event_details?.venue_name || verificationResult.ticket.event_details?.city}</span>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-dark-500 border border-slate-200/80 dark:border-dark-400">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Attendee & Pass Type</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary-500" />
                    <span>{verificationResult.ticket.attendee_name}</span>
                  </div>
                  <div className="text-slate-500">{verificationResult.ticket.attendee_email}</div>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 font-bold">
                      {verificationResult.ticket.ticket_type_details?.name}
                    </span>
                    <span className="font-mono text-slate-500">
                      Seat: {verificationResult.ticket.seat_label || 'GA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check In Action Button for Organizers / Admins */}
              {(isOrganizer || isAdmin) && !verificationResult.is_checked_in && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
                  >
                    {checkingIn ? 'Checking In...' : 'Check-In Attendee Now'}
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-rose-300 dark:border-rose-700 bg-rose-50/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-rose-600">
                Invalid or Unrecognized Ticket
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {verificationResult.message || 'No active booking or ticket matches the provided payload.'}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
