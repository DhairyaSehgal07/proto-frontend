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

// ✅ Request Interceptor
baseApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get JWT token from cookie and set Authorization header
    // Backend expects Authorization header even though we also send cookies
    const jwtToken = getCookie('jwt');
    if (jwtToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
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
    const originalRequest = error.config as InternalAxiosRequestConfig;
    const status = error.response?.status;

    // Handle Unauthorized (401) - Redirect to login
    if (status === 401 && typeof window !== 'undefined') {
      // Clear JWT cookie
      Cookies.remove('jwt', { path: '/' });

      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
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
