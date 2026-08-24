import api from './api';

const autoFillService = {
  getAll: async () => {
    const response = await api.get('/api/student-auto-fill');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/student-auto-fill/${id}`);
    return response.data;
  },

  create: async ({ name, course, batch, year, semester, active }) => {
    const response = await api.post('/api/student-auto-fill', {
      name,
      course,
      batch,
      year,
      semester,
      active: Boolean(active),
    });
    return response.data;
  },

  update: async (id, { name, course, batch, year, semester, active }) => {
    const response = await api.put(`/api/student-auto-fill/${id}`, {
      name,
      course,
      batch,
      year,
      semester,
      active: Boolean(active),
    });
    return response.data;
  },

  activate: async (id) => {
    const response = await api.put(
      `/api/student-auto-fill/${id}/activate`
    );
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/api/student-auto-fill/${id}`);
    return response.data;
  },
};

export default autoFillService;
