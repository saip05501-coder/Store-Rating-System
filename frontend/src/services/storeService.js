import api from '../api/axios';

export const storeService = {
  async getStores(params = {}) {
    const res = await api.get('/stores', { params });
    return res.data;
  },

  async getStoreById(id) {
    const res = await api.get(`/stores/${id}`);
    return res.data;
  },

  async getPlatformStats() {
    const res = await api.get('/stores/stats');
    return res.data;
  },

  async createStore(storeData) {
    const res = await api.post('/stores', storeData);
    return res.data;
  },

  async updateStore(id, storeData) {
    const res = await api.put(`/stores/${id}`, storeData);
    return res.data;
  },

  async deleteStore(id) {
    const res = await api.delete(`/stores/${id}`);
    return res.data;
  },
};
