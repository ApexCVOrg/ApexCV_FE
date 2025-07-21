// app/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Định nghĩa type cho user
interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextProps {
  token: string | null;
  user: User | null;
  setAuth: (auth: AuthState) => void;
  logout: () => void;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const router = useRouter();

  // Auto logout after 15 minutes of inactivity - only for authenticated users
  useEffect(() => {
    if (!token) return; // Don't run auto logout if not authenticated

    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity > INACTIVITY_LIMIT && token) {
        console.log('Auto logout due to inactivity');
        logout();
        // Only redirect if not already on login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/auth/login')) {
          const currentLocale = window.location.pathname.split('/')[1];
          const loginUrl =
            currentLocale === 'en' || currentLocale === 'vi'
              ? `/${currentLocale}/auth/login`
              : '/vi/auth/login';
          router.push(loginUrl);
        }
      }
    };

    const interval = setInterval(checkInactivity, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity, token, router]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Track mouse movements, clicks, and keyboard events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      setLastActivity(Date.now());
      // Bạn có thể fetch user profile ở đây nếu cần
      // Fetch user profile từ backend
      fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/users/profile', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then(res => res.json())
        .then(user => setUser(user))
        .catch(() => setUser(null));
    }

    // Listen for storage changes (when token is saved from success page)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('auth_token');
      if (newToken && newToken !== token) {
        setToken(newToken);
        setLastActivity(Date.now());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom auth token update event
    const handleAuthTokenUpdate = (event: CustomEvent) => {
      const newToken = event.detail.token;
      if (newToken && newToken !== token) {
        setToken(newToken);
        setLastActivity(Date.now());
      }
    };

    window.addEventListener('authTokenUpdated', handleAuthTokenUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokenUpdated', handleAuthTokenUpdate as EventListener);
    };
  }, [token]);

  const setAuth = ({ token, user }: AuthState) => {
    setToken(token);
    setUser(user);
    setLastActivity(Date.now());
    if (token) localStorage.setItem('auth_token', token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setLastActivity(0);
  };

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  return (
    <AuthContext.Provider value={{ token, user, setAuth, logout, updateActivity }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
