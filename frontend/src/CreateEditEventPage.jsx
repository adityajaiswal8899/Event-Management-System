import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { eventService } from './eventService';
import { useNotification } from './NotificationContext';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Video
} from 'lucide-react';

export const CreateEditEventPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    event_type: 'IN_PERSON',
    short_description: '',
    description: '',
    
    // Dates & Times
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '18:00',
    timezone: 'Asia/Kolkata',

    // Location
    venue_name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    google_maps_url: '',
    online_meeting_url: '',

    // Media & Contacts
    banner_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    contact_email: '',
    contact_phone: '',
    terms_conditions: 'Tickets are non-refundable 48 hours prior to event start.',

    // Nested Arrays
    ticket_types_data: [
      { name: 'General Admission', price: 999, original_price: 1499, total_quantity: 100, max_per_booking: 10, perks: ['Full Conference Access', 'Lunch & Coffee'] },
      { name: 'VIP Pass', price: 2999, original_price: 3999, total_quantity: 30, max_per_booking: 5, perks: ['Reserved Front Rows', 'VIP Dinner', 'Speaker Meet & Greet'] }
    ],
    speakers_data: [
      { name: '', designation: '', company: '', bio: '', avatar_url: '', twitter: '', linkedin: '' }
    ],
    schedules_data: [
      { day_number: 1, start_time: '09:30', end_time: '11:00', title: 'Opening Keynote', description: 'Opening address and key trends', speaker_name: '', location_room: 'Main Hall' }
    ],
    gallery_urls: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
    ]
  });

  useEffect(() => {
    const loadInit = async () => {
      try {
        const cats = await eventService.getCategories();
        setCategories(cats);
        if (cats.length > 0 && !formData.category) {
          setFormData((p) => ({ ...p, category: cats[0].id }));
        }

        if (isEditing) {
          setLoading(true);
          const ev = await eventService.getOrganizerEventDetail(id);
          setFormData({
            title: ev.title || '',
            category: ev.category?.id || (cats[0]?.id || ''),
            event_type: ev.event_type || 'IN_PERSON',
            short_description: ev.short_description || '',
            description: ev.description || '',
            start_date: ev.start_date || '',
            end_date: ev.end_date || '',
            start_time: ev.start_time?.slice(0, 5) || '09:00',
            end_time: ev.end_time?.slice(0, 5) || '18:00',
            timezone: ev.timezone || 'Asia/Kolkata',
            venue_name: ev.venue_name || '',
            address: ev.address || '',
            city: ev.city || '',
            state: ev.state || '',
            country: ev.country || 'India',
            postal_code: ev.postal_code || '',
            google_maps_url: ev.google_maps_url || '',
            online_meeting_url: ev.online_meeting_url || '',
            banner_image_url: ev.banner_image_url || ev.display_banner || '',
            contact_email: ev.contact_email || '',
            contact_phone: ev.contact_phone || '',
            terms_conditions: ev.terms_conditions || '',
            ticket_types_data: ev.ticket_types?.map((t) => ({
              name: t.name,
              price: t.price,
              original_price: t.original_price,
              total_quantity: t.total_quantity,
              max_per_booking: t.max_per_booking,
              perks: t.perks || []
            })) || [],
            speakers_data: ev.speakers?.map((s) => ({
              name: s.name,
              designation: s.designation,
              company: s.company,
              bio: s.bio,
              avatar_url: s.avatar_url,
              twitter: s.twitter,
              linkedin: s.linkedin
            })) || [],
            schedules_data: ev.schedules?.map((sc) => ({
              day_number: sc.day_number,
              start_time: sc.start_time?.slice(0, 5),
              end_time: sc.end_time?.slice(0, 5),
              title: sc.title,
              description: sc.description,
              speaker_name: sc.speaker_name,
              location_room: sc.location_room
            })) || [],
            gallery_urls: ev.gallery_images?.map((g) => g.display_url) || []
          });
        }
      } catch (err) {
        console.error('Failed to load event for edit:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInit();
  }, [id, isEditing]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Ticket Tiers manipulation
  const addTicketTier = () => {
    setFormData((prev) => ({
      ...prev,
      ticket_types_data: [
        ...prev.ticket_types_data,
        { name: 'Standard Pass', price: 999, original_price: 1299, total_quantity: 100, max_per_booking: 10, perks: ['Session Access'] }
      ]
    }));
  };

  const removeTicketTier = (index) => {
    setFormData((prev) => ({
      ...prev,
      ticket_types_data: prev.ticket_types_data.filter((_, i) => i !== index)
    }));
  };

  const updateTicketTier = (index, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.ticket_types_data];
      copy[index][field] = val;
      return { ...prev, ticket_types_data: copy };
    });
  };

  // Speakers manipulation
  const addSpeaker = () => {
    setFormData((prev) => ({
      ...prev,
      speakers_data: [
        ...prev.speakers_data,
        { name: '', designation: '', company: '', bio: '', avatar_url: '', twitter: '', linkedin: '' }
      ]
    }));
  };

  const removeSpeaker = (index) => {
    setFormData((prev) => ({
      ...prev,
      speakers_data: prev.speakers_data.filter((_, i) => i !== index)
    }));
  };

  const updateSpeaker = (index, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.speakers_data];
      copy[index][field] = val;
      return { ...prev, speakers_data: copy };
    });
  };

  // Schedule manipulation
  const addSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      schedules_data: [
        ...prev.schedules_data,
        { day_number: 1, start_time: '11:00', end_time: '12:30', title: 'Breakout Session', description: '', speaker_name: '', location_room: 'Hall B' }
      ]
    }));
  };

  const removeSchedule = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedules_data: prev.schedules_data.filter((_, i) => i !== index)
    }));
  };

  const updateSchedule = (index, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.schedules_data];
      copy[index][field] = val;
      return { ...prev, schedules_data: copy };
    });
  };

  const handleSubmit = async (publishStatus = 'PENDING_APPROVAL') => {
    if (!formData.title || !formData.category || !formData.start_date || !formData.end_date) {
      addToast({ type: 'warning', message: 'Please provide event title, category, and dates.' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        status: publishStatus,
        category: formData.category,
        speakers_data: formData.speakers_data.filter((s) => s.name.trim()),
        schedules_data: formData.schedules_data.filter((sc) => sc.title.trim()),
      };

      if (isEditing) {
        await eventService.updateEvent(id, payload);
        addToast({ type: 'success', message: 'Event updated successfully!' });
      } else {
        await eventService.createEvent(payload);
        addToast({
          type: 'success',
          message: publishStatus === 'DRAFT' ? 'Event saved as draft!' : 'Event submitted for admin review!'
        });
      }
      navigate('/organizer/events');
    } catch (err) {
      const msg = err.response?.data?.title?.[0] || err.response?.data?.error || 'Failed to save event.';
      addToast({ type: 'error', message: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-600 font-semibold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Events</span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {isEditing ? 'Edit Event Details' : 'Create a New Event Experience'}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-dark-400 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-dark-400 transition-all"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('PENDING_APPROVAL')}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Save Changes' : 'Submit for Approval'}</span>
          </button>
        </div>
      </div>

      {/* Step Navigation Chips */}
      <div className="flex overflow-x-auto gap-2 bg-slate-200/70 dark:bg-dark-500 p-1.5 rounded-2xl">
        {[
          { num: 1, label: '1. Basic Info' },
          { num: 2, label: '2. Dates & Venue' },
          { num: 3, label: '3. Ticket Passes' },
          { num: 4, label: '4. Speakers & Schedule' },
          { num: 5, label: '5. Media & Policy' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setActiveStep(s.num)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeStep === s.num
                ? 'bg-white dark:bg-dark-400 text-primary-600 dark:text-primary-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1: BASIC INFO */}
      {activeStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-6 animate-fade-in">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            General Event Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Global Tech & AI Summit 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Format *
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => handleChange('event_type', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              >
                <option value="IN_PERSON">In-Person Only</option>
                <option value="ONLINE">Online / Virtual</option>
                <option value="HYBRID">Hybrid (In-Person + Stream)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Description (Card Teaser)
            </label>
            <input
              type="text"
              maxLength={280}
              value={formData.short_description}
              onChange={(e) => handleChange('short_description', e.target.value)}
              placeholder="A brief 1-2 sentence hook highlighting the main value..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Event Description *
            </label>
            <textarea
              rows={6}
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the topics, keynote sessions, takeaways, and attendee experience..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
            >
              Next: Dates & Venue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATES & VENUE */}
      {activeStep === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-6 animate-fade-in">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Dates, Times & Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-dark-400 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={formData.venue_name}
                onChange={(e) => handleChange('venue_name', e.target.value)}
                placeholder="e.g. KTPO Convention Centre"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Karnataka"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="560066"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Plot 25-P, EPIP Zone, Whitefield"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Maps URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.google_maps_url}
                  onChange={(e) => handleChange('google_maps_url', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Live Stream / Zoom URL (Virtual/Hybrid)
                </label>
                <input
                  type="url"
                  value={formData.online_meeting_url}
                  onChange={(e) => handleChange('online_meeting_url', e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
            >
              Next: Ticket Passes →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TICKET PASSES BUILDER */}
      {activeStep === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Ticket Passes & Pricing Tiers
              </h3>
              <p className="text-xs text-slate-500">Configure multiple ticket categories with specific perks.</p>
            </div>
            <button
              type="button"
              onClick={addTicketTier}
              className="px-3.5 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pass Tier</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.ticket_types_data.map((tier, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-dark-400 bg-white/60 dark:bg-dark-600/60 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Tier #{idx + 1}
                  </span>
                  {formData.ticket_types_data.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketTier(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tier Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={tier.name}
                      onChange={(e) => updateTicketTier(idx, 'name', e.target.value)}
                      placeholder="e.g. Early Bird Pass"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={tier.price}
                      onChange={(e) => updateTicketTier(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Seats / Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={tier.total_quantity}
                      onChange={(e) => updateTicketTier(idx, 'total_quantity', parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Perks (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(tier.perks) ? tier.perks.join(', ') : tier.perks}
                    onChange={(e) => updateTicketTier(idx, 'perks', e.target.value.split(',').map((s) => s.trim()))}
                    placeholder="Keynote Access, Lunch Included, VIP Dinner"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
            >
              Next: Speakers & Schedule →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SPEAKERS & SCHEDULE */}
      {activeStep === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-8 animate-fade-in">
          {/* Speakers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Speakers & Presenters
              </h3>
              <button
                type="button"
                onClick={addSpeaker}
                className="px-3.5 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Speaker</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.speakers_data.map((speaker, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-dark-400 bg-white/60 dark:bg-dark-600/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Speaker #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSpeaker(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={speaker.name}
                        onChange={(e) => updateSpeaker(idx, 'name', e.target.value)}
                        placeholder="Dr. Aris Thorne"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Designation / Role
                      </label>
                      <input
                        type="text"
                        value={speaker.designation}
                        onChange={(e) => updateSpeaker(idx, 'designation', e.target.value)}
                        placeholder="VP of Machine Learning"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Company / Org
                      </label>
                      <input
                        type="text"
                        value={speaker.company}
                        onChange={(e) => updateSpeaker(idx, 'company', e.target.value)}
                        placeholder="NeuralGrid AI"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={speaker.avatar_url}
                      onChange={(e) => updateSpeaker(idx, 'avatar_url', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-dark-400">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Timeline & Agenda
              </h3>
              <button
                type="button"
                onClick={addSchedule}
                className="px-3.5 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Agenda Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.schedules_data.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-dark-400 bg-white/60 dark:bg-dark-600/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Agenda Item #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSchedule(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Session Title *
                      </label>
                      <input
                        type="text"
                        value={sc.title}
                        onChange={(e) => updateSchedule(idx, 'title', e.target.value)}
                        placeholder="Opening Keynote"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={sc.start_time}
                        onChange={(e) => updateSchedule(idx, 'start_time', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={sc.end_time}
                        onChange={(e) => updateSchedule(idx, 'end_time', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
            >
              Next: Media & Policy →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: MEDIA & SUBMISSION */}
      {activeStep === 5 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-6 animate-fade-in">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Banner Media & Terms
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Event Banner Image URL *
            </label>
            <input
              type="url"
              required
              value={formData.banner_image_url}
              onChange={(e) => handleChange('banner_image_url', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
            />
            {formData.banner_image_url && (
              <div className="mt-2 h-44 rounded-2xl overflow-hidden bg-slate-900">
                <img
                  src={formData.banner_image_url}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organizer Contact Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="events@yourcompany.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organizer Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="+91 80 4912 3000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Terms, Conditions & Cancellation Policy
            </label>
            <textarea
              rows={3}
              value={formData.terms_conditions}
              onChange={(e) => handleChange('terms_conditions', e.target.value)}
              placeholder="Specify age restrictions, ID requirements, refund policies..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs"
            />
          </div>

          {/* Submission Bar */}
          <div className="pt-4 border-t border-slate-200 dark:border-dark-400 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-dark-400 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('PENDING_APPROVAL')}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20"
              >
                {isEditing ? 'Save & Submit' : 'Publish & Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
