import { NextRequest, NextResponse } from 'next/server';
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
  const isAuthRoute = pathname.includes('/auth/');

  // Skip auth check for auth routes to prevent redirect loops
  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (isAdminRoute || isManagerRoute || isDashboardRoute) {
    // Check for auth token in cookies
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      // Redirect to login page with current locale
      const locale = pathname.split('/')[1];
      const loginUrl = locale === 'en' || locale === 'vi' 
        ? `/${locale}/auth/login` 
        : '/vi/auth/login';
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    // For now, let the client-side handle role-based redirects
    // since we need to decode JWT token to check roles
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
