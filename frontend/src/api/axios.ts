import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Access environment variable or default to localhost
let baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');
if (baseURL.endsWith('/api')) {
  baseURL = baseURL.slice(0, -4);
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Do NOT redirect or clear state if this 401 is from a login request
        const isLoginEndpoint = error.config?.url?.includes('/api/auth/login');
        if (!isLoginEndpoint) {
          useAuthStore.getState().logout();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else if (error.response.status === 403) {
        // Forbidden
        console.error('Access Forbidden: You lack the required permissions.');
      }
    }
    return Promise.reject(error);
  }
);
