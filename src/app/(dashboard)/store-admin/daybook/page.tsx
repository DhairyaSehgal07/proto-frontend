// app/daybook/page.tsx
import DaybookPage from '@/components/daybook';

export default function Page() {
  return <DaybookPage />;
}

// ✅ Optional: Add metadata for SEO
export const metadata = {
  title: 'Daybook | Coldop',
  description: 'View your daybook entries',
};

// ✅ Optional: Force dynamic rendering if needed
// export const dynamic = 'force-dynamic';
