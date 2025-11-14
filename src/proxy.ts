// proxy.ts (place in root of your Next.js project, same level as app/)
import { NextResponse, NextRequest } from 'next/server';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const jwtToken = request.cookies.get('jwt')?.value;

  // 🔒 AUTH REDIRECT LOGIC
  // If user has JWT and tries to access /login, redirect to dashboard
  if (jwtToken && url.pathname === '/login') {
    return NextResponse.redirect(new URL('/store-admin/daybook', request.url));
  }

  // If user has NO JWT and tries to access protected routes, redirect to login
  if (!jwtToken && url.pathname.startsWith('/store-admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🔄 PROXY LOGIC for API routes
  // Only proxy paths starting with /api/v1/base
  if (!url.pathname.startsWith('/api/v1/base')) {
    return NextResponse.next();
  }

  // Get request body if it exists
  let body: BodyInit | null = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      // Use arrayBuffer instead of text to handle binary data
      const buffer = await request.arrayBuffer();
      body = buffer.byteLength > 0 ? buffer : null;
    } catch (error) {
      console.error('Error reading request body:', error);
      body = null;
    }
  }

  const targetUrl = `${BASE_URL}${url.pathname}${url.search}`;

  // Build headers - forward most headers from original request
  const headers = new Headers();

  // Copy relevant headers from original request
  request.headers.forEach((value, key) => {
    // Skip host and connection headers
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Add/override authentication headers
  if (jwtToken) {
    headers.set('Authorization', `Bearer ${jwtToken}`);
    headers.set('Cookie', `jwt=${jwtToken}`);
  }

  // Ensure Content-Type is set for JSON requests
  if (!headers.has('Content-Type') && body) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    // Make the proxy request
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body,
      credentials: 'include',
      // Important: don't follow redirects automatically
      redirect: 'manual',
    });

    // Get response body
    const responseBody = await response.arrayBuffer();

    // Create NextResponse with the body
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward response headers (except problematic ones)
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        !['content-encoding', 'content-length', 'transfer-encoding', 'set-cookie'].includes(
          lowerKey
        )
      ) {
        nextResponse.headers.set(key, value);
      }
    });

    // Handle Set-Cookie headers specially
    const setCookieHeaders = response.headers.getSetCookie?.() || [];

    setCookieHeaders.forEach((cookieString) => {
      // Parse the cookie
      const parts = cookieString.split(';').map((p) => p.trim());
      const [nameValue] = parts;
      const [name, ...valueParts] = nameValue.split('=');
      const value = valueParts.join('=');

      // Only handle JWT cookie
      if (name.trim() === 'jwt') {
        const cookieOptions: {
          httpOnly: boolean;
          secure: boolean;
          sameSite: 'strict' | 'lax' | 'none';
          path: string;
          maxAge?: number;
          domain?: string;
        } = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        };

        // Parse cookie attributes
        parts.slice(1).forEach((part) => {
          const [attr, attrValue] = part.split('=').map((s) => s.trim());
          const attrLower = attr.toLowerCase();

          if (attrLower === 'max-age' && attrValue) {
            cookieOptions.maxAge = parseInt(attrValue, 10);
          } else if (attrLower === 'domain' && attrValue) {
            cookieOptions.domain = attrValue;
          } else if (attrLower === 'samesite' && attrValue) {
            cookieOptions.sameSite = attrValue.toLowerCase() as 'strict' | 'lax' | 'none';
          }
        });

        // Set default maxAge if not present
        if (!cookieOptions.maxAge) {
          cookieOptions.maxAge = 7 * 24 * 60 * 60; // 7 days
        }

        nextResponse.cookies.set(name.trim(), value, cookieOptions);
      }
    });

    return nextResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}

// Configure which routes the proxy should run on
export const config = {
  matcher: [
    // Auth routes - protect these routes with JWT checks
    '/login',
    '/store-admin/:path*',
    // API proxy routes - forward these to backend
    '/api/v1/base/:path*',
  ],
};
