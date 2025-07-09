import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createIntlMiddleware from 'next-intl/middleware';

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
});

export async function middleware(request: NextRequest) {
  // Handle next-intl middleware first
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    return intlResponse;
  }

  // Chỉ kiểm tra auth cho các route cần bảo vệ
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isManagerRoute = pathname.startsWith('/manager');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (isAdminRoute || isManagerRoute || isDashboardRoute) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check if user is admin
    if (isAdminRoute && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if user is manager or admin
    if (isManagerRoute && token.role !== 'manager' && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|.*\\..*).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};
