import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from './eventService';
import { authService } from './authService';
import { EventCard } from './components/common/EventCard';
import { EventCardSkeleton } from './components/common/LoadingSkeleton';
import {
  Sparkles,
  Search,
  Calendar,
  MapPin,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  Ticket,
  Star,
  Cpu,
  Music,
  Briefcase,
  Palette,
  GraduationCap,
  Trophy,
  Utensils
} from 'lucide-react';

const iconMap = {
  Cpu: Cpu,
  Music: Music,
  Briefcase: Briefcase,
  Palette: Palette,
  GraduationCap: GraduationCap,
  Trophy: Trophy,
  Utensils: Utensils,
  Calendar: Calendar,
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [popularOrganizers, setPopularOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state in Hero
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, featured, trending, upcoming, orgs] = await Promise.all([
          eventService.getCategories(),
          eventService.getFeaturedEvents(),
          eventService.getTrendingEvents(),
          eventService.getUpcomingEvents(),
          authService.getPopularOrganizers(),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setFeaturedEvents(Array.isArray(featured) ? featured : []);
        setTrendingEvents(Array.isArray(trending) ? trending : []);
        setUpcomingEvents(Array.isArray(upcoming) ? upcoming : []);
        setPopularOrganizers(Array.isArray(orgs) ? orgs : []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle) params.append('search', searchTitle);
    if (searchCity) params.append('city', searchCity);
    if (searchCategory) params.append('category', searchCategory);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary-500/20 via-indigo-500/20 to-accent-500/20 blur-[130px] -z-10 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-primary-600/10 blur-[100px] -z-10 rounded-full" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-primary-700 dark:text-primary-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-accent-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Discover Top Summits, Festivals & Masterclasses</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Discover Events. <br />
            <span className="text-gradient">Create Experiences.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            The all-in-one smart event platform for booking premium conferences, concerts, workshops, and sports galas with instant QR-code mobile passes.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/events"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-primary-500/25 hover:shadow-glow hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              <span>Explore Events</span>
            </Link>

            <Link
              to="/organizer/events/create"
              className="px-7 py-3.5 rounded-2xl glass-card hover:bg-slate-100 dark:hover:bg-dark-400 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5 text-primary-500" />
              <span>Create an Event</span>
            </Link>
          </div>

          {/* Hero Search Box */}
          <div className="pt-6 max-w-4xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="p-3 rounded-3xl glass-panel shadow-2xl flex flex-col md:flex-row gap-3 items-center border border-slate-200 dark:border-dark-300"
            >
              {/* Event Name / Keyword */}
              <div className="flex-1 w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-dark-600 rounded-2xl border border-slate-200/60 dark:border-dark-400/60">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Event name, artist, topic..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* City Location */}
              <div className="w-full md:w-48 flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-dark-600 rounded-2xl border border-slate-200/60 dark:border-dark-400/60">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="dark:bg-dark-600">All Cities</option>
                  <option value="Bengaluru" className="dark:bg-dark-600">Bengaluru</option>
                  <option value="Mumbai" className="dark:bg-dark-600">Mumbai</option>
                  <option value="Goa" className="dark:bg-dark-600">Goa</option>
                  <option value="New Delhi" className="dark:bg-dark-600">New Delhi</option>
                  <option value="Hyderabad" className="dark:bg-dark-600">Hyderabad</option>
                  <option value="Pune" className="dark:bg-dark-600">Pune</option>
                  <option value="Online" className="dark:bg-dark-600">Online</option>
                </select>
              </div>

              {/* Category */}
              <div className="w-full md:w-48 flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-dark-600 rounded-2xl border border-slate-200/60 dark:border-dark-400/60">
                <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="dark:bg-dark-600">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug} className="dark:bg-dark-600">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Submit */}
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-dark-500/40 backdrop-blur-sm border border-slate-200/50 dark:border-dark-400/50">
              <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">100K+</div>
              <div className="text-xs text-slate-500">Tickets Issued</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-dark-500/40 backdrop-blur-sm border border-slate-200/50 dark:border-dark-400/50">
              <div className="font-display font-extrabold text-2xl text-primary-600 dark:text-primary-400">1,200+</div>
              <div className="text-xs text-slate-500">Live Summits</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-dark-500/40 backdrop-blur-sm border border-slate-200/50 dark:border-dark-400/50">
              <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">99.8%</div>
              <div className="text-xs text-slate-500">Customer Satisfaction</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-dark-500/40 backdrop-blur-sm border border-slate-200/50 dark:border-dark-400/50">
              <div className="font-display font-extrabold text-2xl text-accent-600 dark:text-accent-400">0.2s</div>
              <div className="text-xs text-slate-500">Gate Check-in Speed</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              Curated Collections
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/events"
            className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const IconComp = iconMap[cat.icon] || Calendar;
            return (
              <Link
                key={cat.id}
                to={`/events?category=${cat.slug}`}
                className="group relative h-44 sm:h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-end p-4 border border-slate-200/60 dark:border-dark-300/80"
              >
                {/* Background Image with Zoom */}
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-800" />
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-slate-900/20 group-hover:from-primary-950/95 group-hover:via-slate-900/50 transition-colors duration-300" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-start gap-2">
                  <div className="w-8.5 h-8.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-400 transition-all shadow-sm">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-primary-300 transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-300/90 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-400 inline-block" />
                      {cat.event_count || 15}+ events
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Handpicked Spotlight
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
              Featured Events
            </h2>
          </div>
          <Link
            to="/events?sort=featured"
            className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
          >
            <span>See All Featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* 4. TRENDING EVENTS & UPCOMING TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              <TrendingUp className="w-4 h-4" />
              <span>Trending & Selling Fast</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
              Upcoming Popular Experiences
            </h2>
          </div>
          <Link
            to="/events?sort=date_asc"
            className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Browse Full Calendar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* 5. HOW IT WORKS (3-STEP GUIDE) */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-400">
            Effortless Experience
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">
            How EventSphere Works
          </h2>
          <p className="text-sm text-slate-400">
            From discovering your next inspiration to effortless gate check-in in under 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-600/30 text-primary-400 mx-auto flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-display font-bold text-lg">Discover Events</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore verified tech summits, music festivals, and hands-on workshops with rich schedules and speaker profiles.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-400 mx-auto flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-display font-bold text-lg">Instant Secure Booking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your ticket tier, apply promo discount codes, and complete seamless Razorpay checkout in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-display font-bold text-lg">Digital QR Pass</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive your cryptographic digital pass with instant offline QR access and email confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* 6. POPULAR ORGANIZERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Verified Hosts
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Top Event Organizers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Backed by trusted production houses, technology consortiums, and creator networks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {(Array.isArray(popularOrganizers) ? popularOrganizers : []).map((org) => (
            <div
              key={org.id}
              className="p-6 rounded-2xl glass-card flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-all"
            >
              <img
                src={org.display_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${org.username}`}
                alt={org.organization_name || org.full_name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-500/20 shadow-md"
              />
              <div>
                <div className="flex items-center justify-center gap-1.5 font-display font-bold text-base text-slate-900 dark:text-white">
                  <span>{org.organization_name || org.full_name}</span>
                  <CheckCircle2 className="w-4 h-4 text-primary-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {org.organization_description || org.bio || 'Leading event curator and production organizer.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-dark-400 w-full flex items-center justify-between text-xs text-slate-400">
                <span>Verified Organizer</span>
                <Link
                  to={`/events?organizer=${org.username}`}
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View Events
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-dark-300">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              Community Love
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Loved by Attendees & Organizers Alike
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-dark-500 border border-slate-200/80 dark:border-dark-400 space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "EventSphere made ticketing for our 3,000 attendee AI summit completely effortless. The instant QR check-in eliminated lines at the venue gate."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Elena"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Elena Rostova</div>
                  <div className="text-[10px] text-slate-400">TechNova Director</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-dark-500 border border-slate-200/80 dark:border-dark-400 space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "Booking passes on mobile took literally 15 seconds with the Razorpay integration and I had my offline QR badge ready right away in my wallet."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="John"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">John Doe</div>
                  <div className="text-[10px] text-slate-400">Software Engineer</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-dark-500 border border-slate-200/80 dark:border-dark-400 space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "The real-time analytics dashboard lets us track ticket tier sales and coupon redemptions live. It has become our primary operations platform."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Marcus"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Marcus Chen</div>
                  <div className="text-[10px] text-slate-400">Pulsar Festivals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BOTTOM HERO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 p-8 sm:p-14 text-white overflow-hidden text-center shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl">
              Ready to Host Your Next Unforgettable Event?
            </h2>
            <p className="text-sm sm:text-base text-primary-100 font-medium">
              Join thousands of organizers using EventSphere to sell tickets, engage audiences, and stream live experiences.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl bg-white text-primary-700 font-extrabold text-sm sm:text-base hover:bg-primary-50 shadow-xl hover:scale-105 transition-all inline-block"
              >
                Start Hosting Today – Free
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

const PlusCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
