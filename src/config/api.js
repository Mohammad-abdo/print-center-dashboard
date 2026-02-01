import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:6008/api',
  baseURL: import.meta.env.VITE_API_URL || 'https://back-studify.developteam.site/api',
});

// Add token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('print_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
