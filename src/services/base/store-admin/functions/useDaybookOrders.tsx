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
 * Daybook React Query Hook — Balanced Freshness Mode
 * Freshness window: 15 seconds
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

    // ✅ BALANCED FRESHNESS CONFIG
    staleTime: 15_000, // 15 seconds — fresh enough, avoids constant hits
    gcTime: 1000 * 60 * 10, // keep old cache for 10 minutes

    // refetch logic
    refetchOnMount: true, // refetch if stale (after 15s)
    refetchOnWindowFocus: true, // refetch on tab focus if stale
    refetchOnReconnect: true,

    // placeholder for smoother pagination
    placeholderData: keepPreviousData,

    // retry behavior
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    structuralSharing: true,
  });

  /**
   * Prefetch next page for smooth pagination
   */
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
        staleTime: 15_000,
      });
    }
  }, [query.data, params, queryClient]);

  /**
   * Loading state (only for initial load)
   */
  React.useEffect(() => {
    const shouldSetLoading = query.isLoading && !query.isFetching;
    setLoading(shouldSetLoading);

    return () => {
      setLoading(false);
    };
  }, [query.isLoading, query.isFetching, setLoading]);

  /**
   * Toast errors — once per error occurrence
   */
  const hasShownError = React.useRef(false);

  React.useEffect(() => {
    if (query.isError && query.error && !hasShownError.current) {
      const errorMessage =
        query.error.response?.data?.message || query.error.message || 'Failed to fetch daybook';

      toast.error(errorMessage, { id: 'daybook-error' });
      hasShownError.current = true;
    }

    if (!query.isError) {
      hasShownError.current = false;
    }
  }, [query.isError, query.error]);

  return query;
};

/**
 * Prefetch helper
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
        staleTime: 15_000,
      });
    },
    [queryClient]
  );
};
