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
        if (!refreshToken) {
          // No refresh token, logout user
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          // Only redirect if not already on login page
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/auth/login')) {
            const currentLocale = window.location.pathname.split('/')[1];
            const loginUrl =
              currentLocale === 'en' || currentLocale === 'vi'
                ? `/${currentLocale}/auth/login`
                : '/vi/auth/login';
            window.location.href = loginUrl;
          }
          return Promise.reject(error);
        }

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
        // Refresh token failed, logout user
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        // Only redirect if not already on login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/auth/login')) {
          const currentLocale = window.location.pathname.split('/')[1];
          const loginUrl =
            currentLocale === 'en' || currentLocale === 'vi'
              ? `/${currentLocale}/auth/login`
              : '/vi/auth/login';
          window.location.href = loginUrl;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Gọi API backend để tạo link thanh toán VNPAY
 */
export async function createVnpayPayment(data: Record<string, unknown>): Promise<string> {
  const token = localStorage.getItem('auth_token');
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Loại bỏ /api từ baseURL nếu có để tránh duplicate
  const cleanBaseURL = baseURL.replace(/\/api$/, '');
  const apiUrl = `${cleanBaseURL}/api/payment/vnpay`;

  console.log('[Frontend] Calling VNPAY API:', apiUrl);
  console.log('[Frontend] Request data:', JSON.stringify(data, null, 2));

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  console.log('[Frontend] Response status:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[Frontend] API Error:', errorText);
    throw new Error(`Tạo link thanh toán thất bại: ${res.status} - ${errorText}`);
  }

  const json = await res.json();
  console.log('[Frontend] API Response:', json);
  return json.paymentUrl;
}

export default api;
