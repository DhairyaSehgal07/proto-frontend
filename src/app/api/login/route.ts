// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1️⃣ Forward login request to Fastify backend
    const { data } = await axios.post(`${BACKEND_URL}/api/v1/base/store-admin/login`, body, {
      withCredentials: true, // include cookies if backend ever uses them
    });

    // Validate response structure
    if (!data.success || !data.data?.token) {
      return NextResponse.json(
        { message: data.message || 'Login failed: no token received' },
        { status: 401 }
      );
    }

    const token = data.data.token;

    // 2️⃣ Set JWT cookie on frontend domain
    const res = NextResponse.json({
      success: data.success,
      message: data.message,
      data: {
        admin: data.data.admin,
        coldStorage: data.data.coldStorage,
        token: data.data.token,
      },
    });

    res.cookies.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // safe for frontend domain
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage =
      axiosError?.response?.data?.message ||
      (error instanceof Error ? error.message : 'Login failed');
    const statusCode = axiosError?.response?.status || 500;

    console.error('[Login API Route Error]', axiosError?.response?.data || errorMessage);

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
