import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Get or create a QueryClient instance for server-side prefetching
 * Uses React's cache to ensure the same instance is used within a request
 */
const getQueryClient = cache(() => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
});

export default getQueryClient;
