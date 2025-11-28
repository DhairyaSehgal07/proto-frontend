'use client';

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { baseApi } from '@/lib/axios';
import { ApiResponse } from '@/types/apiResponse';
import { DaybookOrder } from '@/types/daybook';
import { toast } from 'sonner';
import { useEffect } from 'react';
import getQueryClient from '@/lib/get-query-client';

const queryClient = getQueryClient();

export type FarmerOrderType = 'all' | 'incoming' | 'outgoing';

export interface UseGetOrdersOfFarmerParams {
  farmerStorageLinkId: string;
  type: FarmerOrderType;
  enabled?: boolean;
}

export const useGetOrdersOfFarmer = ({
  farmerStorageLinkId,
  type,
  enabled = true,
}: UseGetOrdersOfFarmerParams) => {
  const query = useQuery<
    ApiResponse<DaybookOrder[]>,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['farmer-orders', farmerStorageLinkId, type],
    queryFn: async () => {
      const { data } = await baseApi.get<ApiResponse<DaybookOrder[]>>(
        '/store-admin/farmer/orders',
        {
          params: {
            farmerStorageLinkId,
            type,
          },
        }
      );
      return data;
    },
    enabled: enabled && !!farmerStorageLinkId && !!type,
  });

  // 🔥 Error toast handler
  useEffect(() => {
    if (query.isError && query.error) {
      const message =
        query.error.response?.data?.error?.message ||
        query.error.response?.data?.message ||
        query.error.message ||
        'Failed to fetch farmer orders';
      toast.error(message);
    }
  }, [query.isError, query.error]);

  return query;
};

export const prefetchFarmerOrders = async (farmerStorageLinkId: string, type: FarmerOrderType) => {
  await queryClient.prefetchQuery({
    queryKey: ['farmer-orders', farmerStorageLinkId, type],
    queryFn: async (): Promise<ApiResponse<DaybookOrder[]>> => {
      const { data } = await baseApi.get('/store-admin/farmer/orders', {
        params: {
          farmerStorageLinkId,
          type,
        },
      });
      return data;
    },
  });
};
