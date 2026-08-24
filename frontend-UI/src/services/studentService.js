import api from './api';

const studentService = {
  /**
   * Paginated list with server-side search + course/batch/semester/year
   * filters — the browser never needs to load the whole table.
   */
  getAll: ({ page = 0, size = 10, search = '', course, batch, semester, year, teacherId } = {}) => {
    const params = { page, size };
    if (search) params.search = search;
    if (course) params.course = course;
    if (batch) params.batch = batch;
    if (semester) params.semester = semester;
    if (year) params.year = year;
    if (teacherId) params.teacherId = teacherId;
    return api.get('/api/students', { params }).then((r) => r.data);
  },

  /** Distinct course/batch/semester/year values for filter dropdowns. */
  getFilterOptions: () =>
    api.get('/api/students/filter-options').then((r) => r.data),

  getById: (id) => api.get(`/api/students/${id}`).then((r) => r.data),

  create: (data) => api.post('/api/students', data).then((r) => r.data),

  update: (id, data) => api.put(`/api/students/${id}`, data).then((r) => r.data),

  remove: (id) => api.delete(`/api/students/${id}`),
};

export default studentService;
