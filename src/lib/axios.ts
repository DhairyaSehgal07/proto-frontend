// src/lib/axios.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getCookie } from './utils';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

// ✅ Create base Axios instance
export const baseApi: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1/base`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  // Optional: Prevents long-hanging requests in production
  timeout: 10000, // 10 seconds
});

// Track if we're currently refreshing to prevent infinite loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ✅ Request Interceptor
baseApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are automatically sent with withCredentials: true
    // No need to manually set Authorization header for cookie-based auth
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor
baseApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Handle Unauthorized (401) - Attempt token refresh
    if (
      status === 401 &&
      typeof window !== 'undefined' &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return baseApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from cookie
        const refreshToken = getCookie('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh the token
        const refreshResponse = await axios.post<{
          success: boolean;
          message: string;
          data: {
            accessToken: string;
            refreshToken: string;
          };
        }>(
          `${BASE_URL}/api/v1/base/store-admin/refresh`,
          { refreshToken },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Tokens are set as cookies by the server, so we just need to retry the request
        processQueue(null, refreshResponse.data.data.accessToken);

        // Retry the original request
        return baseApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear everything and redirect to login
        processQueue(refreshError as AxiosError, null);

        // Clear any remaining cookies (they should be cleared by server, but just in case)
        if (typeof document !== 'undefined') {
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        // Prevent infinite redirect loop
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle Forbidden (403)
    if (status === 403) {
      console.error('[Axios] 403 Forbidden — insufficient permissions');
    }

    // Handle Network or Server Errors
    if (!error.response) {
      console.error('[Axios] Network error or server unavailable');
    }

    return Promise.reject(error.response?.data || { message: 'Something went wrong', status });
  }
);

// ✅ Export custom typed error
export type ApiError = AxiosError<{ message?: string; status?: number }>;
