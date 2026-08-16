import api from '../api/axios';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await api.put('/users/profile', profileData);
    return res.data;
  },

  async getOwnerDashboard() {
    const res = await api.get('/users/owner-dashboard');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/users', { params });
    return res.data;
  },

  async createUser(userData) {
    const res = await api.post('/users', userData);
    return res.data;
  },

  async getUserById(id) {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
};
