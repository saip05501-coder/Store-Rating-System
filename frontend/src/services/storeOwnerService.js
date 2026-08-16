import api from '../api/axios';

export const storeOwnerService = {
  async getDashboard() {
    const res = await api.get('/store-owner/dashboard');
    return res.data;
  },

  async getRatings(params) {
    const res = await api.get('/store-owner/ratings', { params });
    return res.data;
  },
};
