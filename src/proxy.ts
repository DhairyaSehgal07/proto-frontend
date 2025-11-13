// src/proxy.ts
import { NextResponse, NextRequest } from 'next/server';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export async function proxy(request: NextRequest) {
  const url = new URL(request.url);

  // 🧠 Avoid infinite loop: don't proxy refresh route or Next.js API routes
  if (
    url.pathname.includes('/api/v1/base/store-admin/refresh') ||
    url.pathname.startsWith('/api/refresh') ||
    !url.pathname.startsWith('/api/v1/base')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Get request body if it exists
  let body: string | undefined;
  if (request.body) {
    try {
      const clonedRequest = request.clone();
      body = await clonedRequest.text();
    } catch {
      // If body is already consumed, try to get it from the request
      body = undefined;
    }
  }

  const targetUrl = `${BASE_URL}${url.pathname}${url.search}`;

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  // Forward cookies to backend
  const cookieHeader = [
    accessToken && `accessToken=${accessToken}`,
    refreshToken && `refreshToken=${refreshToken}`,
  ]
    .filter(Boolean)
    .join('; ');

  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body || undefined,
    credentials: 'include',
  });

  // 🧩 Handle token expiration — if backend returns 401, try refresh
  if (response.status === 401 && refreshToken && !url.pathname.includes('/refresh')) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/api/v1/base/store-admin/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refreshToken=${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();

        // Retry the original request with new access token
        const retryHeaders: HeadersInit = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.data?.accessToken || data.accessToken}`,
        };

        const retryCookieHeader = [
          `accessToken=${data.data?.accessToken || data.accessToken}`,
          data.data?.refreshToken || data.refreshToken
            ? `refreshToken=${data.data?.refreshToken || data.refreshToken}`
            : refreshToken,
        ]
          .filter(Boolean)
          .join('; ');

        if (retryCookieHeader) {
          retryHeaders['Cookie'] = retryCookieHeader;
        }

        const retryResponse = await fetch(targetUrl, {
          method: request.method,
          headers: retryHeaders,
          body: body || undefined,
          credentials: 'include',
        });

        // Convert retry response to NextResponse
        const nextResponse = new NextResponse(await retryResponse.text(), {
          status: retryResponse.status,
          statusText: retryResponse.statusText,
        });

        // Forward response headers
        retryResponse.headers.forEach((value, key) => {
          nextResponse.headers.set(key, value);
        });

        // Set cookies from refresh response
        if (data.data?.accessToken || data.accessToken) {
          nextResponse.cookies.set('accessToken', data.data?.accessToken || data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
          });
        }

        if (data.data?.refreshToken || data.refreshToken) {
          nextResponse.cookies.set('refreshToken', data.data?.refreshToken || data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
          });
        }

        return nextResponse;
      }
    } catch (refreshError) {
      console.error('[Proxy] Token refresh failed:', refreshError);
      // Fall through to return original 401 response
    }
  }

  // Convert fetch response to NextResponse
  const responseText = await response.text();
  const nextResponse = new NextResponse(responseText, {
    status: response.status,
    statusText: response.statusText,
  });

  // Forward response headers
  response.headers.forEach((value, key) => {
    // Skip headers that Next.js manages
    if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
      nextResponse.headers.set(key, value);
    }
  });

  // Forward Set-Cookie headers from backend
  const setCookieHeaders = response.headers.getSetCookie();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    setCookieHeaders.forEach((cookie) => {
      const [nameValue] = cookie.split(';');
      const [name, ...valueParts] = nameValue.split('=');
      const value = valueParts.join('=');

      if (name === 'accessToken' || name === 'refreshToken') {
        const cookieOptions: {
          httpOnly: boolean;
          secure: boolean;
          sameSite: 'strict';
          path: string;
          maxAge?: number;
        } = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        };

        // Extract maxAge from cookie string if present
        const maxAgeMatch = cookie.match(/Max-Age=(\d+)/);
        if (maxAgeMatch) {
          cookieOptions.maxAge = parseInt(maxAgeMatch[1], 10);
        } else if (name === 'accessToken') {
          cookieOptions.maxAge = 15 * 60; // 15 minutes
        } else if (name === 'refreshToken') {
          cookieOptions.maxAge = 7 * 24 * 60 * 60; // 7 days
        }

        nextResponse.cookies.set(name, value, cookieOptions);
      }
    });
  }

  return nextResponse;
}

// Only proxy API routes to the backend
export const config = {
  matcher: '/api/v1/base/:path*',
};
