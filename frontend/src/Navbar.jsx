import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useNotification } from './NotificationContext';
import {
  Sparkles,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Ticket,
  Heart,
  User,
  LayoutDashboard,
  LogOut,
  Calendar,
  ChevronDown,
  CheckCircle,
  PlusCircle,
  ShieldCheck,
  Building
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isOrganizer } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    if (isAdmin) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">Admin</span>;
    if (isOrganizer) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">Organizer</span>;
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">Attendee</span>;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Events', path: '/events' },
    { name: 'Verify Ticket', path: '/verify-ticket' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-accent-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-200">
            <span className="font-display font-black text-lg tracking-wider text-white select-none">AJ</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary-700 to-accent-600 dark:from-white dark:via-primary-300 dark:to-accent-400">
              AJ Events
            </span>
            <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 tracking-wider uppercase -mt-1">
              by Aditya
            </span>
          </div>
        </Link>

        {/* Public Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100/60 dark:hover:bg-dark-500/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search events, artists, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/80 dark:bg-dark-500/80 border border-slate-200 dark:border-dark-300/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        </form>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-500 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notification Dropdown */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-500 relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel shadow-2xl p-4 border border-slate-200 dark:border-dark-300/80 animate-fade-in z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-400 mb-2">
                      <div className="font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.is_read) markAsRead(notif.id);
                              if (notif.link) {
                                navigate(notif.link);
                                setNotifDropdownOpen(false);
                              }
                            }}
                            className={`p-3 rounded-xl transition-all cursor-pointer text-left ${
                              notif.is_read
                                ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-dark-500/50'
                                : 'bg-primary-50/70 dark:bg-primary-950/40 border-l-4 border-primary-500'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-dark-500 transition-colors"
                >
                  <img
                    src={user?.display_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                    alt={user?.full_name || 'User'}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary-500/20"
                  />
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                      {user?.full_name || user?.username}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      {user?.role?.toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl glass-panel shadow-2xl p-2 border border-slate-200 dark:border-dark-300/80 animate-fade-in z-50">
                    <div className="p-3 border-b border-slate-100 dark:border-dark-400 mb-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {user?.full_name || user?.username}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1.5">
                        {user?.email}
                      </div>
                      {getRoleBadge()}
                    </div>

                    <div className="space-y-0.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      {isOrganizer && (
                        <Link
                          to="/organizer/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-primary-700 dark:text-primary-300"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Organizer Dashboard</span>
                        </Link>
                      )}

                      {isOrganizer && (
                        <Link
                          to="/organizer/events/create"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-500"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-500" />
                          <span>Create New Event</span>
                        </Link>
                      )}

                      <Link
                        to="/my-bookings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-500"
                      >
                        <Ticket className="w-4 h-4 text-primary-500" />
                        <span>My Bookings & Tickets</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-500"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Saved Wishlist</span>
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-500"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Account Profile</span>
                      </Link>

                      <div className="pt-1 mt-1 border-t border-slate-100 dark:border-dark-400">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-500/20 hover:shadow-glow transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-500 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-200 dark:border-dark-300 p-4 space-y-3 animate-slide-up">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-dark-500 border border-slate-200 dark:border-dark-400 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-500"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-dark-400">
              <Link
                to="/login"
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-slate-100 dark:bg-dark-500 text-slate-800 dark:text-slate-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-primary-600 text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
