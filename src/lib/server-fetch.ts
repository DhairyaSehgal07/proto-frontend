// src/lib/server-fetch.ts
import { cookies, headers as getHeaders } from 'next/headers';
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

  return fetchWithRefresh(fullUrl, cookieStore, false, requireAuth, fetchOptions);
}

async function fetchWithRefresh(
  url: string,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  retry = false,
  requireAuth = true,
  fetchOptions: RequestInit = {}
): Promise<Response> {
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // Only redirect if BOTH tokens are missing (if requireAuth is true)
  // If accessToken is missing but refreshToken exists, allow the request to proceed
  // so we can attempt refresh on 401
  if (requireAuth && !accessToken && !refreshToken) {
    console.warn('[Server Fetch] No tokens found, redirecting to login');
    redirect('/login');
  }

  const cookieHeader = [
    accessToken && `accessToken=${accessToken}`,
    refreshToken && `refreshToken=${refreshToken}`,
  ]
    .filter(Boolean)
    .join('; ');

  const headers = new Headers(fetchOptions.headers);
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    cache: 'no-store',
  });

  // Handle 401 - attempt token refresh
  if (response.status === 401 && !retry && refreshToken && requireAuth) {
    console.warn('[Server Fetch] Received 401, attempting token refresh via /api/refresh...');

    try {
      // Call local Next.js API route for token refresh
      // This route handles cookie management and backend communication
      const headersList = await getHeaders();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const apiRefreshUrl = `${protocol}://${host}/api/refresh`;

      console.warn('[Server Fetch] Calling refresh API:', apiRefreshUrl);

      const refreshResponse = await fetch(apiRefreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refreshToken=${refreshToken}`,
        },
        cache: 'no-store',
      });

      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text().catch(() => 'Unknown error');
        console.error(
          `[Server Fetch] Token refresh failed with status ${refreshResponse.status}:`,
          errorText
        );
        redirect('/login');
      }

      const refreshData = await refreshResponse.json();

      if (!refreshData.success) {
        console.error('[Server Fetch] Refresh failed:', refreshData);
        redirect('/login');
      }

      console.warn('[Server Fetch] Token refresh successful, retrying original request...');

      // Get tokens from refresh response body (API route returns them)
      // Cookies are also set by the API route, but we need the tokens here immediately
      const newAccessToken =
        refreshData.data?.accessToken || (refreshData as { accessToken?: string }).accessToken;
      const newRefreshToken =
        refreshData.data?.refreshToken || (refreshData as { refreshToken?: string }).refreshToken;

      if (!newAccessToken) {
        console.error('[Server Fetch] No accessToken in refresh response:', refreshData);
        redirect('/login');
      }

      // Build cookie header with the new tokens
      const newCookieHeader = [
        `accessToken=${newAccessToken}`,
        newRefreshToken && `refreshToken=${newRefreshToken}`,
      ]
        .filter(Boolean)
        .join('; ');

      const retryHeaders = new Headers(fetchOptions.headers);
      retryHeaders.set('Cookie', newCookieHeader);
      if (!retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }

      // Retry the original request with new tokens
      const retryResponse = await fetch(url, {
        ...fetchOptions,
        headers: retryHeaders,
        cache: 'no-store',
      });

      // If retry still fails with 401, redirect to login
      if (retryResponse.status === 401 && requireAuth) {
        console.warn('[Server Fetch] Still unauthorized after refresh, redirecting to login');
        redirect('/login');
      }

      return retryResponse;
    } catch (refreshError) {
      console.error('[Server Fetch] Token refresh error:', refreshError);
      redirect('/login');
    }
  }

  // If we still get 401 after retry (or no refresh token available), redirect to login
  if (response.status === 401 && requireAuth) {
    console.warn('[Server Fetch] Unauthorized and cannot refresh, redirecting to login');
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
