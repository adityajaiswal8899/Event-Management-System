import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { Sparkles, User, Mail, Lock, Phone, Building, Globe, UserCheck, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [role, setRole] = useState('ATTENDEE');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');

  // Organizer fields
  const [organizationName, setOrganizationName] = useState('');
  const [website, setWebsite] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      addToast({ type: 'warning', message: 'Passwords do not match.' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        role,
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirm: passwordConfirm,
        phone,
      };

      if (role === 'ORGANIZER') {
        payload.organization_name = organizationName;
        payload.website = website;
        payload.organization_description = organizationDescription;
      }

      await register(payload);
      addToast({ type: 'success', message: 'Account created successfully! Please sign in.' });
      navigate('/login');
    } catch (err) {
      const errData = err.response?.data;
      let msg = 'Registration failed. Please check your inputs.';
      if (errData) {
        if (errData.email) msg = errData.email[0];
        else if (errData.username) msg = errData.username[0];
        else if (errData.password) msg = errData.password[0];
      }
      addToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-accent-500 flex items-center justify-center text-white shadow-glow">
              <span className="font-display font-black text-lg tracking-wider text-white select-none">AJ</span>
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              AJ Events
            </span>
          </Link>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join thousands of attendees and event curators worldwide.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-dark-500">
          <button
            type="button"
            onClick={() => setRole('ATTENDEE')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'ATTENDEE'
                ? 'bg-white dark:bg-dark-400 text-primary-600 dark:text-primary-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>I'm an Attendee</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('ORGANIZER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'ORGANIZER'
                ? 'bg-white dark:bg-dark-400 text-primary-600 dark:text-primary-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>I'm an Organizer</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl glass-panel space-y-4 shadow-xl border border-slate-200 dark:border-dark-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Organizer specific inputs */}
          {role === 'ORGANIZER' && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                Organization Information
              </span>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="TechNova Conferences Ltd."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://technova.io"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-primary-500/20 hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};
