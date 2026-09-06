// Configured Axios instance with token handling
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
});

// Read token from localStorage
const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('prepai-auth');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed?.state ?? parsed;
  } catch {
    return {};
  }
};

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getStoredAuth();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only retry once on 401
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken } = getStoredAuth();

    if (!refreshToken) {
      // No refresh token — force logout by clearing storage
      localStorage.removeItem('prepai-auth');
      window.dispatchEvent(new Event('auth:logout'));
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
        { refreshToken }
      );

      const newToken = data.accessToken;

      // Update stored token — preserve Zustand persist wrapper { state: { ... } }
      const raw = localStorage.getItem('prepai-auth');
      const zustandStore = raw ? JSON.parse(raw) : { state: {} };
      zustandStore.state = { ...zustandStore.state, accessToken: newToken };
      localStorage.setItem('prepai-auth', JSON.stringify(zustandStore));


      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('prepai-auth');
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
