'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const AuthSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Lưu token vào localStorage (hoặc context, Redux, cookie...)
      localStorage.setItem('authToken', token);

      // Có thể fetch user info từ BE nếu muốn đồng bộ trạng thái

      // Redirect tới trang chính hoặc dashboard
      router.replace('/dashboard');
    } else {
      // Nếu không có token → chuyển hướng về trang lỗi
      router.replace('/auth/error?message=Missing+token');
    }
  }, [searchParams, router]);

  return <p>Đang đăng nhập...</p>;
};

export default AuthSuccessPage;
