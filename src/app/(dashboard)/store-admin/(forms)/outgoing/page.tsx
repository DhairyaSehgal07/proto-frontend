import OutgoingOrderPage from '@/components/forms/outgoing-order';

export default function Page() {
  return <OutgoingOrderPage />;
}

// ✅ Optional: Add metadata for SEO
export const metadata = {
  title: 'Outgoing Order | Coldop',
  description: 'Create an outgoing order',
};

// ✅ Optional: Force dynamic rendering if needed
// export const dynamic = 'force-dynamic';
