import axios from 'axios';

// Backend origin used for API calls and backend-served assets
export const API_ORIGIN =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;