import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { bookingService, paymentService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PaymentModal } from '../components/common/PaymentModal';
import { DigitalTicketCard } from '../components/common/DigitalTicketCard';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Tag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  User,
  Mail,
  Phone,
  Ticket as TicketIcon
} from 'lucide-react';

export const CheckoutPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [items, setItems] = useState([]);
  const [attendeeName, setAttendeeName] = useState(user?.full_name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [attendeePhone, setAttendeePhone] = useState(user?.phone || '+91 98765 43210');
  const [notes, setNotes] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Checkout flow state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Success state
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const savedEvent = sessionStorage.getItem('checkout_event');
    const savedItems = sessionStorage.getItem('checkout_items');

    if (!savedEvent || !savedItems) {
      navigate('/events');
      return;
    }

    try {
      const parsedEvent = JSON.parse(savedEvent);
      const parsedItems = JSON.parse(savedItems);
      setEvent(parsedEvent);
      setItems(parsedItems);
    } catch (e) {
      navigate('/events');
    }
  }, [navigate]);

  if (!event || items.length === 0) return null;

  // Calculate Subtotal from event ticket types and items
  const getItemDetails = (ticketTypeId) => {
    return event.ticket_types?.find((t) => t.id === ticketTypeId) || {};
  };

  const subtotal = items.reduce((acc, item) => {
    const t = getItemDetails(item.ticket_type_id);
    return acc + Number(t.price || 0) * item.quantity;
  }, 0);

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await bookingService.validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discount_amount);
        addToast({ type: 'success', message: res.message });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid coupon code.';
      addToast({ type: 'error', message: msg });
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim() || !attendeePhone.trim()) {
      addToast({ type: 'warning', message: 'Please fill out all attendee contact details.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const bookingPayload = {
        event_id: event.id,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_phone: attendeePhone,
        notes,
        items,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const res = await bookingService.createBooking(bookingPayload);
      const booking = res.booking;

      // If free booking (amount == 0), immediately confirmed!
      if (booking.final_amount === 0 || booking.status === 'CONFIRMED') {
        const fullBooking = await bookingService.getBookingDetail(booking.id);
        setBookingSuccess(fullBooking);
        triggerCelebration();
        sessionStorage.removeItem('checkout_event');
        sessionStorage.removeItem('checkout_items');
      } else {
        // Create Razorpay Order
        const orderRes = await paymentService.createRazorpayOrder(booking.id);
        setOrderData({ ...orderRes, booking_id: booking.id });
        setPaymentModalOpen(true);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to initialize booking. Please try again.';
      addToast({ type: 'error', message: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      const verifyRes = await paymentService.verifyPayment(paymentResponse);
      if (verifyRes.verified) {
        setPaymentModalOpen(false);
        const fullBooking = await bookingService.getBookingDetail(paymentResponse.booking_id);
        setBookingSuccess(fullBooking);
        triggerCelebration();
        sessionStorage.removeItem('checkout_event');
        sessionStorage.removeItem('checkout_items');
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Payment verification failed. Please contact support.' });
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // SUCCESS VIEW
  if (bookingSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-9 h-9 animate-bounce" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Booking Confirmed & Verified
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            You're Going to {event.title}! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your QR code passes have been generated and sent to <strong>{bookingSuccess.attendee_email}</strong>.
          </p>
        </div>

        {/* Digital Tickets View */}
        <div className="space-y-6">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white text-center">
            Your Digital Access Badges
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {bookingSuccess.tickets?.map((ticket) => (
              <DigitalTicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Link
            to="/my-bookings"
            className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            View All My Bookings
          </Link>
          <Link
            to="/events"
            className="px-6 py-3 rounded-2xl glass-card text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-dark-500 transition-all"
          >
            Explore More Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Step 2 of 2
        </span>
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
          Review & Complete Booking
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Attendee Details & Order Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Selected Event Card Summary */}
          <div className="p-6 rounded-3xl glass-card flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <img
              src={event.display_banner}
              alt={event.title}
              className="w-full sm:w-36 h-28 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-dark-400"
            />
            <div className="space-y-1.5 flex-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-[10px] font-bold">
                {event.category?.name}
              </span>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {event.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary-500" />
                  <span>{new Date(event.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span>{event.venue_name || event.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee Contact Form */}
          <div className="p-6 rounded-3xl glass-card space-y-5">
            <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900 dark:text-white">
              <User className="w-4 h-4 text-primary-500" />
              <span>Attendee Information</span>
            </div>

            <form onSubmit={handleCreateBooking} id="booking-form" className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Attendee Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (For QR Tickets) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Special Requests / Dietary Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Vegetarian meal, wheelchair accessibility..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </form>
          </div>

          {/* Ticket Line Items Breakdown */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900 dark:text-white">
              <TicketIcon className="w-4 h-4 text-primary-500" />
              <span>Selected Passes</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-dark-400">
              {items.map((item) => {
                const t = getItemDetails(item.ticket_type_id);
                return (
                  <div key={item.ticket_type_id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{t.name}</span>
                      <span className="text-slate-400">Qty: {item.quantity} × ₹{Number(t.price).toLocaleString()}</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      ₹{(Number(t.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col: Price Summary & Razorpay Trigger */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-dark-300 shadow-xl space-y-5">
            
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Order Summary
            </h3>

            {/* Coupon Application Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Promo Code
              </label>
              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <Tag className="w-4 h-4" />
                    <span>{appliedCoupon.code} (-₹{discountAmount})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl disabled:opacity-40 transition-all"
                  >
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              <span className="text-[10px] text-slate-400 block">Try codes: WELCOME50, EARLYBIRD, FLAT100</span>
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-dark-400 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tickets Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Convenience & Booking Fee</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-dark-400 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Total Amount</span>
                <span className="font-display font-extrabold text-2xl text-primary-600 dark:text-primary-400">
                  ₹{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              form="booking-form"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Securing Tickets...' : `Pay ₹${finalTotal.toLocaleString()} & Book`}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Razorpay Verified Gateway • Instant Delivery</span>
            </div>

          </div>
        </div>

      </div>

      {/* Razorpay Simulation Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        orderData={orderData}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
};
