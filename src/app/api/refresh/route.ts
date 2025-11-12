// src/app/api/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

const REFRESH_ENDPOINT = `${BACKEND_BASE_URL}/api/v1/base/store-admin/refresh`;

interface RefreshTokenResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      console.warn('[API Refresh] No refreshToken cookie found');

      // Delete cookies if they exist
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');

      return NextResponse.json(
        { success: false, message: 'No refresh token available' },
        { status: 401 }
      );
    }

    console.warn('[API Refresh] Attempting to refresh tokens...');

    // Call Fastify backend refresh endpoint
    // Use Mobile User-Agent so backend returns tokens in response body instead of just setting cookies
    // This makes it easier to extract tokens in server-to-server calls
    const refreshResponse = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mobile Server-Side-Refresh/1.0', // Backend returns tokens in body for mobile requests
        Cookie: `refreshToken=${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      // Note: credentials are handled via Cookie header in server-to-server calls
    });

    // Log all response headers for debugging
    const allHeaders: Record<string, string> = {};
    refreshResponse.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    console.warn('[API Refresh] All response headers:', allHeaders);

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text().catch(() => 'Unknown error');
      console.error(
        `[API Refresh] Backend refresh failed with status ${refreshResponse.status}:`,
        errorText
      );

      // Delete cookies on failure
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');

      return NextResponse.json(
        { success: false, message: 'Token refresh failed' },
        { status: 401 }
      );
    }

    // Read response as text first to see raw response
    const responseText = await refreshResponse.text();
    console.warn('[API Refresh] Raw response text:', responseText);

    let refreshData: RefreshTokenResponse & Record<string, unknown>;
    try {
      refreshData = JSON.parse(responseText) as RefreshTokenResponse & Record<string, unknown>;
    } catch (parseError) {
      console.error('[API Refresh] Failed to parse JSON response:', parseError);
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      return NextResponse.json(
        { success: false, message: 'Invalid JSON response from backend' },
        { status: 500 }
      );
    }

    // Log full response for debugging
    console.warn('[API Refresh] Parsed refresh response:', JSON.stringify(refreshData, null, 2));

    // Extract tokens from response body
    // With Mobile User-Agent, backend returns tokens in data object
    // Fallback: check top level or Set-Cookie headers
    let accessToken: string | undefined;
    let newRefreshToken: string | undefined;

    if (refreshData.data?.accessToken && refreshData.data?.refreshToken) {
      // Tokens in data object (expected for mobile/API requests)
      accessToken = refreshData.data.accessToken;
      newRefreshToken = refreshData.data.refreshToken;
      console.warn('[API Refresh] Tokens found in response data');
    } else if (refreshData.accessToken && refreshData.refreshToken) {
      // Tokens at top level (fallback)
      accessToken = refreshData.accessToken;
      newRefreshToken = refreshData.refreshToken;
      console.warn('[API Refresh] Tokens found at top level');
    } else {
      // Fallback: Check Set-Cookie headers (for web requests)
      console.warn('[API Refresh] Tokens not in body, checking Set-Cookie headers...');
      let setCookieHeaders: string[] = [];

      if (typeof refreshResponse.headers.getSetCookie === 'function') {
        setCookieHeaders = refreshResponse.headers.getSetCookie();
      } else {
        const setCookieHeader = refreshResponse.headers.get('set-cookie');
        if (setCookieHeader) {
          setCookieHeaders = [setCookieHeader];
        }
      }

      if (setCookieHeaders.length > 0) {
        console.warn('[API Refresh] Found Set-Cookie headers:', setCookieHeaders);
        for (const cookieString of setCookieHeaders) {
          // Parse cookie string: "name=value; attr1=val1; attr2=val2"
          const cookies = cookieString.split(',').map((c) => c.trim());
          for (const cookie of cookies) {
            const [nameValue] = cookie.split(';');
            const equalIndex = nameValue.indexOf('=');
            if (equalIndex > 0) {
              const name = nameValue.substring(0, equalIndex).trim();
              const value = nameValue.substring(equalIndex + 1).trim();
              if (name === 'accessToken') {
                accessToken = value;
              } else if (name === 'refreshToken') {
                newRefreshToken = value;
              }
            }
          }
        }
      }
    }

    // If refreshToken wasn't rotated, use the existing one
    if (!newRefreshToken) {
      newRefreshToken = refreshToken;
      console.warn('[API Refresh] Using existing refreshToken (not rotated)');
    }

    if (!refreshData.success || !accessToken) {
      console.error('[API Refresh] Invalid refresh response - missing tokens:', {
        success: refreshData.success,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!newRefreshToken,
        response: refreshData,
      });

      // Delete cookies on invalid response
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');

      return NextResponse.json(
        { success: false, message: 'Invalid refresh response - missing access token' },
        { status: 401 }
      );
    }

    console.warn('[API Refresh] Setting new cookies...');

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Set new cookies
    cookieStore.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 15, // 15 minutes
    });

    cookieStore.set('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.warn('[API Refresh] Token refresh successful');

    // Return tokens in response body so server-fetch.ts can use them directly
    // Cookies are also set for browser requests, but server-to-server calls
    // need the tokens in the response body
    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('[API Refresh] Unexpected error:', error);

    // Delete cookies on error
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return NextResponse.json(
      { success: false, message: 'Internal server error during token refresh' },
      { status: 500 }
    );
  }
}
