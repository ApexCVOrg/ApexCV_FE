// app/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Định nghĩa type cho user
interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  // Thêm các trường khác nếu cần
}

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextProps extends AuthState {
  setAuth: (auth: AuthState) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Bạn có thể fetch user profile ở đây nếu cần
    }
  }, []);

  const setAuth = ({ token, user }: AuthState) => {
    setToken(token);
    setUser(user);
    if (token) localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    // Không tự động redirect, để component tự xử lý
  };

  return (
    <AuthContext.Provider value={{ token, user, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
