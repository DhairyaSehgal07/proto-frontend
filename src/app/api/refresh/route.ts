// src/app/api/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

const REFRESH_ENDPOINT = `${BACKEND_BASE_URL}/api/v1/base/store-admin/refresh`;

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export async function POST(request: NextRequest) {
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
    const refreshResponse = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

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

    const refreshData: RefreshTokenResponse = await refreshResponse.json();

    console.warn('[API Refresh] Refresh response:', {
      success: refreshData.success,
      hasData: !!refreshData.data,
      dataKeys: refreshData.data ? Object.keys(refreshData.data) : [],
    });

    if (!refreshData.success || !refreshData.data?.accessToken || !refreshData.data?.refreshToken) {
      console.error('[API Refresh] Invalid refresh response:', refreshData);

      // Delete cookies on invalid response
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');

      return NextResponse.json(
        { success: false, message: 'Invalid refresh response' },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken: newRefreshToken } = refreshData.data;

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

    return NextResponse.json({ success: true });
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
