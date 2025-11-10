import { useMutation, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '@/lib/axios';
import type { StoreAdminLoginInput, StoreAdminLoginResponse } from '@/types/storeAdmin';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useStoreAdminLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    StoreAdminLoginResponse,
    AxiosError<{ message?: string }>,
    StoreAdminLoginInput
  >({
    mutationKey: ['store-admin', 'login'],
    mutationFn: async (payload) => {
      const { data } = await baseApi.post('/store-admin/login', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Logged in successfully!');
      queryClient.invalidateQueries({ queryKey: ['store-admin', 'profile'] });
      router.push('/dashboard');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        'Login failed';
      toast.error(errorMessage);
    },
  });
};
