// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update-profile',
    CHANGE_PASSWORD: '/user/change-password',
  },
  CV: {
    LIST: '/cv/list',
    CREATE: '/cv/create',
    UPDATE: '/cv/update',
    DELETE: '/cv/delete',
    GET_BY_ID: '/cv/get',
  },
  // Thêm các endpoints khác ở đây
};


// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  THEME: 'theme',
};

// Theme Constants
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Route Paths
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  REGISTER: 'auth/register',
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
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
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
  // Thêm các cache keys khác ở đây
};
