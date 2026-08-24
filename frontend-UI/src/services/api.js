import axios from 'axios';

/*
 * API base URL.
 *
 * Defaults to '' (same-origin): /api/* and /uploads/* are served by the
 * SAME host that serves this app — the Vite dev proxy in development and
 * server.js in production. Baking an absolute origin like
 * "http://localhost:8080" into the bundle breaks every device except the
 * machine running the backend: a student's phone would resolve
 * "localhost" to ITSELF and every request would fail before any camera
 * or face-scanning code could run.
 *
 * Set VITE_API_BASE_URL only when the backend genuinely lives on a
 * different origin (e.g. deployed separately).
 */
export const API_ORIGIN =
  import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_ORIGIN,
  timeout: 30000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('mustChangePassword');

      window.location.href = '/login';
    }

    /*
     * A 403 with a valid token usually means the account is still
     * locked behind the first-login password change (the backend
     * strips all roles until the initial password is replaced).
     * Probe the own-profile endpoint once and, when the server says
     * a password change is pending, send the user there instead of
     * letting the UI fill up with failed requests. Anything else is
     * a genuine permission denial and must stay a 403.
     */
    const originalConfig = error.config;

    if (
      error.response?.status === 403 &&
      originalConfig &&
      !originalConfig._authProbeDone &&
      localStorage.getItem('jwt') &&
      !originalConfig.url?.includes('/api/auth/') &&
      !originalConfig.url?.includes('/api/users/me')
    ) {
      originalConfig._authProbeDone = true;
      originalConfig.headers.Authorization = undefined;

      api
        .get('/api/users/me')
        .then((profile) => {
          if (profile?.data?.mustChangePassword === true) {
            localStorage.setItem('mustChangePassword', 'true');
            window.location.href = '/change-password';
          }
        })
        .catch(() => {
          /* probe failed - keep the original 403 behaviour */
        });
    }

    return Promise.reject(error);
  }
);

export default api;