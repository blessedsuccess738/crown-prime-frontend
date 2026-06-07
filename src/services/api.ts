import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('crown-prime-auth');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed?.state?.token) {
      config.headers.Authorization = `Bearer ${parsed.state.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crown-prime-auth');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
