import api from './api';

const academicPeriodService = {

  getAll: async () => {
    const response = await api.get('/api/academic-periods');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/academic-periods/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(
      '/api/academic-periods',
      data
    );
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(
      `/api/academic-periods/${id}`,
      data
    );
    return response.data;
  },

  activate: async (id) => {
    const response = await api.put(
      `/api/academic-periods/${id}/activate`
    );
    return response.data;
  },

  deactivate: async (id) => {
    const response = await api.put(
      `/api/academic-periods/${id}/deactivate`
    );
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(
      `/api/academic-periods/${id}`
    );
    return response.data;
  },

};

export default academicPeriodService;