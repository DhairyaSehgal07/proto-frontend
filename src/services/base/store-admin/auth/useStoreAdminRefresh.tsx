import { useMutation } from '@tanstack/react-query';
import { baseApi } from '@/lib/axios';
import { AxiosError } from 'axios';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Hook to refresh access token using refresh token
 * Note: This is typically called automatically by axios interceptor
 */
export const useStoreAdminRefresh = () => {
  return useMutation<RefreshTokenResponse, AxiosError<{ message?: string }>, RefreshTokenInput>({
    mutationKey: ['store-admin', 'refresh'],
    mutationFn: async (payload) => {
      const { data } = await baseApi.post<RefreshTokenResponse>('/store-admin/refresh', payload);
      return data;
    },
  });
};
