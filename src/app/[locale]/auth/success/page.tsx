'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, CircularProgress } from '@mui/material';

const AuthSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const role = searchParams.get('role') || 'user';

        if (!token) {
          setError('Missing authentication token');
          setLoading(false);
          return;
        }

        // Lưu token vào localStorage
        localStorage.setItem('auth_token', token);
        
        // Trigger authentication state refresh
        window.dispatchEvent(new Event('storage'));
        
        // Also trigger a custom event for immediate update
        window.dispatchEvent(new CustomEvent('authTokenUpdated', { detail: { token } }));

        // Có thể fetch user info từ BE để đồng bộ trạng thái
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            // Lưu thông tin user nếu cần
            localStorage.setItem('user_data', JSON.stringify(userData.data));
          }
        } catch (err) {
          console.warn('Could not fetch user data:', err);
          // Không block login nếu không fetch được user data
        }

        // Redirect theo role
        const pathParts = window.location.pathname.split('/');
        const currentLocale = pathParts[1] || 'en';

        let redirectPath = `/${currentLocale}`; // Default to homepage

        if (role === 'admin') {
          redirectPath = `/${currentLocale}/admin/dashboard`;
        } else if (role === 'manager') {
          redirectPath = `/${currentLocale}/manager/dashboard`;
        }

        console.log('Redirecting to:', redirectPath);
        console.log('Token saved:', !!token);
        console.log('User role:', role);
        console.log('Current locale:', currentLocale);
        console.log('Full redirect path:', redirectPath);

        // Redirect sau 1 giây để user thấy loading
        setTimeout(() => {
          try {
            router.push(redirectPath);
          } catch (err) {
            console.error('Router push failed, using window.location:', err);
            window.location.href = redirectPath;
          }
        }, 1000);

      } catch (err) {
        console.error('Auth success error:', err);
        setError('Authentication failed');
        setLoading(false);
      }
    };

    handleAuthSuccess();
  }, [searchParams, router]);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: 2
      }}>
        <Typography variant="h6" color="error">
          Authentication Error
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: 2
    }}>
      <CircularProgress size={60} />
      <Typography variant="h6">
        Đang đăng nhập...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Vui lòng chờ trong giây lát
      </Typography>
    </Box>
  );
};

export default AuthSuccessPage; 