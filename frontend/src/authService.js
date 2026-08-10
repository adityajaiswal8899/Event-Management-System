import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register/', data);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login/', credentials);
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/auth/profile/');
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.patch('/auth/profile/', data);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  },

  async changePassword(data) {
    const res = await api.put('/auth/change-password/', data);
    return res.data;
  },

  async requestPasswordReset(email) {
    const res = await api.post('/auth/password-reset/request/', { email });
    return res.data;
  },

  async confirmPasswordReset(token, new_password) {
    const res = await api.post('/auth/password-reset/confirm/', { token, new_password });
    return res.data;
  },

  async getPopularOrganizers() {
    const res = await api.get('/auth/organizers/popular/');
    return res.data.results || res.data || [];
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
