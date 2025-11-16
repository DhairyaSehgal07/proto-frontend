import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { baseApi } from '@/lib/axios';
import type { StoreAdminLoginInput, StoreAdminLoginResponse } from '@/types/storeAdmin';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
export const useStoreAdminLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setAdminData, setLoading } = useStore();

  return useMutation<
    StoreAdminLoginResponse,
    AxiosError<{ message?: string }>,
    StoreAdminLoginInput
  >({
    mutationKey: ['store-admin', 'login'],
    mutationFn: async (payload) => {
      setLoading(true); // 🌀 start loading in global store
      const { data } = await axios.post('/api/login', payload);
      return data;
    },
    onSuccess: (data) => {
      if (!data.data) {
        setLoading(false);
        toast.error('Login failed: No data received');
        return;
      }

      const { admin, coldStorage } = data.data;

      // ✅ Save login data globally
      setAdminData(admin, coldStorage);
      setLoading(false);

      toast.success(data.message || 'Logged in successfully!');

      // Optional: invalidate profile queries (if used elsewhere)
      queryClient.invalidateQueries({ queryKey: ['store-admin', 'profile'] });

      // ✅ Navigate to dashboard
      router.push('/store-admin/daybook');
    },
    onError: (error) => {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        'Login failed';
      toast.error(errorMessage);
    },
  });
};
