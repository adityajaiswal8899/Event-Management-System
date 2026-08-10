import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { Sparkles, Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { addToast } = useNotification();
  const [step, setStep] = useState(1); // 1 = request token, 2 = confirm new password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authService.requestPasswordReset(email);
      addToast({ type: 'success', message: res.message });
      if (res.token) {
        setToken(res.token); // In debug mode, prefill token for instant convenience!
      }
      setStep(2);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to request reset token.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authService.confirmPasswordReset(token, newPassword);
      addToast({ type: 'success', message: res.message });
      setStep(3);
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.error || 'Invalid or expired token.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-glow mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Reset Your Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 1
              ? 'Enter your account email to receive a password reset token.'
              : 'Enter the reset token and your new password.'}
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-panel space-y-4 shadow-xl border border-slate-200 dark:border-dark-300">
          {step === 1 && (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Token'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reset Token (UUID)
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste UUID token from email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password (Min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="font-bold text-emerald-600 text-sm">
                Password updated successfully!
              </div>
              <Link
                to="/login"
                className="block w-full py-3 rounded-2xl bg-primary-600 text-white text-xs font-bold"
              >
                Sign In With New Password
              </Link>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
