'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '@/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/store';
import type { DaybookApiResponse } from '@/types/daybook';
import { daybookKeys, type DaybookQueryParams } from './daybook-keys';

/**
 * React Query hook to fetch Daybook data (incoming/outgoing orders)
 * Optimized for high-frequency route access
 */
export const useDaybook = (params?: DaybookQueryParams) => {
  const { setLoading } = useStore();
  const defaultErrorMessage = 'Failed to fetch daybook';

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
        signal, // Enable request cancellation
      });

      return data;
    },
    // Aggressive caching for frequently accessed route
    staleTime: 1000 * 60 * 2, // 2 minutes - data stays fresh longer
    gcTime: 1000 * 60 * 5, // 5 minutes - keep in cache longer

    // Smart refetching strategy
    refetchOnWindowFocus: true, // Re-enable for data freshness
    refetchOnMount: 'always', // Always fetch on mount for critical data
    refetchOnReconnect: true,

    // Performance optimizations
    retry: 1, // Reduce retries for faster failure feedback
    retryDelay: 500, // Quick retry for transient failures

    // Prevent layout shifts
    placeholderData: (previousData) => previousData,
  });

  // Handle loading state synchronization
  const isLoadingOrFetching = query.isLoading || query.isFetching;

  React.useEffect(() => {
    setLoading(isLoadingOrFetching);

    return () => {
      // Cleanup: reset loading on unmount
      setLoading(false);
    };
  }, [isLoadingOrFetching, setLoading]);

  // Centralized error handling
  React.useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage =
        query.error.response?.data?.message || query.error.message || defaultErrorMessage;

      toast.error(errorMessage);
    }
  }, [query.isError, query.error, defaultErrorMessage]);

  return query;
};

// Optional: Prefetch utility for link hover/navigation optimization
export const usePrefetchDaybook = () => {
  const queryClient = useQueryClient();

  return (params?: DaybookQueryParams) => {
    queryClient.prefetchQuery({
      queryKey: daybookKeys.list(params),
      queryFn: async ({ signal }) => {
        const { data } = await baseApi.get<DaybookApiResponse>('/store-admin/daybook', {
          params,
          signal,
        });
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  };
};
