import api from '../api/axios';

export const authService = {
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  async registerOwner(ownerData) {
    const res = await api.post('/auth/register-owner', ownerData);
    return res.data;
  },

  async registerAdmin(adminData) {
    const res = await api.post('/auth/register-admin', adminData);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async changePassword(passwords) {
    const res = await api.post('/auth/change-password', passwords);
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};


