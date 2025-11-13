// src/lib/server-fetch.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function serverFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { requireAuth = true, ...fetchOptions } = options;
  const cookieStore = await cookies();

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}/api/v1/base${url}`;

  const jwtToken = cookieStore.get('jwt')?.value;

  // Redirect if JWT token is missing and auth is required
  if (requireAuth && !jwtToken) {
    console.warn('[Server Fetch] No JWT token found, redirecting to login');
    redirect('/login');
  }

  const cookieHeader = jwtToken ? `jwt=${jwtToken}` : '';

  const headers = new Headers(fetchOptions.headers);
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers,
    cache: 'no-store',
  });

  // Handle 401 - Redirect to login
  if (response.status === 401 && requireAuth) {
    console.warn('[Server Fetch] Unauthorized, redirecting to login');
    redirect('/login');
  }

  return response;
}

export async function serverFetchJson<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await serverFetch(url, options);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error(`[Server Fetch] Request failed (${response.status}):`, errorText);
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
