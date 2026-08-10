import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/bookingService';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ShieldCheck,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Tag,
  CheckCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <TableSkeleton rows={6} />;

  const stats = data?.stats || {};
  const monthlyRevenue = data?.monthly_revenue || [];
  const categories = data?.category_distribution || [];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Admin Control Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Global platform telemetry, event moderation queue, user management, and revenue monitoring.
        </p>
      </div>

      {/* Pending Approvals Alert Banner */}
      {stats.pending_approvals > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-amber-900 dark:text-amber-200">
                {stats.pending_approvals} Event Submissions Waiting for Review
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Organizers have submitted new events requiring platform moderation.
              </p>
            </div>
          </div>
          <Link
            to="/admin/events"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap"
          >
            Review Queue
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Platform Revenue */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">Gross Platform GMV</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-base">
              ₹
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            ₹{Number(stats.total_revenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Razorpay Verified
          </span>
        </div>

        {/* Total Events */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">Events Catalog</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {stats.total_events || 0}
          </div>
          <span className="text-[11px] text-slate-400">
            {stats.active_events || 0} currently published
          </span>
        </div>

        {/* Total Registered Users */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">Attendees & Users</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {stats.total_users || 0}
          </div>
          <span className="text-[11px] text-slate-400">Active community members</span>
        </div>

        {/* Verified Organizers */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">Host Organizers</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {stats.total_organizers || 0}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">Verified organizations</span>
        </div>

      </div>

      {/* Monthly Platform Revenue & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue Bars */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Platform Transaction Volume (Last 6 Months)
            </h3>
            <span className="text-xs text-slate-400">Gross Processed</span>
          </div>

          <div className="space-y-4 pt-2">
            {monthlyRevenue.map((item, idx) => {
              const maxRev = Math.max(...monthlyRevenue.map((m) => m.revenue), 1000);
              const percentage = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">{item.month}</span>
                    <span className="text-slate-900 dark:text-white">
                      ₹{item.revenue.toLocaleString()} ({item.bookings_count} bookings)
                    </span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {categories.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No category breakdown yet.</div>
            ) : (
              categories.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-dark-600">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                  <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">{c.count} events</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
