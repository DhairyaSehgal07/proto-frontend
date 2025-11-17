'use client';
import React from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { baseApi } from '@/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/store';
import type { DaybookApiResponse } from '@/types/daybook';
import { daybookKeys, type DaybookQueryParams } from './daybook-keys';

/**
 * Optimized React Query hook for Daybook data
 * Following Next.js 14+ and TanStack Query v5 best practices
 */
export const useDaybook = (params?: DaybookQueryParams) => {
  const { setLoading } = useStore();
  const queryClient = useQueryClient();

  const query = useQuery<DaybookApiResponse, AxiosError<{ message?: string }>>({
    queryKey: daybookKeys.list(params),
    queryFn: async ({ signal }) => {
      const { data } = await baseApi.get<DaybookApiResponse>('/store-admin/daybook', {
        params: {
          type: params?.type,
          commodity: params?.commodity,
          search: params?.search,
          sortBy: params?.sortBy,
          page: params?.page,
          limit: params?.limit,
        },
        signal,
      });
      return data;
    },

    // ✅ OPTIMIZED CACHING STRATEGY
    staleTime: 1000 * 60 * 3, // 3 minutes - balance freshness vs performance
    gcTime: 1000 * 60 * 10, // 10 minutes - longer cache retention

    // ✅ SMART REFETCHING - Avoid unnecessary fetches
    refetchOnWindowFocus: false, // Disable - rely on staleTime instead
    refetchOnMount: false, // Changed from 'always' - use cached data if fresh
    refetchOnReconnect: true, // Keep for offline recovery

    // ✅ PREVENT LAYOUT SHIFTS - Use placeholderData instead of deprecated keepPreviousData
    placeholderData: keepPreviousData,

    // ✅ OPTIMIZED ERROR HANDLING
    retry: 2, // Increased for better reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

    // ✅ ENABLE STRUCTURAL SHARING - Prevent unnecessary re-renders
    structuralSharing: true,
  });

  // ✅ PREFETCH NEXT PAGE - Improve pagination UX
  React.useEffect(() => {
    if (query.data?.pagination?.hasNextPage && params?.page) {
      const nextPageParams = { ...params, page: params.page + 1 };
      queryClient.prefetchQuery({
        queryKey: daybookKeys.list(nextPageParams),
        queryFn: async ({ signal }) => {
          const { data } = await baseApi.get<DaybookApiResponse>('/store-admin/daybook', {
            params: nextPageParams,
            signal,
          });
          return data;
        },
        staleTime: 1000 * 60 * 3,
      });
    }
  }, [query.data, params, queryClient]);

  // ✅ OPTIMIZED LOADING STATE - Only show for initial load
  React.useEffect(() => {
    // Only set loading for initial fetch, not background refetches
    const shouldSetLoading = query.isLoading && !query.isFetching;
    setLoading(shouldSetLoading);

    return () => {
      setLoading(false);
    };
  }, [query.isLoading, query.isFetching, setLoading]);

  // ✅ IMPROVED ERROR HANDLING - Show toast only once
  const hasShownError = React.useRef(false);
  React.useEffect(() => {
    if (query.isError && query.error && !hasShownError.current) {
      const errorMessage =
        query.error.response?.data?.message || query.error.message || 'Failed to fetch daybook';

      toast.error(errorMessage, {
        id: 'daybook-error', // Prevent duplicate toasts
      });
      hasShownError.current = true;
    }

    if (!query.isError) {
      hasShownError.current = false;
    }
  }, [query.isError, query.error]);

  return query;
};

/**
 * Prefetch utility with optimized params
 */
export const usePrefetchDaybook = () => {
  const queryClient = useQueryClient();

  return React.useCallback(
    (params?: DaybookQueryParams) => {
      queryClient.prefetchQuery({
        queryKey: daybookKeys.list(params),
        queryFn: async ({ signal }) => {
          const { data } = await baseApi.get<DaybookApiResponse>('/store-admin/daybook', {
            params,
            signal,
          });
          return data;
        },
        staleTime: 1000 * 60 * 3,
      });
    },
    [queryClient]
  );
};
