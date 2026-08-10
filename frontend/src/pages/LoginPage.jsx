import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Sparkles, Mail, Lock, LogIn, Shield, Users, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await login({ email, password });
      addToast({ type: 'success', message: `Welcome back, ${res.user.full_name || res.user.username}!` });
      if (res.user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (res.user.role === 'ORGANIZER') navigate('/organizer/dashboard');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || 'Invalid email or password.';
      addToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              EventSphere
            </span>
          </Link>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your bookings, QR passes, and organizer controls.
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pill Bar */}
        <div className="p-3.5 rounded-2xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/60 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 block">
            ⚡ Quick Demo Accounts (Click to Fill)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@eventsphere.com', 'Admin@123')}
              className="p-1.5 rounded-xl bg-white dark:bg-dark-500 border border-primary-200 dark:border-dark-400 text-[11px] font-bold text-slate-800 dark:text-slate-200 hover:border-primary-500 transition-all flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3 text-purple-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('organizer@techsummit.com', 'Organizer@123')}
              className="p-1.5 rounded-xl bg-white dark:bg-dark-500 border border-primary-200 dark:border-dark-400 text-[11px] font-bold text-slate-800 dark:text-slate-200 hover:border-primary-500 transition-all flex items-center justify-center gap-1"
            >
              <Users className="w-3 h-3 text-indigo-600" />
              <span>Organizer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('john.doe@example.com', 'User@123')}
              className="p-1.5 rounded-xl bg-white dark:bg-dark-500 border border-primary-200 dark:border-dark-400 text-[11px] font-bold text-slate-800 dark:text-slate-200 hover:border-primary-500 transition-all flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-emerald-600" />
              <span>Attendee</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl glass-panel space-y-4 shadow-xl border border-slate-200 dark:border-dark-300">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-primary-500/20 hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
};
