// src/lib/axios.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { getCookie } from './utils';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

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

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// ✅ Request Interceptor
baseApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from cookie and set Authorization header
    // Backend expects Authorization header even though we also send cookies
    const accessToken = getCookie('accessToken');
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
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
          .then(() => baseApi(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from cookie
        const refreshToken = getCookie('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call Next.js API route for token refresh (handles cookie management)
        // This route proxies to the backend and sets cookies properly
        const refreshResponse = await axios.post(
          '/api/refresh',
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Verify refresh was successful
        if (!refreshResponse.data?.success) {
          throw new Error('Token refresh failed');
        }

        // Tokens are set as cookies by the API route, so we just need to retry the request
        processQueue(null);

        // Clear the old Authorization header so the request interceptor can set the new one
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }

        // Retry the original request (request interceptor will add new Authorization header)
        return baseApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear everything and redirect to login
        processQueue(refreshError as AxiosError);

        // Clear any remaining cookies (they should be cleared by server, but just in case)
        if (typeof window !== 'undefined') {
          Cookies.remove('accessToken', { path: '/' });
          Cookies.remove('refreshToken', { path: '/' });
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
      // Don't log cancellation errors (expected behavior)
      if (error.code === 'ERR_CANCELED' || error.message === 'canceled') {
        return Promise.reject(error);
      }

      // Provide more context about the failed request
      const requestUrl = originalRequest?.url || 'unknown';
      const requestMethod = originalRequest?.method?.toUpperCase() || 'UNKNOWN';
      const errorMessage = error.message || 'Network error or server unavailable';

      console.error(`[Axios] Network error: ${errorMessage}`, {
        method: requestMethod,
        url: requestUrl,
        code: error.code,
      });
    }

    return Promise.reject(error);
  }
);

// ✅ Export custom typed error
export type ApiError = AxiosError<{ message?: string; status?: number }>;
