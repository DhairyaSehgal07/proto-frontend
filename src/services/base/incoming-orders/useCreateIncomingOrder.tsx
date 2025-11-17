'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store';
import { baseApi } from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type {
  CreateIncomingOrderInput,
  CreateIncomingOrderApiResponse,
} from '@/types/incomingorder';

export const useCreateIncomingOrder = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useStore();

  return useMutation<
    CreateIncomingOrderApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    CreateIncomingOrderInput
  >({
    mutationKey: ['incoming-orders', 'create'],

    // -------------------------
    // Mutation Function
    // -------------------------
    mutationFn: async (payload) => {
      setLoading(true);

      const { data } = await baseApi.post<CreateIncomingOrderApiResponse>(
        '/incoming-orders',
        payload
      );

      return data;
    },

    // -------------------------
    // Success Handler
    // -------------------------
    onSuccess: (data) => {
      setLoading(false);

      if (!data.success) {
        toast.error(data.data?.order ? 'Unexpected error' : data.message);
        return;
      }

      toast.success(data.message || 'Incoming order created!');

      // Invalidate relevant queries (if you have lists, dashboards, etc.)
      queryClient.invalidateQueries({ queryKey: ['incoming-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },

    // -------------------------
    // Error Handler
    // -------------------------
    onError: (error) => {
      setLoading(false);

      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Failed to create incoming order';

      toast.error(message);
    },
  });
};
