import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { ToastContainer } from './ToastContainer';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Users,
  CreditCard,
  Ticket,
  Tag,
  BarChart3,
  ShieldCheck,
  CheckSquare,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const DashboardLayout = ({ role = 'organizer' }) => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isCurrent = (path) => location.pathname === path;

  const organizerNav = [
    { name: 'Overview', path: '/organizer/dashboard', icon: LayoutDashboard },
    { name: 'My Events', path: '/organizer/events', icon: Calendar },
    { name: 'Create Event', path: '/organizer/events/create', icon: PlusCircle },
    { name: 'Bookings & Attendees', path: '/organizer/bookings', icon: Users },
    { name: 'Sales Analytics', path: '/organizer/analytics', icon: BarChart3 },
  ];

  const adminNav = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Event Approvals', path: '/admin/events', icon: CheckSquare },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'All Bookings', path: '/admin/bookings', icon: Ticket },
    { name: 'Payment Transactions', path: '/admin/payments', icon: CreditCard },
    { name: 'Coupons & Discounts', path: '/admin/coupons', icon: Tag },
  ];

  const navItems = role === 'admin' ? adminNav : organizerNav;

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-dark-600 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-dark-500 border-r border-slate-200 dark:border-dark-400 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-dark-400">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-accent-500 flex items-center justify-center text-white shadow-glow">
                <span className="font-display font-black text-base tracking-wider text-white select-none">AJ</span>
              </div>
              <div>
                <span className="font-display font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-primary-600 dark:from-white dark:to-primary-300">
                  AJ Events
                </span>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-primary-600 dark:text-primary-400">
                  {role === 'admin' ? 'Admin Portal' : 'Organizer Hub'}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-400/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-dark-400 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-400"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Public Site</span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-dark-400">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={user?.display_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                alt={user?.full_name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-primary-500/30"
              />
              <div className="truncate text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.full_name || user?.username}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {user?.role?.toLowerCase()}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-500/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-400 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 dark:text-white capitalize font-semibold">
                {location.pathname.split('/').pop().replace('-', ' ') || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-400"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {role === 'organizer' && (
              <Link
                to="/organizer/events/create"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Event</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
