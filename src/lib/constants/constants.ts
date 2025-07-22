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
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    SEND_OTP: '/auth/send-otp',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPDATE_ADDRESS: '/users/update-address',
  },
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    PRODUCTS: '/manager/products',
    CATEGORIES: '/manager/categories',
    ORDERS: '/manager/orders',
    CUSTOMERS: '/manager/customers',
    USERS: '/manager/users',
    SETTINGS: '/manager/settings',
    STATS: {
      SALES: '/manager/stats/sales',
      USERS: '/manager/stats/users',
      ORDERS: '/manager/stats/orders',
      CUSTOMERS: '/manager/stats/customers',
    },
    BRANDS: '/manager/brands',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    CUSTOMERS: '/admin/customers',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    COUPONS: '/admin/coupons',
    STATS: {
      SALES: '/admin/stats/sales',
      USERS: '/admin/stats/users',
      ORDERS: '/admin/stats/orders',
      CUSTOMERS: '/admin/stats/customers',
    },
    BRANDS: '/admin/brands',
  },
};

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com';

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
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN_DASHBOARD: '/admin/dashboard',
  MANAGER_DASHBOARD: '/manager/dashboard',
  MEN: {
    ROOT: '/men',
    JERSEY: '/men/Jersey',
    HOODIE: '/men/hoodie',
    SHORT_TROUSER: '/men/shorttrouser',
    JACKET: '/men/jacket',
    TEAM_SNEAKER: '/men/team-sneaker',
  },
  WOMEN: {
    ROOT: '/women',
    JERSEY: '/women/Jersey-women',
    HOODIE: '/women/hoodie-women',
    JACKET: '/women/jacket-women',
    SHORT_TROUSER: '/women/shorttrouser-women',
    TEAM_SNEAKER: '/women/team-sneaker',
  },
  KIDS: {
    ROOT: '/kids',
    JERSEY: '/kids/jersey',
    TRACKSUITS: '/kids/tracksuit',
    SMILEY: '/kids/smiley-kids',
  },
  SHOES: {
    ROOT: '/shoes',
    SAMBA: '/shoes/samba',
    GAZELLE: '/shoes/gazelle',
    SPEZIAL: '/shoes/spezial',
    SUPERSTAR: '/shoes/superstar',
    SL_72: '/shoes/sl-72',
    ADIZERO: '/shoes/adizero',
    AIR_FORCE: '/shoes/air-force',
    AIR_MAX: '/shoes/air-max',
  },
  ACCESSORIES: {
    ROOT: '/accessories',
    BAGS: '/accessories/bags',
    HATS: '/accessories/hats',
    SOCKS: '/accessories/socks',
    EYEWEAR: '/accessories/eyewears',
  },
  COLLECTION_ULTRABOOST: '/collections/ultraboost',
  COLLECTION_ORIGINALS: '/collections/originals',
  COLLECTION_SPORTSWEAR: '/collections/sportswear',
  PROMO: '/promo',
  SALE: {
    ROOT: '/sale',
    MEN_SALE: '/sale/men-sale',
    WOMEN_SALE: '/sale/women-sale',
    KIDS_SALE: '/sale/kids-sale',
    ACCESSORIES_SALE: '/sale/accessories-sale',
    FLASH_SALE: '/sale/flash-sale',
  },
  CART: '/cart',
  OUTLET: {
    ROOT: '/outlet',
    MEN: '/outlet/men',
    WOMEN: '/outlet/women',
    KIDS: '/outlet/kids',
    MEN_SHOES: '/outlet/men-shoes',
    WOMEN_SHOES: '/outlet/women-shoes',
    KIDS_SHOES: '/outlet/kids-shoes',
    MEN_CLOTHING: '/outlet/men-clothing',
    WOMEN_CLOTHING: '/outlet/women-clothing',
    KIDS_CLOTHING: '/outlet/kids-clothing',
    MEN_ACCESSORIES: '/outlet/men-accessories',
    WOMEN_ACCESSORIES: '/outlet/women-accessories',
    KIDS_ACCESSORIES: '/outlet/kids-accessories',
  },
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    PRODUCTS: '/manager/products',
    CATEGORIES: '/manager/categories',
    ORDERS: '/manager/orders',
    CUSTOMERS: '/manager/customers',
    USERS: '/manager/users',
    SETTINGS: '/manager/settings',
    CHAT: '/manager/chats',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    CUSTOMERS: '/admin/customers',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    CHAT: '/admin/chats',
    LOGS: '/admin/logs',
    COUPONS: '/admin/coupons',
  },
};

// Manager Dashboard Constants
export const MANAGER = {
  DRAWER_WIDTH: 200,
  STATS: {
    REFRESH_INTERVAL: 3600000, // 1 hour
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
// Admin Dashboard Constants
export const ADMIN = {
  DRAWER_WIDTH: 200,
  STATS: {
    REFRESH_INTERVAL: 3600000, // 1 hour
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
  MANAGER: {
    INVALID_PRODUCT_DATA: 'Invalid product data',
    INVALID_CATEGORY_DATA: 'Invalid category data',
    INVALID_ORDER_DATA: 'Invalid order data',
    INVALID_USER_DATA: 'Invalid user data',
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
  MANAGER: {
    PRODUCT_CREATED: 'Product created successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    CATEGORY_CREATED: 'Category created successfully',
    CATEGORY_UPDATED: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',
    ORDER_UPDATED: 'Order updated successfully',
    ORDER_DELETED: 'Order deleted successfully',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
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
};
