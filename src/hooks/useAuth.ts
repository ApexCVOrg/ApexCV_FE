'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth';

interface AuthError {
  message: string;
  status?: number;
}

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleError = (err: any): AuthError => {
    if (err.response?.data?.message) {
      return {
        message: err.response.data.message,
        status: err.response.status,
      };
    }
    return {
      message: err instanceof Error ? err.message : 'An error occurred',
    };
  };

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.login({ email, password });
        router.push('/dashboard');
        return response;
      } catch (err) {
        const error = handleError(err);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const register = async (
    email: string,
    password: string,
    fullName: string,
    username: string,
    phone: string,
    addresses: any[]
  ) => {
    try {
      console.log('Registering with data:', { email, fullName, username, phone, addresses });
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/auth/register`);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, username, phone, address: addresses }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        return data;
      }

      return data;
    } catch (error: any) {
      console.error('Register error details:', {
        message: error.message,
        stack: error.stack,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
      });
      return {
        success: false,
        message: 'server_error',
        errors: {},
      };
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      router.push('/login');
    } catch (err) {
      const error = handleError(err);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.forgotPassword(email);
    } catch (err) {
      const error = handleError(err);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        setLoading(true);
        setError(null);
        await authService.resetPassword(token, newPassword);
        router.push('/login');
      } catch (err) {
        const error = handleError(err);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const getCurrentUser = useCallback(() => {
    return authService.getCurrentUser();
  }, []);

  const setAuthData = useCallback((data: { token: string; refreshToken: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
  }, []);

  const handleGoogleAuth = useCallback(
    async (code: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Google authentication failed');
        }

        const data = await response.json();
        setAuthData(data);
        router.push('/dashboard');
      } catch (err) {
        const error = handleError(err);
        setError(error);
        router.push('/auth/error?message=' + encodeURIComponent(error.message));
      } finally {
        setLoading(false);
      }
    },
    [router, setAuthData]
  );

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    handleGoogleAuth,
    setAuthData,
    loading,
    error,
    isAuthenticated: authService.isAuthenticated(),
  };
};

export default useAuth;
