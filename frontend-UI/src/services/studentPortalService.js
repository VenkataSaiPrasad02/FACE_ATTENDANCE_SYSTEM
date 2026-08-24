import api from './api';

/*
 * Student self-service endpoints. Everything is scoped server-side to
 * the authenticated student account — no student ids are sent.
 */
export const studentPortalService = {
  getMe: () => api.get('/api/student-portal/me'),
  getMySession: () => api.get('/api/student-portal/me/session'),
  getMyAttendance: ({
    page = 0,
    size = 10,
    startDate,
    endDate,
    status,
  } = {}) =>
    api.get('/api/student-portal/me/attendance', {
      params: { page, size, startDate, endDate, status },
    }),
  getMySummary: () => api.get('/api/student-portal/me/summary'),
};

export default studentPortalService;
