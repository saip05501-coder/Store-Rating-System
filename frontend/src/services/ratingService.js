import api from '../api/axios';

export const ratingService = {
  async submitRating({ store_id, rating }) {
    const res = await api.post('/ratings', { store_id, rating });
    return res.data;
  },

  async submitStoreRating(storeId, rating) {
    const res = await api.post(`/stores/${storeId}/ratings`, { rating });
    return res.data;
  },

  async modifyStoreRating(storeId, rating) {
    const res = await api.put(`/stores/${storeId}/ratings`, { rating });
    return res.data;
  },

  async getMyRatings(params = {}) {
    const res = await api.get('/ratings/my', { params });
    return res.data;
  },

  async getStoreRatings(storeId, params = {}) {
    const res = await api.get(`/ratings/store/${storeId}`, { params });
    return res.data;
  },
};

