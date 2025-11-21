import IncomingOrderPage from '@/components/forms/incoming-order';

export default function Page() {
  return <IncomingOrderPage />;
}

// ✅ Optional: Add metadata for SEO
export const metadata = {
  title: 'Incoming Order | Coldop',
  description: 'Create an incoming order',
};

// ✅ Optional: Force dynamic rendering if needed
// export const dynamic = 'force-dynamic';
