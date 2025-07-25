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

interface Address {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  country: string;
  addressNumber: string;
  isDefault: boolean;
}

interface RegisterError {
  message: string;
  stack?: string;
}

const isAxiosErrorResponse = (error: unknown): error is AxiosErrorLike => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const maybeError = error as AxiosErrorLike;
    return typeof maybeError.response === 'object' && maybeError.response !== null;
  }
  return false;
};

// Add return type for useAuth hook
interface UseAuthReturn {
  login: (email: string, password: string) => Promise<unknown>;
  register: (
    email: string,
    password: string,
    fullName: string,
    username: string,
    phone: string,
    addresses: Address[]
  ) => Promise<unknown>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  handleGoogleAuth: (code: string) => Promise<void>;
  getCurrentUser: () => unknown;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
  updateActivity: () => void;
  loading: boolean;
  error: AuthError | null;
}

export const useAuth = (): UseAuthReturn => {
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
    return {
      message: err instanceof Error ? err.message : 'An error occurred',
    };
  };

  const getCurrentUser = useCallback(() => {
    if (!authService.isAuthenticated()) {
      return null;
    }
    return authService.getCurrentUser();
  }, []);

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('auth_token');
  }, []);

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
    addresses: Address[]
  ) => {
    try {
      // Validate required fields
      console.log('=== Registration Data Validation ===');
      console.log('Email:', email, email ? '✓' : '✗ Required');
      console.log('Password:', password ? '✓ (length: ' + password.length + ')' : '✗ Required');
      console.log('Username:', username, username ? '✓' : '✗ Required');
      console.log('Full Name:', fullName, fullName ? '✓' : '✗ Required');
      console.log('Phone:', phone, phone ? '✓' : '✗ Required');
      console.log('Addresses:', addresses.length > 0 ? '✓' : '✗ Required');

      if (addresses.length > 0) {
        console.log('Address Details:');
        addresses.forEach((addr, index) => {
          console.log(`Address ${index + 1}:`, {
            street: addr.street || '✗ Required',
            city: addr.city || '✗ Required',
            state: addr.state || '✗ Required',
            country: addr.country || '✗ Required',
            addressNumber: addr.addressNumber || '✗ Required',
          });
        });
      }

      const requestData = {
        email,
        password,
        username,
        fullName,
        phone,
        address: addresses,
        role: 'user',
      };

      console.log('=== Request Data ===');
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/auth/register`);
      console.log('Request Body:', JSON.stringify(requestData, null, 2));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      console.log('=== Response Details ===');
      console.log('Status:', res.status);
      console.log('Status Text:', res.statusText);

      const data = await res.json();
      console.log('Response Data:', JSON.stringify(data, null, 2));

      if (!res.ok) {
        console.log('=== Error Details ===');
        console.log('Error Message:', data.message);
        if (data.errors) {
          console.log('Validation Errors:', data.errors);
        }
        return data;
      }

      return data;
    } catch (error: unknown) {
      const registerError = error as RegisterError;
      console.error('=== Registration Error ===');
      console.error('Error Message:', registerError.message);
      console.error('Stack Trace:', registerError.stack);
      console.error('API URL:', process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api');
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
      router.push('/auth/login');
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

  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  const updateActivity = useCallback(() => {
    // This function will be called by AutoLogoutNotification
    // to update the last activity time
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_activity', Date.now().toString());
    }
  }, []);

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    handleGoogleAuth,
    getCurrentUser,
    getToken,
    isAuthenticated,
    updateActivity,
    loading,
    error,
  };
};

export default useAuth;
