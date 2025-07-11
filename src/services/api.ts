import axios from 'axios';

interface RefreshTokenResponse {
  token: string;
}

interface ApiError {
  response?: {
    status: number;
  };
  config?: {
    headers?: Record<string, string>;
    _retry?: boolean;
    url?: string;
    method?: string;
  };
}

interface AxiosRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: unknown;
  _retry?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async (error: ApiError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await api.post<RefreshTokenResponse>('/auth/refresh-token', {
          refreshToken,
        });
        const { token } = response.data;

        localStorage.setItem('auth_token', token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        return api(originalRequest as AxiosRequest);
      } catch (refreshError) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
