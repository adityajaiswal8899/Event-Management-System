import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from './eventService';
import { TableSkeleton } from './components/common/LoadingSkeleton';
import {
  DollarSign,
  Ticket,
  Calendar,
  Users,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const OrganizerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await eventService.getOrganizerAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load organizer analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) return <TableSkeleton rows={6} />;

  const stats = data?.stats || {};
  const monthlySales = data?.monthly_sales || [];
  const topEvents = data?.top_events || [];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Organizer Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time telemetry on your ticket sales, attendee growth, and event performance.
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 inline-flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Revenue */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-base">
              ₹
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            ₹{Number(stats.total_revenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Direct Net Payouts
          </span>
        </div>

        {/* Tickets Sold */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">Tickets Sold</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {Number(stats.total_tickets_sold || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Across all published tiers</span>
        </div>

        {/* Total Attendees */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">Total Attendees</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {stats.total_attendees || 0}
          </div>
          <span className="text-[11px] text-slate-400">Unique attendee profiles</span>
        </div>

        {/* Live Events */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">Total Events</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {stats.total_events || 0}
          </div>
          <div className="flex gap-2 text-[11px]">
            <span className="text-emerald-600 font-semibold">{stats.published_events || 0} Live</span>
            <span className="text-amber-500 font-semibold">• {stats.pending_events || 0} Pending</span>
          </div>
        </div>

      </div>

      {/* Monthly Sales Visual Chart & Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart Bar Representation */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Monthly Revenue Performance
            </h3>
            <span className="text-xs text-slate-400">Last 6 Months</span>
          </div>

          <div className="space-y-4 pt-2">
            {monthlySales.map((item, idx) => {
              const maxRev = Math.max(...monthlySales.map((m) => m.revenue), 1000);
              const percentage = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">{item.month}</span>
                    <span className="text-slate-900 dark:text-white">
                      ₹{item.revenue.toLocaleString()} ({item.tickets} tickets)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Events Roster */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Top Selling Events
            </h3>
            <Link to="/organizer/events" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-dark-400">
            {topEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No events data yet.</div>
            ) : (
              topEvents.map((ev) => (
                <div key={ev.id} className="py-3 space-y-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {ev.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{ev.tickets_sold} tickets sold</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{ev.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
