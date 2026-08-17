import api from './api';

const teacherService = {

  getAll: async (page = 0, size = 10) => {
    const response = await api.get('/api/teachers', {
      params: {
        page,
        size
      }
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/teachers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/teachers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/teachers/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/api/teachers/${id}`);
    return response.data;
  }

};

export default teacherService;