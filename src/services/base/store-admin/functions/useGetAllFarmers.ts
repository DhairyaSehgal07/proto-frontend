'use client';

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { baseApi } from '@/lib/axios';
import { ApiResponse } from '@/types/apiResponse';
import { toast } from 'sonner';
import { useEffect } from 'react';
import getQueryClient from '@/lib/get-query-client';

const queryClient = getQueryClient();

export interface StoreAdminFarmer {
  id: string;
  farmerId: string;
  name: string;
  mobileNumber: string;
  address: string;
  accountNumber: number;
  isActive: boolean;
}

export const useGetAllFarmers = () => {
  const query = useQuery<
    ApiResponse<StoreAdminFarmer[]>,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['farmers'],
    queryFn: async () => {
      const { data } = await baseApi.get<ApiResponse<StoreAdminFarmer[]>>('/store-admin/farmers');
      return data;
    },
  });

  // 🔥 Error toast handler
  useEffect(() => {
    if (query.isError && query.error) {
      const message =
        query.error.response?.data?.error?.message ||
        query.error.response?.data?.message ||
        query.error.message ||
        'Failed to fetch farmers';
      toast.error(message);
    }
  }, [query.isError, query.error]);

  return query;
};

export const prefetchAllFarmers = async () => {
  await queryClient.prefetchQuery({
    queryKey: ['farmers'],
    queryFn: async (): Promise<ApiResponse<StoreAdminFarmer[]>> => {
      const { data } = await baseApi.get('/store-admin/farmers');
      return data;
    },
  });
};
