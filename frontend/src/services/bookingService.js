import api from './api';

export const bookingService = {
  async validateCoupon(code, subtotal) {
    const res = await api.post('/coupons/validate/', { code, subtotal });
    return res.data;
  },

  async createBooking(bookingData) {
    const res = await api.post('/bookings/create/', bookingData);
    return res.data;
  },

  async getUserBookings(status) {
    const params = status ? { status } : {};
    const res = await api.get('/bookings/', { params });
    return res.data.results || res.data;
  },

  async getBookingDetail(id) {
    const res = await api.get(`/bookings/${id}/`);
    return res.data;
  },

  async cancelBooking(id, reason) {
    const res = await api.post(`/bookings/${id}/cancel/`, { reason });
    return res.data;
  },

  async getOrganizerBookings(eventId) {
    const params = eventId ? { event_id: eventId } : {};
    const res = await api.get('/organizer/bookings/', { params });
    return res.data.results || res.data;
  }
};

export const paymentService = {
  async createRazorpayOrder(bookingId) {
    const res = await api.post('/payments/create-order/', { booking_id: bookingId });
    return res.data;
  },

  async verifyPayment(verificationData) {
    const res = await api.post('/payments/verify/', verificationData);
    return res.data;
  }
};

export const ticketService = {
  async getUserTickets() {
    const res = await api.get('/tickets/');
    return res.data.results || res.data;
  },

  async getTicketDetail(id) {
    const res = await api.get(`/tickets/${id}/`);
    return res.data;
  },

  async verifyTicket(ticketIdentifier) {
    const isUuid = ticketIdentifier.includes('-') && ticketIdentifier.length > 20 && !ticketIdentifier.startsWith('TKT');
    const payload = isUuid ? { ticket_id: ticketIdentifier } : { ticket_number: ticketIdentifier };
    const res = await api.post('/tickets/verify/', payload);
    return res.data;
  },

  async checkInTicket(id) {
    const res = await api.post(`/tickets/${id}/check-in/`);
    return res.data;
  }
};

export const reviewService = {
  async getEventReviews(eventId) {
    const res = await api.get(`/events/${eventId}/reviews/`);
    return res.data.results || res.data;
  },

  async submitReview(eventId, reviewData) {
    const res = await api.post(`/events/${eventId}/reviews/`, reviewData);
    return res.data;
  }
};

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications/');
    return res.data.results || res.data;
  },

  async markAsRead(id) {
    const res = await api.post(`/notifications/${id}/read/`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.post('/notifications/read-all/');
    return res.data;
  }
};

export const adminService = {
  async getAdminAnalytics() {
    const res = await api.get('/admin/analytics/');
    return res.data;
  },

  async getPendingApprovals(status = 'PENDING_APPROVAL') {
    const res = await api.get('/admin/event-approvals/', { params: { status } });
    return res.data.results || res.data;
  },

  async approveEvent(id) {
    const res = await api.post(`/admin/event-approvals/${id}/approve/`);
    return res.data;
  },

  async rejectEvent(id, reason) {
    const res = await api.post(`/admin/event-approvals/${id}/reject/`, { reason });
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/auth/admin/users/', { params });
    return res.data.results || res.data;
  },

  async updateUser(id, data) {
    const res = await api.patch(`/auth/admin/users/${id}/`, data);
    return res.data;
  },

  async getBookings(params = {}) {
    const res = await api.get('/admin/bookings/', { params });
    return res.data.results || res.data;
  },

  async getPayments(params = {}) {
    const res = await api.get('/admin/payments/', { params });
    return res.data.results || res.data;
  },

  async getCoupons() {
    const res = await api.get('/admin/coupons/');
    return res.data.results || res.data;
  },

  async createCoupon(data) {
    const res = await api.post('/admin/coupons/', data);
    return res.data;
  },

  async updateCoupon(id, data) {
    const res = await api.patch(`/admin/coupons/${id}/`, data);
    return res.data;
  },

  async deleteCoupon(id) {
    const res = await api.delete(`/admin/coupons/${id}/`);
    return res.data;
  }
};
