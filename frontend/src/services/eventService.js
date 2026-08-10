import api from './api';

export const eventService = {
  async getCategories() {
    const res = await api.get('/categories/');
    return res.data.results || res.data;
  },

  async getEvents(params = {}) {
    const res = await api.get('/events/', { params });
    return res.data;
  },

  async getFeaturedEvents() {
    const res = await api.get('/events/featured/');
    return res.data.results || res.data;
  },

  async getTrendingEvents() {
    const res = await api.get('/events/trending/');
    return res.data.results || res.data;
  },

  async getUpcomingEvents() {
    const res = await api.get('/events/upcoming/');
    return res.data.results || res.data;
  },

  async getEventDetail(slug) {
    const res = await api.get(`/events/${slug}/`);
    return res.data;
  },

  async getWishlist() {
    const res = await api.get('/wishlist/');
    return res.data.results || res.data;
  },

  async toggleWishlist(eventId) {
    const res = await api.post(`/wishlist/toggle/${eventId}/`);
    return res.data;
  },

  // Organizer event APIs
  async getOrganizerEvents() {
    const res = await api.get('/organizer/events/');
    return res.data.results || res.data;
  },

  async getOrganizerEventDetail(id) {
    const res = await api.get(`/organizer/events/${id}/`);
    return res.data;
  },

  async createEvent(data) {
    const res = await api.post('/organizer/events/', data);
    return res.data;
  },

  async updateEvent(id, data) {
    const res = await api.patch(`/organizer/events/${id}/`, data);
    return res.data;
  },

  async deleteEvent(id) {
    const res = await api.delete(`/organizer/events/${id}/`);
    return res.data;
  },

  async getOrganizerAnalytics() {
    const res = await api.get('/organizer/analytics/');
    return res.data;
  }
};
