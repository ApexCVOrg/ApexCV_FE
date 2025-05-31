// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update-profile',
    CHANGE_PASSWORD: '/user/change-password',
  },
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    PRODUCTS: '/manager/products',
    CATEGORIES: '/manager/categories',
    ORDERS: '/manager/orders',
    CUSTOMERS: '/manager/customers',
    SETTINGS: '/manager/settings',
    STATS: {
      SALES: '/manager/stats/sales',
      USERS: '/manager/stats/users',
      ORDERS: '/manager/stats/orders',
      CUSTOMERS: '/manager/stats/customers',
    },
  },
  // Thêm các endpoints khác ở đây
};

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  THEME: 'theme',
  MANAGER_SETTINGS: 'manager_settings',
};

// Theme Constants
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Route Paths
export const ROUTES = {
  HOME: '/vi',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  MEN: '/men',
  WOMEN: '/women',
  KIDS: '/kids',
  ACCESSORIES: '/accessories',
  COLLECTION_ULTRABOOST: '/collections/ultraboost',
  COLLECTION_ORIGINALS: '/collections/originals',
  COLLECTION_SPORTSWEAR: '/collections/sportswear',
  PROMO: '/promo',
  SALE: '/sale',
  CART: '/cart',
  // Manager Routes
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    PRODUCTS: '/manager/products',
    CATEGORIES: '/manager/categories',
    ORDERS: '/manager/orders',
    CUSTOMERS: '/manager/customers',
    SETTINGS: '/manager/settings',
  },
};

// Manager Dashboard Constants
export const MANAGER = {
  DRAWER_WIDTH: 280,
  STATS: {
    REFRESH_INTERVAL: 300000, // 5 minutes
    CHART_COLORS: {
      PRIMARY: '#1976d2',
      SUCCESS: '#2e7d32',
      WARNING: '#ed6c02',
      INFO: '#0288d1',
    },
  },
  TABLE: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },
  DATE_FORMAT: {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    DATETIME: 'DD/MM/YYYY HH:mm',
  },
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    MAX_FILES: 5,
  },
  NOTIFICATIONS: {
    MAX_DISPLAY: 5,
    AUTO_HIDE_DURATION: 6000, // 6 seconds
  },
};

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  USERNAME_TOO_SHORT: `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`,
  USERNAME_TOO_LONG: `Username must be at most ${VALIDATION.USERNAME_MAX_LENGTH} characters`,
  NETWORK_ERROR: 'Network error. Please try again later',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  // Manager specific errors
  MANAGER: {
    INVALID_PRODUCT_DATA: 'Invalid product data',
    INVALID_CATEGORY_DATA: 'Invalid category data',
    INVALID_ORDER_DATA: 'Invalid order data',
    FILE_TOO_LARGE: `File size must be less than ${MANAGER.FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`,
    INVALID_FILE_TYPE: 'Invalid file type',
    TOO_MANY_FILES: `Maximum ${MANAGER.FILE_UPLOAD.MAX_FILES} files allowed`,
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
  // Manager specific success messages
  MANAGER: {
    PRODUCT_CREATED: 'Product created successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    CATEGORY_CREATED: 'Category created successfully',
    CATEGORY_UPDATED: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',
    ORDER_UPDATED: 'Order updated successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
  },
};

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
};

// Date Format
export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
};

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user-profile',
  SETTINGS: 'settings',
  MANAGER: {
    DASHBOARD_STATS: 'manager-dashboard-stats',
    PRODUCTS: 'manager-products',
    CATEGORIES: 'manager-categories',
    ORDERS: 'manager-orders',
    CUSTOMERS: 'manager-customers',
    SETTINGS: 'manager-settings',
  },
  // Thêm các cache keys khác ở đây
};
