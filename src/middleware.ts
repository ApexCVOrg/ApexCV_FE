import { NextRequest, NextResponse } from 'next/server';
import { handleAuthMiddleware } from './store/middleware/authMiddleware';
import { handleI18nMiddleware } from './store/middleware/i18nMiddleware';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Handle authentication middleware
  const authResponse = handleAuthMiddleware(request);
  if (authResponse) {
    return authResponse;
  }

  // Handle i18n middleware
  const i18nResponse = handleI18nMiddleware(request);
  if (i18nResponse) {
    return i18nResponse;
  }

  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check if user is admin
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)', '/admin/:path*'],
};
