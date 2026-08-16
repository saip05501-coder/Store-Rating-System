import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global API Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    const serverMessage = error.response?.data?.message;
    const validationErrors = error.response?.data?.errors;
    
    let formattedMessage = serverMessage || error.message || 'An unexpected error occurred.';
    if (validationErrors && Array.isArray(validationErrors)) {
      formattedMessage = validationErrors.map((e) => e.msg || e).join(' ');
    }

    // Auto-logout on 401 Unauthorized (unless on login page)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject({
      status: error.response?.status,
      message: formattedMessage,
      originalError: error,
    });
  }
);

export default api;
