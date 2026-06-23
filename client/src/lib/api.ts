import axios, { AxiosError } from 'axios';
import { API_URL } from '../config/constants';
import { syncEngine } from './syncEngine';

// Retrieve tenant subdomain from host or fallback storage
export const getSubdomain = (): string | null => {
  const host = window.location.host;
  const parts = host.split('.');
  if (parts.length > 1) {
    const firstPart = parts[0];
    if (firstPart !== 'www' && firstPart !== 'api' && firstPart !== 'localhost') {
      return firstPart;
    }
  }
  // Allow localstorage fallback for dev testing/mocking
  return localStorage.getItem('tenant_subdomain') || 'greenwood';
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request Interceptor: Inject JWT and Subdomain headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const subdomain = getSubdomain();
    if (subdomain) {
      config.headers['X-Tenant-Subdomain'] = subdomain;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Refresh Tokens on 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Check if network error (offline)
    if (!error.response && !navigator.onLine && originalRequest) {
      const { method, url, data, headers } = originalRequest;
      
      // Only queue mutations (POST, PUT, DELETE, PATCH)
      if (method && ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
        await syncEngine.enqueue({
          url: url || '',
          method,
          data: data ? JSON.parse(data as string) : undefined,
          headers
        });
        
        // Return a mock success response so the UI doesn't crash
        return Promise.resolve({ data: { success: true, offline: true, message: 'Saved offline. Will sync when online.' }, status: 200, statusText: 'OK', headers: {}, config: originalRequest });
      }
    }

    // Do not intercept 401s for login or refresh routes themselves
    if (originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      (originalRequest as any)._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth state and redirect to login
        localStorage.removeItem('accessToken');
        // Let application state catch this or trigger logout event
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;
