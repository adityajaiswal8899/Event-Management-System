import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Star, Heart, ArrowRight, Clock, Users, Sparkles } from 'lucide-react';
import { eventService } from './eventService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

export const EventCard = ({ event, onWishlistChange }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(event.is_wishlisted || false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast({ type: 'warning', message: 'Please log in to save events to your wishlist.' });
      navigate('/login');
      return;
    }

    try {
      setWishlistLoading(true);
      const res = await eventService.toggleWishlist(event.id);
      setIsWishlisted(res.wishlisted);
      addToast({
        type: res.wishlisted ? 'success' : 'info',
        message: res.wishlisted ? 'Saved to wishlist!' : 'Removed from wishlist.'
      });
      if (onWishlistChange) onWishlistChange(event.id, res.wishlisted);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update wishlist.' });
    } finally {
      setWishlistLoading(false);
    }
  };

  const formattedDate = new Date(event.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getPriceDisplay = () => {
    if (event.lowest_price === 0 && event.highest_price === 0) {
      return <span className="text-emerald-600 dark:text-emerald-400 font-bold">Free Entry</span>;
    }
    if (event.lowest_price === event.highest_price) {
      return <span>₹{Number(event.lowest_price).toLocaleString()}</span>;
    }
    return (
      <span>
        ₹{Number(event.lowest_price).toLocaleString()} - ₹{Number(event.highest_price).toLocaleString()}
      </span>
    );
  };

  return (
    <div className="group rounded-2xl glass-card overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
      {/* Banner Container */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-200 dark:bg-dark-500">
        <img
          src={event.display_banner}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-900/80 text-white backdrop-blur-md">
            {event.category?.name || 'General'}
          </span>
          {event.is_featured && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/90 text-slate-950 backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          aria-label="Wishlist"
          className="absolute top-3 right-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md transition-all active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'
            }`}
          />
        </button>

        {/* Date Overlay Chip */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-dark-600/90 backdrop-blur-md text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-primary-500" />
          <span>{formattedDate}</span>
        </div>

        {/* Event Type / Sold Out status */}
        <div className="absolute bottom-3 right-3">
          {event.is_sold_out ? (
            <span className="px-2.5 py-1 rounded-xl bg-rose-600/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
              Sold Out
            </span>
          ) : event.available_seats <= 20 ? (
            <span className="px-2.5 py-1 rounded-xl bg-amber-600/90 text-white text-[11px] font-bold backdrop-blur-md animate-pulse">
              Only {event.available_seats} left
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-slate-900/70 text-slate-200 text-[11px] font-medium backdrop-blur-md capitalize">
              {event.event_type?.replace('_', ' ').toLowerCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 truncate max-w-[65%]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.venue_name || event.city || 'Online Virtual'}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-semibold flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{event.average_rating || '5.0'}</span>
              <span className="text-slate-400 font-normal">({event.total_reviews || 0})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/events/${event.slug}`} className="block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-2 leading-snug">
              {event.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {event.short_description || event.description}
          </p>
        </div>

        {/* Footer: Price & CTA Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-dark-400/80 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Starting from</span>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {getPriceDisplay()}
            </div>
          </div>

          <Link
            to={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-dark-500 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all group-hover:shadow-sm"
          >
            <span>Book Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
