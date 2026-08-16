import api from '../api/axios';

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getUsers(params) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async getUserById(id) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  async createUser(userData) {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },

  async getStores(params) {
    const res = await api.get('/admin/stores', { params });
    return res.data;
  },

  async createStore(storeData) {
    const res = await api.post('/admin/stores', storeData);
    return res.data;
  },

  async getAuditLogs(params) {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },

  async getAuditStats() {
    const res = await api.get('/admin/audit-logs/stats');
    return res.data;
  },
};

