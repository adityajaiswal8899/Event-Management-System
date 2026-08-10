import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { BarChart3, TrendingUp, DollarSign, Ticket, Users, Award } from 'lucide-react';

export const OrganizerAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await eventService.getOrganizerAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <TableSkeleton rows={5} />;

  const stats = data?.stats || {};
  const monthly = data?.monthly_sales || [];
  const topEvents = data?.top_events || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Event Sales & Analytics Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Conversion metrics, ticket tier velocity, and multi-channel revenue breakdown.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl glass-card space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Gross Bookings Revenue</span>
          <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            ₹{Number(stats.total_revenue || 0).toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% month over month
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Tickets Distributed</span>
          <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            {stats.total_tickets_sold || 0}
          </div>
          <span className="text-xs text-indigo-600 font-semibold">Across all active tiers</span>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Average Attendee Value</span>
          <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            ₹{stats.total_attendees ? Math.round(stats.total_revenue / stats.total_attendees).toLocaleString() : 0}
          </div>
          <span className="text-xs text-purple-600 font-semibold">Per verified ticket holder</span>
        </div>
      </div>

      {/* Monthly Chart Grid */}
      <div className="p-8 rounded-3xl glass-card space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Monthly Performance Trends
          </h3>
          <span className="text-xs text-slate-400">Revenue & Volume</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {monthly.map((m, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-600/60 border border-slate-200/80 dark:border-dark-400 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.month}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold">
                  {m.tickets} tickets
                </span>
              </div>
              <div className="font-display font-extrabold text-xl text-primary-600 dark:text-primary-400">
                ₹{m.revenue.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
