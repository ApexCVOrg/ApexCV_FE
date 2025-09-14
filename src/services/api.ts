import axios from 'axios';

// ==== Local Types to avoid any ==== 
type Coupon = { id?: string; code?: string; [k: string]: unknown };
type SepayTransaction = {
  _id: string;
  type: 'sepay_payment' | 'points_used' | 'points_earned' | 'refund';
  amount: number;
  points: number;
  createdAt: string;
  transactionId?: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
};
type ConfirmSepayResponse = {
  success: boolean;
  message: string;
  data: {
    transaction: SepayTransaction;
    user: { id: string; points: number };
  };
  newBalance?: number;
};
type PointsHistoryResponse = {
  success: boolean;
  data: {
    history: SepayTransaction[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
};

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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com',
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
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com';

  const apiUrl = `${baseURL}/payment/vnpay`;

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

/**
 * Lấy lịch sử refund cho 1 order cụ thể
 */
export async function getRefundHistoryByOrder(orderId: string): Promise<unknown[]> {
  const res = await api.get(`/refund/history?orderId=${orderId}`);
  const data = res.data as unknown;
  if (data && (data as { success?: boolean }).success) return (data as { refunds?: unknown[] }).refunds || [];
  return [];
}

/**
 * Lấy danh sách coupon khả dụng cho user/cart
 */
export async function getAvailableCoupons(): Promise<Coupon[]> {
  const res = await api.get('/coupon');
  const data = res.data as { success?: boolean; data?: Coupon[] };
  if (data && data.success && Array.isArray(data.data)) return data.data as Coupon[];
  return [];
}

/**
 * Tạo QR code thanh toán Sepay
 */
export async function createSepayPayment(data: { amount: number; description?: string }): Promise<{
  success: boolean;
  qrCodeUrl: string;
  sessionId: string;
  amount: number;
  message: string;
}> {
  const token = localStorage.getItem('auth_token');
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com';

  const apiUrl = `${baseURL}/api/sepay/create`;

  console.log('[Frontend] Calling Sepay API:', apiUrl);
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
    throw new Error(`Tạo QR code thanh toán thất bại: ${res.status} - ${errorText}`);
  }

  const json = await res.json();
  console.log('[Frontend] API Response:', json);
  return json;
}

/**
 * Xác nhận thanh toán Sepay
 */
export async function confirmSepayPayment(data: {
  sessionId: string;
  transactionId: string;
  amount: number;
}): Promise<ConfirmSepayResponse> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com';

  const apiUrl = `${baseURL}/api/sepay/confirm`;

  console.log('[Frontend] Calling Sepay Confirm API:', apiUrl);
  console.log('[Frontend] Request data:', JSON.stringify(data, null, 2));

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  console.log('[Frontend] Response status:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[Frontend] API Error:', errorText);
    throw new Error(`Xác nhận thanh toán thất bại: ${res.status} - ${errorText}`);
  }

  const json = (await res.json()) as ConfirmSepayResponse;
  console.log('[Frontend] API Response:', json);
  return json;
}

/**
 * Lấy thông tin điểm của user
 */
export async function getUserPoints(): Promise<{
  success: boolean;
  data: {
    userId: string;
    username: string;
    email: string;
    points: number;
  };
}> {
  const res = await api.get('/api/sepay/points');
  return res.data as {
    success: boolean;
    data: {
      userId: string;
      username: string;
      email: string;
      points: number;
    };
  };
}

/**
 * Kiểm tra trạng thái thanh toán
 */
export async function checkPaymentStatus(sessionId: string): Promise<{
  success: boolean;
  paid: boolean;
  transaction?: {
    id: string;
    amount: number;
    points: number;
    createdAt: string;
  };
  user?: {
    points: number;
  };
  message?: string;
}> {
  const res = await api.get(`/api/sepay/status/${sessionId}`);
  return res.data as {
    success: boolean;
    paid: boolean;
    transaction?: {
      id: string;
      amount: number;
      points: number;
      createdAt: string;
    };
    user?: {
      points: number;
    };
    message?: string;
  };
}

/**
 * Lấy lịch sử giao dịch điểm
 */
export async function getPointsHistory(): Promise<PointsHistoryResponse> {
  const res = await api.get('/api/sepay/points/history');
  return res.data as PointsHistoryResponse;
}

export default api;