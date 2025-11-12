// app/daybook/page.tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import getQueryClient from '@/lib/get-query-client';
import { daybookKeys } from '@/services/base/store-admin/auth/daybook-keys';
import { baseApi } from '@/lib/axios';
import DaybookPage from '@/components/daybook/daybook';

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: daybookKeys.list({ type: 'all', sortBy: 'latest', page: 1, limit: 10 }),
    queryFn: async () => {
      const { data } = await baseApi.get('/store-admin/daybook', {
        params: { type: 'all', sortBy: 'latest', page: 1, limit: 10 },
      });
      return data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DaybookPage />
    </HydrationBoundary>
  );
}
