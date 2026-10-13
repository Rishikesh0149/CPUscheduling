import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Cannot connect to the backend. Make sure the server is running on port 8080.'));
    }
    return Promise.reject(error);
  }
);

export default api;
