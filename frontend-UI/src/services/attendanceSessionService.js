import api from './api';

/*
 * Teacher-controlled attendance sessions.
 * Backend enforces session state, batch eligibility, the 50 m geofence,
 * expiry, duplicate prevention, and face-identity matching — these calls
 * only carry data (location, camera frame), never permissions or ids
 * that could widen access.
 */
export const attendanceSessionService = {
  /** Staff: open a session for an academic period at current location. */
  open: ({ academicPeriodId, latitude, longitude }) =>
    api.post('/api/attendance-sessions/open', {
      academicPeriodId,
      latitude,
      longitude,
    }),

  /** Staff: sessions currently OPEN. */
  getActive: () => api.get('/api/attendance-sessions/active'),

  /** Staff: academic periods that can be opened (read-only picker feed). */
  getOpenablePeriods: () => api.get('/api/attendance-sessions/periods'),

  /** Staff: single session. */
  getById: (id) => api.get(`/api/attendance-sessions/${id}`),

  /** Staff: close before expiry. */
  close: (id) => api.post(`/api/attendance-sessions/${id}/close`),

  /**
   * Student: the open session they are eligible to attend lives in
   * studentPortalService.getMySession() — the single source both the
   * dashboard banner and TakeAttendancePage read. Do not add a second
   * active-session lookup here.
   */

  /** Student: full server-validated attendance attempt. */
  takeAttendance: (id, { latitude, longitude, imageBase64 }) =>
    api.post(`/api/attendance-sessions/${id}/attendance`, {
      latitude,
      longitude,
      imageBase64,
    }),
};

export default attendanceSessionService;
