import api from './api';

const attendanceService = {
  recognize: (imageBase64, notes = null) => {
    const payload = { imageBase64 };
    if (notes) payload.notes = notes;
    return api.post('/api/attendance/recognize', payload).then((r) => r.data);
  },

  getAll: (params = {}) =>
    api.get('/api/attendance', { params }).then((r) => r.data),

  getAbsentStudents: (params = {}) =>
    api.get('/api/attendance/absent', { params }).then((r) => r.data),

  getSummaryToday: () =>
    api.get('/api/attendance/summary/today').then((r) => r.data),

  getDashboardStats: () =>
    api.get('/api/dashboard/stats').then((r) => r.data),
};

export default attendanceService;
