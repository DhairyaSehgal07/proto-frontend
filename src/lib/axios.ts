// src/lib/axios.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

// ✅ Create base Axios instance
export const baseApi: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1/base`,
  withCredentials: true, // ensures browser sends cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// ✅ Request Interceptor (optional, only for logging/debugging)
baseApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // No need to manually attach JWT — cookie is sent automatically
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

    // Handle Unauthorized (401) - redirect to login
    if (status === 401 && typeof window !== 'undefined') {
      // Browser cookie is HTTP-only, no need to remove manually
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
      if (error.code === 'ERR_CANCELED' || error.message === 'canceled') {
        return Promise.reject(error);
      }

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
