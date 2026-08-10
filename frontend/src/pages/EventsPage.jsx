import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../eventService';
import { EventCard } from '../components/common/EventCard';
import { EventCardSkeleton } from '../components/common/LoadingSkeleton';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Tag,
  Grid,
  List,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [selectedEventType, setSelectedEventType] = useState(searchParams.get('event_type') || 'ALL');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date_filter') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date_asc');
  const [freeOnly, setFreeOnly] = useState(searchParams.get('free') === 'true');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await eventService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedCity && selectedCity !== 'all') params.city = selectedCity;
      if (selectedEventType && selectedEventType !== 'ALL') params.event_type = selectedEventType;
      if (dateFilter) params.date_filter = dateFilter;
      if (maxPrice) params.max_price = maxPrice;
      if (freeOnly) params.free = 'true';
      if (sortBy) params.sort = sortBy;
      if (currentPage > 1) params.page = currentPage;

      const data = await eventService.getEvents(params);
      setEvents(data.results || data);
      setTotalCount(data.count || (data.results ? data.results.length : data.length));
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedCity, selectedEventType, dateFilter, maxPrice, freeOnly, sortBy, currentPage]);

  const handleCategoryChange = (catSlug) => {
    setSelectedCategory(catSlug);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedEventType('ALL');
    setDateFilter('');
    setMaxPrice('');
    setFreeOnly(false);
    setSortBy('date_asc');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Explore the Sphere
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
          Discover Extraordinary Events
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Browse upcoming conferences, live festivals, bootcamps and executive meetups.
        </p>
      </div>

      {/* Top Search & Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by title, speaker, city, or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-3 rounded-2xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="lg:hidden px-4 py-2.5 rounded-xl glass-panel text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-primary-500" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-300 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="date_asc">Date: Upcoming First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="created_desc">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills with Images */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white shadow-primary-500/25'
              : 'glass-card text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Events ({totalCount})</span>
        </button>
        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => handleCategoryChange(c.slug)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2.5 border ${
              selectedCategory === c.slug
                ? 'bg-primary-600 text-white border-primary-600 shadow-primary-500/25'
                : 'glass-card text-slate-700 dark:text-slate-200 border-slate-200/60 dark:border-dark-300 hover:bg-slate-100 dark:hover:bg-dark-400'
            }`}
          >
            {c.image_url ? (
              <img
                src={c.image_url}
                alt={c.name}
                className="w-5 h-5 rounded-full object-cover border border-white/20"
              />
            ) : null}
            <span>{c.name}</span>
            {c.event_count ? (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === c.slug ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-dark-400 text-slate-500 dark:text-slate-400'
              }`}>
                {c.event_count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Sidebar Filters (Desktop + Mobile Drawer) */}
        <aside
          className={`lg:block ${
            filterDrawerOpen ? 'fixed inset-0 z-50 p-6 bg-white dark:bg-dark-600 overflow-y-auto' : 'hidden'
          } lg:relative lg:p-6 lg:rounded-3xl lg:glass-panel lg:border lg:border-slate-200/80 lg:dark:border-dark-300 space-y-6`}
        >
          {filterDrawerOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-dark-400 lg:hidden">
              <h3 className="font-display font-bold text-lg">Filter Events</h3>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-500"
              >
                Close
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-400">
            <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-900 dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-primary-500" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories Radio */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Categories
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handleCategoryChange('all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-400'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => handleCategoryChange(c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedCategory === c.slug
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-400'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className={`text-[10px] ${selectedCategory === c.slug ? 'text-primary-100' : 'text-slate-400'}`}>
                    {c.event_count || ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Format */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Format
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'ALL', label: 'All Formats' },
                { id: 'IN_PERSON', label: 'In-Person' },
                { id: 'ONLINE', label: 'Online' },
                { id: 'HYBRID', label: 'Hybrid' },
              ].map((fmt) => (
                <button
                  type="button"
                  key={fmt.id}
                  onClick={() => setSelectedEventType(fmt.id)}
                  className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                    selectedEventType === fmt.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300'
                      : 'border-slate-200 dark:border-dark-400 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* City / Venue */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              City / Location
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Cities</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Goa">Goa</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* Date Range Radios */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Timeframe
            </label>
            <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {[
                { id: '', label: 'Any Date' },
                { id: 'today', label: 'Today' },
                { id: 'this_week', label: 'This Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'upcoming', label: 'Upcoming' },
              ].map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-400">
                  <input
                    type="radio"
                    name="date_filter"
                    checked={dateFilter === t.id}
                    onChange={() => setDateFilter(t.id)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-dark-400">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Max Price (₹)
              </label>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                {maxPrice ? `₹${Number(maxPrice).toLocaleString()}` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={maxPrice || 10000}
              onChange={(e) => setMaxPrice(e.target.value === '10000' ? '' : e.target.value)}
              className="w-full accent-primary-600"
            />
          </div>

        </aside>

        {/* Events Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{events.length}</strong> events
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 rounded-3xl glass-card text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-500 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                No Events Match Your Filters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try broadening your search keyword, category, or city filters to discover more events.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-all shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalCount > 12 && (
                <div className="flex items-center justify-center gap-3 pt-8 pb-4">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded-xl glass-card text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-dark-400 text-slate-800 dark:text-slate-200 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.ceil(totalCount / 12) }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          currentPage === pg
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                            : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-400'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= Math.ceil(totalCount / 12)}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 rounded-xl glass-card text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-dark-400 text-slate-800 dark:text-slate-200 transition-all shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};
