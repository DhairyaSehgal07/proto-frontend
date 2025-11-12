import { serverFetchJson } from '@/lib/server-fetch';
import { DaybookApiResponse, DaybookOrder } from '@/types/daybook';
import ReceiptVoucherCard from '@/components/receipt-voucher-card';
import DeliveryVoucherCard from '@/components/delivery-voucher-card';

async function page() {
  let orders: DaybookOrder[] | null = null;

  try {
    // Use the reusable serverFetchJson utility
    // It automatically handles cookies, refresh tokens, and redirects
    const response = await serverFetchJson<DaybookApiResponse>('/store-admin/daybook');
    if (!response.success) {
      throw new Error(response.message);
    }
    orders = response.data;
  } catch (err) {
    // Re-throw redirect errors so Next.js can handle them properly
    if (
      err instanceof Error &&
      'digest' in err &&
      typeof err.digest === 'string' &&
      err.digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err;
    }
    console.error('[Server] Fetch error:', err);
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No orders found.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl">
        send createdBy in incoming and incoming order voucher number in outgoing
      </h1>
      <pre>{JSON.stringify(orders, null, 2)}</pre>
      {orders.map((voucher: DaybookOrder) => (
        <div key={voucher.id} className="mb-4">
          {voucher.gatePassType === 'RECEIPT' ? (
            <ReceiptVoucherCard data={voucher} />
          ) : voucher.gatePassType === 'DELIVERY' ? (
            <DeliveryVoucherCard data={voucher} />
          ) : (
            <p>Unknown voucher type: {voucher.gatePassType}</p>
          )}
        </div>
      ))}
    </>
  );
}

export default page;
