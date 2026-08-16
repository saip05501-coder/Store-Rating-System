import api from '../api/axios';

export const demoService = {
  async load() {
    const res = await api.post('/demo/load');
    return res.data;
  },
};
