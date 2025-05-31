'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth';

interface AuthError {
  message: string;
  status?: number;
}

interface AxiosResponseLike {
  data?: {
    message?: string;
  };
  status?: number;
}

interface AxiosErrorLike {
  response?: AxiosResponseLike;
}

const isAxiosErrorResponse = (error: unknown): error is AxiosErrorLike => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const maybeError = error as AxiosErrorLike;
    return (
      typeof maybeError.response === 'object' &&
      maybeError.response !== null
    );
  }
  return false;
};

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleError = (err: unknown): AuthError => {
    if (isAxiosErrorResponse(err) && err.response?.data?.message) {
      return {
        message: err.response.data.message,
        status: err.response.status,
      };
    }

    if (err instanceof Error) {
      return { message: err.message };
    }

    return { message: 'An unknown error occurred' };
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
