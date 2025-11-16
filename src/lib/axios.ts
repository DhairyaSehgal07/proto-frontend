// src/lib/axios.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useStore } from '@/store';

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

// ✅ Request Interceptor - Add Authorization Bearer token from store
baseApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from store (only in browser environment)
    if (typeof window !== 'undefined') {
      const { token, tokenExpiry } = useStore.getState();

      // Check if token exists and hasn't expired
      if (token && tokenExpiry && Date.now() < tokenExpiry) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    // Handle Unauthorized (401) - clear token and redirect to login
    if (status === 401 && typeof window !== 'undefined') {
      // Clear admin data (including token) from store
      useStore.getState().clearAdminData();

      // Redirect to login if not already there
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
