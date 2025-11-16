import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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
      const { data } = await axios.post<LogoutResponse>('/api/logout');
      return data;
    },
    onSuccess: (data) => {
      // Clear cached queries related to store-admin
      queryClient.removeQueries({ queryKey: ['store-admin'], exact: false });

      // Notify user
      toast.success(data.message || 'Logged out successfully');

      // Redirect to login page and refresh to ensure clean state
      router.push('/login');
      router.refresh();
    },
    onError: () => {
      // Even if logout fails, clear queries and redirect
      queryClient.removeQueries({ queryKey: ['store-admin'], exact: false });
      toast.error('Logout failed');
      router.push('/login');
      router.refresh();
    },
  });
};
