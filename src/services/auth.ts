import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants/constants';
import apiService from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
}

class AuthService {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    this.setAuthData(response.data);
    return response.data;
  }

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    this.setAuthData(response.data);
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      this.clearAuthData();
    }
  }

  // Refresh Token
  async refreshToken(): Promise<AuthResponse> {
    if (typeof window === 'undefined') {
      throw new Error('Cannot refresh token during server-side rendering');
    }
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    });
    this.setAuthData(response.data);
    return response.data;
  }

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
  }

  // Get current user
  getCurrentUser(): AuthResponse['user'] | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Set auth data to localStorage
  private setAuthData(data: AuthResponse) {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
  }

  // Clear auth data from localStorage
  private clearAuthData() {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export const authService = new AuthService();
export default authService;
