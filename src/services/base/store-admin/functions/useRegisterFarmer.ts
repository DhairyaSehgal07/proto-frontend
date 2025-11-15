import { useMutation, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '@/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { storeAdminFarmerRegisterSchema } from '@/schemas/storeAdminFarmerRegister';
import type { z } from 'zod';
import type { ApiResponse } from '@/types/apiResponse';

type RegisterFarmerInput = z.infer<typeof storeAdminFarmerRegisterSchema>;

export const useStoreAdminRegisterFarmer = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, AxiosError<ApiResponse>, RegisterFarmerInput>({
    mutationFn: async (payload) => {
      const validated = storeAdminFarmerRegisterSchema.parse(payload);

      const res = await baseApi.post<ApiResponse>('/store-admin/farmer/register', validated);

      return res.data;
    },

    onSuccess: (data) => {
      toast.success(data.message || 'Farmer registered successfully');

      // 👇 Invalidate any queries if needed (example: farmer list)
      queryClient.invalidateQueries({
        queryKey: ['farmers'],
      });
    },

    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to register farmer';
      toast.error(msg);
    },
  });
};
