import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { EventCard } from '../components/common/EventCard';
import { EventCardSkeleton } from '../components/common/LoadingSkeleton';
import { Heart, ArrowRight } from 'lucide-react';

export const WishlistPage = () => {
  const [wishlistEvents, setWishlistEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await eventService.getWishlist();
      setWishlistEvents(data);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleWishlistChange = (eventId, isWishlisted) => {
    if (!isWishlisted) {
      setWishlistEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
          Saved Favorites
        </span>
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
          My Saved Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Events you've bookmarked for later booking or tracking.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : wishlistEvents.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-dark-500 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explore exciting summits, festivals and masterclasses, and click the heart icon to save them here.
          </p>
          <Link
            to="/events"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-xs shadow-md"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onWishlistChange={handleWishlistChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
