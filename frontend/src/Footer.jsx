import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, MapPin, Phone, Heart, Globe, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 via-indigo-600 to-accent-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-200">
                <span className="font-display font-black text-lg tracking-wider text-white select-none">AJ</span>
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                AJ Events
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier platform for discovering world-class conferences, live music festivals, workshops, and exclusive networking gatherings. Book tickets with instant QR validation.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <Globe className="w-4 h-4" />
              </span>
              <span className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <Mail className="w-4 h-4" />
              </span>
              <span className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/events" className="hover:text-primary-400 transition-colors">All Events</Link></li>
              <li><Link to="/events?category=technology" className="hover:text-primary-400 transition-colors">Tech Summits</Link></li>
              <li><Link to="/events?category=music" className="hover:text-primary-400 transition-colors">Music Festivals</Link></li>
              <li><Link to="/events?category=business" className="hover:text-primary-400 transition-colors">Business & Startups</Link></li>
              <li><Link to="/verify-ticket" className="hover:text-primary-400 transition-colors">Verify Digital Ticket</Link></li>
            </ul>
          </div>

          {/* Organizers & Admins */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Organizers
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Host an Event</Link></li>
              <li><Link to="/organizer/dashboard" className="hover:text-primary-400 transition-colors">Organizer Portal</Link></li>
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">How Ticketing Works</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Organizer Support</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Stay in the Loop
            </h4>
            <p className="text-xs text-slate-400">
              Get notified of exclusive early-bird discounts and premier event drops.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to AJ Events newsletter!'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                Subscribe Free
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-10 mt-10 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} AJ Events Inc. All rights reserved. Built for seamless live experiences.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              256-Bit SSL Encrypted
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
