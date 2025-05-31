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

  // Thay err: any bằng unknown, check kiểu trước khi truy cập property
  const handleError = (err: unknown): AuthError => {
    if (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as any).response === 'object' &&
      (err as any).response !== null &&
      'data' in (err as any).response &&
      typeof (err as any).response.data === 'object' &&
      (err as any).response.data !== null &&
      'message' in (err as any).response.data &&
      typeof (err as any).response.data.message === 'string'
    ) {
      return {
        message: (err as any).response.data.message,
        status: (err as any).response.status,
      };
    }
    if (err instanceof Error) {
      return { message: err.message };
    }
    return { message: 'An error occurred' };
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

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.register({ email, password, fullName });
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

  const forgotPassword = useCallback(
    async (email: string) => {
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
    },
    []
  );

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

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    loading,
    error,
    isAuthenticated: authService.isAuthenticated(),
  };
};

export default useAuth;
