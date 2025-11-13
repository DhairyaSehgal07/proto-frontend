// src/proxy.ts
import { NextResponse, NextRequest } from 'next/server';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export async function proxy(request: NextRequest) {
  const url = new URL(request.url);

  // 🧠 Avoid infinite loop: don't proxy Next.js API routes
  if (!url.pathname.startsWith('/api/v1/base')) {
    return NextResponse.next();
  }

  const jwtToken = request.cookies.get('jwt')?.value;

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
    ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
  };

  // Forward JWT cookie to backend
  if (jwtToken) {
    headers['Cookie'] = `jwt=${jwtToken}`;
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body || undefined,
    credentials: 'include',
  });

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

  // Forward Set-Cookie headers from backend (for JWT cookie)
  const setCookieHeaders = response.headers.getSetCookie();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    setCookieHeaders.forEach((cookie) => {
      const [nameValue] = cookie.split(';');
      const [name, ...valueParts] = nameValue.split('=');
      const value = valueParts.join('=');

      if (name === 'jwt') {
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
        } else {
          cookieOptions.maxAge = 7 * 24 * 60 * 60; // 7 days default
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
