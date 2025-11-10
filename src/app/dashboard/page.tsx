'use client';
import { Button } from '@/components/ui/button';
import { useStoreAdminLogout } from '@/services/base/store-admin/useStoreAdminLogout';

const DashboardPage = () => {
  const logoutMutation = useStoreAdminLogout();

  return (
    <div>
      <Button onClick={() => logoutMutation.mutate()}>Logout</Button>
    </div>
  );
};

export default DashboardPage;
