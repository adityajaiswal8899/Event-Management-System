import React from 'react';
import { Sparkles, ShieldCheck, Zap, Globe, Users, Trophy } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-primary-600 dark:text-primary-400">
          <Sparkles className="w-4 h-4 text-accent-500" />
          <span>The Next-Gen Experience Infrastructure</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white leading-tight">
          Empowering Organizers. <br />
          <span className="text-gradient">Connecting Audiences Worldwide.</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          EventSphere is built to redefine how live conferences, festivals, and educational workshops are discovered, ticketed, and experienced.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl glass-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            Sub-Second Gate Check-ins
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Our cryptographic QR badges and mobile scanner support offline gate verification, eliminating queues for thousands of attendees.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            Secure Payments & Refunds
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Directly integrated with Razorpay for instant UPI, Cards, NetBanking, and automated inventory reconciliation.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            Real-Time Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Deep insights on revenue streams, tier velocity, coupon performance, and attendee retention rates.
          </p>
        </div>
      </div>

    </div>
  );
};

export const ContactPage = () => {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Have a question about ticketing, hosting a summit, or enterprise solutions? We'd love to hear from you.
        </p>
      </div>

      <div className="p-8 rounded-3xl glass-panel shadow-xl border border-slate-200 dark:border-dark-300 max-w-xl mx-auto">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="font-bold text-emerald-600 text-lg">Thank You! Message Received.</div>
            <p className="text-xs text-slate-500">Our concierge support team will get back to you within 4 business hours.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
              <input type="text" required placeholder="Alexander Vance" className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input type="email" required placeholder="name@example.com" className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <input type="text" required placeholder="Event Partnership / Technical Support" className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
              <textarea rows={4} required placeholder="Write your inquiry here..." className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs" />
            </div>
            <button type="submit" className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
