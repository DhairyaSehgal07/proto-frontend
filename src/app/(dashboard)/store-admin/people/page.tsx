// app/daybook/page.tsx
import PeoplePage from '@/components/people';

export default function Page() {
  return <PeoplePage />;
}

// ✅ Optional: Add metadata for SEO
export const metadata = {
  title: 'People | Coldop',
  description: 'View associated farmers with your storage',
};

// ✅ Optional: Force dynamic rendering if needed
// export const dynamic = 'force-dynamic';
