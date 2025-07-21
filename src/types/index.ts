//Định nghĩa TypeScript types, interfaces

// API Response Types
export interface ApiProduct {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  label?: string;
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  categoryPath?: string[] | string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  orderCount?: number;
  totalRevenue?: number;
  totalQuantity?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Swiper Types
export interface SwiperInstance {
  slideTo: (index: number) => void;
  activeIndex: number;
  slides: HTMLElement[];
  update: () => void;
  destroy: () => void;
}

// Size Guide Types
export interface SizeData {
  size: string;
  chest?: string;
  waist?: string;
  hips?: string;
  length?: string;
  footLength?: string;
  footWidth?: string;
  [key: string]: string | undefined;
}

// Chart Types
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
  }>;
  label?: string;
}

export interface ChartLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    dataKey: string;
  }>;
}

// Chat Types
export interface ChatMessage {
  _id: string;
  content: string;
  isUserMessage: boolean;
  timestamp: Date;
  attachments?: string[];
}

export interface ChatSession {
  _id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Dashboard Types
export interface DashboardData {
  salesChart: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
  orderStats: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  totalOrders: number;
  totalRevenue: number;
}

export interface BackendData {
  salesChart?: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts?: Array<{
    _id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
  orderStats?: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
}

// Form Types
export interface FormData {
  [key: string]: string | number | boolean | undefined;
}

// Error Types
export interface ApiError extends Error {
  status?: number;
  code?: string;
}