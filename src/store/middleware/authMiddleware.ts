// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';

export function handleAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Kiểm tra xác thực cho các route bắt đầu bằng /dashboard
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Nếu không cần xử lý gì thêm, return null
  return null;
}
