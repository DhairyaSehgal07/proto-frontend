import { useMutation, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type LogoutResponse = {
  success: boolean;
  message: string;
};

export const useStoreAdminLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LogoutResponse, Error, void>({
    mutationKey: ['store-admin', 'logout'],
    mutationFn: async () => {
      const { data } = await baseApi.post<LogoutResponse>('/store-admin/logout');
      return data;
    },
    onSuccess: (data) => {
      // Clear cookies (server should clear them, but clear client-side as well)
      if (typeof document !== 'undefined') {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      // Clear cached queries related to store-admin
      queryClient.removeQueries({ queryKey: ['store-admin'], exact: false });

      // Notify user
      toast.success(data.message || 'Logged out successfully');

      // Redirect to login page
      router.push('/login');
    },
    onError: (error) => {
      // Even if logout fails, clear cookies and redirect
      if (typeof document !== 'undefined') {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      queryClient.removeQueries({ queryKey: ['store-admin'], exact: false });
      toast.error(error.message || 'Logout failed');
      router.push('/login');
    },
  });
};
