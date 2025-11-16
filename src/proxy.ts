import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const jwt = req.cookies.get('jwt')?.value;
  const path = req.nextUrl.pathname;

  const isProtectedRoute = path.startsWith('/store-admin');
  const isAuthPage = path === '/login' || path === '/register';

  // 1️⃣ Not logged in → trying to access protected pages
  if (isProtectedRoute && !jwt) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2️⃣ Logged in → trying to visit login or register
  if (isAuthPage && jwt) {
    return NextResponse.redirect(new URL('/store-admin/daybook', req.url));
  }

  // 3️⃣ Otherwise allow request
  return NextResponse.next();
}

// Apply proxy ONLY to relevant routes
export const config = {
  matcher: ['/login', '/register', '/store-admin/:path*'],
};
