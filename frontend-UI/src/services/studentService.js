import api from './api';

const studentService = {
  getAll: (page = 0, size = 10, search = '') => {
    const params = { page, size };
    if (search) params.search = search;
    return api.get('/api/students', { params }).then((r) => r.data);
  },

  getById: (id) => api.get(`/api/students/${id}`).then((r) => r.data),

  create: (data) => api.post('/api/students', data).then((r) => r.data),

  update: (id, data) => api.put(`/api/students/${id}`, data).then((r) => r.data),

  remove: (id) => api.delete(`/api/students/${id}`),
};

export default studentService;
