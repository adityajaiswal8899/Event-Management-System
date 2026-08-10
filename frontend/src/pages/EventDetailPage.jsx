import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../eventService';
import { reviewService } from '../bookingService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { EventCard } from '../components/common/EventCard';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Heart,
  Star,
  Users,
  ShieldCheck,
  Building,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Award,
  Video,
  Ticket as TicketIcon
} from 'lucide-react';

export const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review submission state
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventDetail(slug);
        setEvent(data);
        setIsWishlisted(data.is_wishlisted || false);
        
        // Initialize ticket quantity map
        const initialMap = {};
        if (data.ticket_types) {
          data.ticket_types.forEach((t) => {
            initialMap[t.id] = 0;
          });
          // Default select 1 of the first active ticket if available
          const firstAvailable = data.ticket_types.find((t) => t.is_active && t.available_quantity > 0);
          if (firstAvailable) {
            initialMap[firstAvailable.id] = 1;
          }
        }
        setSelectedTickets(initialMap);

        // Fetch reviews
        if (data.id) {
          const revs = await reviewService.getEventReviews(data.id);
          setReviews(revs);
        }
      } catch (err) {
        console.error('Failed to load event detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      addToast({ type: 'warning', message: 'Please log in to add to wishlist.' });
      navigate('/login');
      return;
    }
    try {
      const res = await eventService.toggleWishlist(event.id);
      setIsWishlisted(res.wishlisted);
      addToast({
        type: res.wishlisted ? 'success' : 'info',
        message: res.wishlisted ? 'Saved to wishlist!' : 'Removed from wishlist.'
      });
    } catch (err) {
      addToast({ type: 'error', message: 'Could not update wishlist.' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} on EventSphere!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({ type: 'success', message: 'Event link copied to clipboard!' });
    }
  };

  const updateTicketQty = (ticketId, delta, maxAvailable) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      return { ...prev, [ticketId]: next };
    });
  };

  const calculateSubtotal = () => {
    if (!event?.ticket_types) return 0;
    return event.ticket_types.reduce((acc, t) => {
      const qty = selectedTickets[t.id] || 0;
      return acc + Number(t.price) * qty;
    }, 0);
  };

  const totalTicketsCount = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      addToast({ type: 'warning', message: 'Please sign in or create an account to book tickets.' });
      navigate('/login');
      return;
    }

    if (totalTicketsCount === 0) {
      addToast({ type: 'warning', message: 'Please select at least 1 ticket.' });
      return;
    }

    const bookingItems = Object.entries(selectedTickets)
      .filter(([_, qty]) => qty > 0)
      .map(([tId, qty]) => ({
        ticket_type_id: parseInt(tId),
        quantity: qty
      }));

    // Store in session storage for checkout page
    sessionStorage.setItem('checkout_event', JSON.stringify(event));
    sessionStorage.setItem('checkout_items', JSON.stringify(bookingItems));
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast({ type: 'warning', message: 'Please log in to submit a review.' });
      navigate('/login');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await reviewService.submitReview(event.id, {
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviews((prev) => [res, ...prev]);
      setReviewTitle('');
      setReviewComment('');
      addToast({ type: 'success', message: 'Thank you for your rating & review!' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to post review.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-pulse">
        <div className="h-80 bg-slate-200 dark:bg-dark-500 rounded-3xl mb-8" />
        <div className="h-10 bg-slate-200 dark:bg-dark-500 rounded-xl w-2/3 mx-auto mb-4" />
        <div className="h-6 bg-slate-200 dark:bg-dark-500 rounded-xl w-1/3 mx-auto" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl">Event Not Found</h2>
        <p className="text-sm text-slate-500">The event you are looking for does not exist or has been removed.</p>
        <Link to="/events" className="inline-block px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-xs">
          Back to Events
        </Link>
      </div>
    );
  }

  const formattedStartDate = new Date(event.start_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/events" className="hover:text-primary-600">Events</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-md">{event.title}</span>
      </div>

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-dark-300">
        <div className="relative h-80 sm:h-[420px] w-full bg-slate-900">
          <img
            src={event.display_banner}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Floating Category & Actions */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-primary-600/90 text-white text-xs font-bold backdrop-blur-md">
                {event.category?.name}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-slate-200 text-xs font-semibold backdrop-blur-md capitalize">
                {event.event_type?.replace('_', ' ').toLowerCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlistToggle}
                className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-all active:scale-95 shadow-md"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-all active:scale-95 shadow-md"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title & Quick Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{event.average_rating || '5.0'}</span>
              <span className="text-slate-300 font-normal">({event.total_reviews || 0} reviews)</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl text-white">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-200 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-400" />
                <span>{formattedStartDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary-400" />
                <span>{event.start_time?.slice(0, 5)} - {event.end_time?.slice(0, 5)} {event.timezone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>{event.venue_name || event.city}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Grid: Left Tabs / Details vs Right Ticket Selector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left 2 Cols: Tabs (Overview, Speakers, Schedule, Gallery, Reviews) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tabs Navigation Bar */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-dark-400 pb-2">
            {[
              { id: 'description', label: 'Overview' },
              { id: 'speakers', label: `Speakers (${event.speakers?.length || 0})` },
              { id: 'schedule', label: `Schedule (${event.schedules?.length || 0})` },
              { id: 'gallery', label: `Gallery (${event.gallery_images?.length || 0})` },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === 'description' && (
            <div className="space-y-8 animate-fade-in">
              <div className="p-6 rounded-3xl glass-card space-y-4">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  About This Event
                </h3>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>

              {/* Organizer Spotlight Box */}
              <div className="p-6 rounded-3xl glass-card space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Event Organizer
                </span>
                <div className="flex items-center gap-4">
                  <img
                    src={event.organizer?.display_avatar}
                    alt={event.organizer?.organization_name || event.organizer?.full_name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary-500/30 shadow-md"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                        {event.organizer?.organization_name || event.organizer?.full_name}
                      </h4>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {event.organizer?.organization_description || event.organizer?.bio || 'Curator of world-class events.'}
                    </p>
                    {event.organizer?.website && (
                      <a
                        href={event.organizer.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Venue & Location Map */}
              <div className="p-6 rounded-3xl glass-card space-y-4">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Location & Venue
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-base">
                    {event.venue_name || 'Online Stream'}
                  </div>
                  <p>{event.address}</p>
                  <p>{event.city}, {event.state} - {event.postal_code}, {event.country}</p>
                </div>

                {/* Google Maps Link / Embed preview */}
                <div className="rounded-2xl overflow-hidden h-48 bg-slate-200 dark:bg-dark-500 flex items-center justify-center relative border border-slate-200 dark:border-dark-400">
                  <div className="text-center p-4">
                    <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      {event.venue_name || event.city}
                    </p>
                    {event.google_maps_url ? (
                      <a
                        href={event.google_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Virtual Stream Link provided upon booking</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              {event.terms_conditions && (
                <div className="p-6 rounded-3xl glass-card space-y-2">
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Terms & Guidelines
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {event.terms_conditions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SPEAKERS */}
          {activeTab === 'speakers' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Featured Speakers & Keynotes
              </h3>
              {event.speakers?.length === 0 ? (
                <div className="p-8 text-center text-slate-400 glass-card">
                  No speakers listed for this event yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers?.map((speaker) => (
                    <div key={speaker.id} className="p-5 rounded-2xl glass-card flex gap-4 items-start">
                      <img
                        src={speaker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${speaker.name}`}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary-500/20 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{speaker.name}</h4>
                        <div className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {speaker.designation} {speaker.company ? `• ${speaker.company}` : ''}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                          {speaker.bio}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Event Agenda & Timeline
              </h3>
              {event.schedules?.length === 0 ? (
                <div className="p-8 text-center text-slate-400 glass-card">
                  Detailed schedule will be published shortly.
                </div>
              ) : (
                <div className="space-y-4">
                  {event.schedules?.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-primary-500"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                          Day {item.day_number} {item.location_room ? `• ${item.location_room}` : ''}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                        {item.speaker_name && (
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                            Speaker: {item.speaker_name}
                          </div>
                        )}
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-500 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Event Gallery
              </h3>
              {event.gallery_images?.length === 0 ? (
                <div className="p-8 text-center text-slate-400 glass-card">
                  No additional gallery photos added yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.gallery_images?.map((img) => (
                    <div key={img.id} className="rounded-2xl overflow-hidden h-60 bg-slate-200 dark:bg-dark-500">
                      <img
                        src={img.display_url}
                        alt={img.caption || 'Event image'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fade-in">
              {/* Submit Review Form */}
              <div className="p-6 rounded-3xl glass-card space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Leave a Review & Rating
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Rating
                    </label>
                    <div className="flex gap-2 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Unforgettable experience and great speakers!"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Detailed Feedback
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share what you liked about this event..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Attendee Reviews ({reviews.length})
                </h4>
                {reviews.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 glass-card">
                    No reviews yet. Be the first to share your experience!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl glass-card space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.user?.display_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.user?.username}`}
                            alt={rev.user?.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {rev.user?.full_name || rev.user?.username}
                            </span>
                            {rev.is_verified_attendee && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Verified Attendee
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex text-amber-400 gap-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {rev.title}
                        </h5>
                      )}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Ticket Selector & Booking Box (Sticky) */}
        <div className="sticky top-28 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-dark-300 shadow-xl space-y-6">
            
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Select Your Tickets
              </span>
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                Ticket Passes
              </h3>
            </div>

            {/* Ticket Options List */}
            <div className="space-y-4">
              {event.ticket_types?.map((ticket) => {
                const qty = selectedTickets[ticket.id] || 0;
                const isSoldOut = ticket.available_quantity <= 0;

                return (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      qty > 0
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30'
                        : 'border-slate-200 dark:border-dark-400 bg-white/70 dark:bg-dark-500/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {ticket.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ticket.description}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ₹{Number(ticket.price).toLocaleString()}
                        </div>
                        {ticket.original_price && Number(ticket.original_price) > Number(ticket.price) && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{Number(ticket.original_price).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Perks preview */}
                    {ticket.perks && ticket.perks.length > 0 && (
                      <ul className="space-y-1 my-2">
                        {ticket.perks.slice(0, 2).map((perk, i) => (
                          <li key={i} className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-primary-500" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Quantity Selector */}
                    <div className="pt-2 border-t border-slate-100 dark:border-dark-400 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {isSoldOut ? (
                          <span className="text-rose-500 font-bold">Sold Out</span>
                        ) : (
                          `${ticket.available_quantity} available`
                        )}
                      </span>

                      {!isSoldOut && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-600 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => updateTicketQty(ticket.id, -1, ticket.available_quantity)}
                            disabled={qty === 0}
                            className="p-1 rounded-lg bg-white dark:bg-dark-500 text-slate-700 dark:text-slate-200 disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs text-slate-900 dark:text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateTicketQty(ticket.id, 1, ticket.available_quantity)}
                            disabled={qty >= ticket.available_quantity || qty >= ticket.max_per_booking}
                            className="p-1 rounded-lg bg-white dark:bg-dark-500 text-slate-700 dark:text-slate-200 disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal & Book Now */}
            <div className="pt-4 border-t border-slate-200 dark:border-dark-400 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Amount</span>
                  <span className="text-[10px] text-slate-400">({totalTicketsCount} tickets selected)</span>
                </div>
                <div className="font-display font-extrabold text-2xl text-primary-600 dark:text-primary-400">
                  ₹{calculateSubtotal().toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={totalTicketsCount === 0 || event.is_sold_out}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-primary-500/25 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <TicketIcon className="w-5 h-5" />
                <span>{event.is_sold_out ? 'Event Sold Out' : 'Proceed to Booking'}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant QR Confirmation • 100% Refund Guarantee</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Related Events Section */}
      {event.related_events && event.related_events.length > 0 && (
        <div className="pt-12 border-t border-slate-200 dark:border-dark-400 space-y-6">
          <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Similar Events You May Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.related_events.map((rel) => (
              <EventCard key={rel.id} event={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
