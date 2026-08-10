import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, User, Ticket as TicketIcon, CheckCircle2, ShieldCheck, Download, Printer } from 'lucide-react';

export const DigitalTicketCard = ({ ticket }) => {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(ticket.event_details?.start_date || ticket.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const qrPayload = ticket.qr_code_data || JSON.stringify({
    ticket_id: ticket.id,
    ticket_number: ticket.ticket_number,
    attendee: ticket.attendee_name,
    event: ticket.event_details?.title,
    ticket_type: ticket.ticket_type_details?.name
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Ticket Container */}
      <div
        ref={printRef}
        className="relative bg-white dark:bg-dark-500 rounded-3xl border border-slate-200 dark:border-dark-300 shadow-xl overflow-hidden max-w-xl w-full mx-auto"
      >
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 p-6 text-white relative">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <TicketIcon className="w-5 h-5" />
              <span className="font-display font-bold text-sm tracking-wider uppercase">EventSphere Pass</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              ticket.is_checked_in
                ? 'bg-amber-400 text-slate-950'
                : 'bg-emerald-400 text-slate-950'
            }`}>
              {ticket.is_checked_in ? 'CHECKED IN' : 'VALID TICKET'}
            </span>
          </div>

          <h2 className="font-display font-extrabold text-xl sm:text-2xl leading-tight">
            {ticket.event_details?.title || 'Event Access Pass'}
          </h2>
          <p className="text-xs text-primary-100 mt-1">
            Ticket #{ticket.ticket_number}
          </p>
        </div>

        {/* Middle Details Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-dark-500/50">
          
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Attendee</span>
              <span className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-primary-500" />
                {ticket.attendee_name}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{ticket.attendee_email}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Date & Time</span>
              <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-500" />
                <span>{formattedDate}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-primary-500" />
                <span>{ticket.event_details?.start_time?.slice(0, 5)} - {ticket.event_details?.end_time?.slice(0, 5)}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Venue / Location</span>
              <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>{ticket.event_details?.venue_name || ticket.event_details?.city || 'Online Stream'}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-dark-600 rounded-2xl border border-slate-200 dark:border-dark-400 shadow-inner">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <QRCodeSVG
                value={qrPayload}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="text-center mt-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase block">
                {ticket.seat_label || ticket.ticket_type_details?.name || 'General Access'}
              </span>
              <span className="text-[10px] text-slate-400">Scan at entrance gate</span>
            </div>
          </div>

        </div>

        {/* Ticket Bottom Notch / Perforated Line */}
        <div className="border-t-2 border-dashed border-slate-200 dark:border-dark-400 relative p-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-dark-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Verified Cryptographic Pass
          </span>
          <span className="font-mono">{ticket.ticket_number}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>
    </div>
  );
};
