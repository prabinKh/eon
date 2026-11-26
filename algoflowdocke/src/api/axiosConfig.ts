import axios from 'axios';
import { getTenantHeaders, tenantStorageKey } from '@/lib/tenant';
import { safeStorage } from '@/lib/storage';
import { normalizeApiUrl } from '@/api/apiUrl';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const url = typeof config.url === 'string' ? config.url : '';
    config.url = normalizeApiUrl(url, API_URL);

    // Get token directly from storage to avoid circular dependency with authService
    const token = safeStorage.getItem(tenantStorageKey("access_token")) || safeStorage.getItem("access_token");
    
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantHeaders = getTenantHeaders();
    Object.assign(config.headers, tenantHeaders);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = safeStorage.getItem(tenantStorageKey("access_token")) || safeStorage.getItem("access_token");
      // Clear expired tokens across all keys
      safeStorage.removeItem(tenantStorageKey("access_token"));
      safeStorage.removeItem(tenantStorageKey("refresh_token"));
      safeStorage.removeItem("access_token");
      safeStorage.removeItem("refresh_token");
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token");
      } catch {}

      // Only redirect to /signin if the user was previously logged in
      // AND is currently on a protected route (e.g. /admin/*)
      const isProtectedRoute = window.location.pathname.startsWith('/admin')
        || window.location.pathname.startsWith('/customer');
      if (hadToken && isProtectedRoute && window.location.pathname !== '/signin') {
        console.warn('Session expired — redirecting to sign in.');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
