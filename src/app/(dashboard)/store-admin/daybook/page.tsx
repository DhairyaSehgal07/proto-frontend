// app/daybook/page.tsx
import DaybookPage from '@/components/daybook/daybook';

/**
 * ✅ OPTIMIZED: No server prefetch for post-authentication redirects
 *
 * Why this is faster:
 * 1. User clicks sign-in → redirect happens immediately
 * 2. Page renders instantly (no waiting for API on server)
 * 3. Client-side React Query fetches data in parallel
 * 4. Loading skeleton shows while data loads
 *
 * This pattern is ideal for:
 * - Post-authentication redirects
 * - Pages where user is already waiting (they just clicked a button)
 * - Pages where showing a skeleton is acceptable UX
 */
export default function Page() {
  // No HydrationBoundary needed - let client handle everything
  return <DaybookPage />;
}

// ✅ Optional: Add metadata for SEO
export const metadata = {
  title: 'Daybook | Your App',
  description: 'View your daybook entries',
};

// ✅ Optional: Force dynamic rendering if needed
// export const dynamic = 'force-dynamic';
