import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
}

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    this.setTokens(response.data.token, response.data.refreshToken);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    this.setTokens(response.data.token, response.data.refreshToken);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      this.clearTokens();
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  }

  getCurrentUser(): AuthResponse['user'] | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  }

  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
}

export const authService = new AuthService();
export default authService; 