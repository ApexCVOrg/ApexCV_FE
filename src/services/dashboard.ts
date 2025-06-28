import { API_ENDPOINTS } from '@/lib/constants/constants';
import apiService from './api';

export interface DashboardSummary {
  lowStockProducts: number;
  todaySales: number;
  deliveredOrders: number;
  conversionRate: number;
  orderCompletionRate: number;
  cancelledOrders: number;
}

export interface SalesData {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  _id: string;
  name: string;
  image: string;
  totalQuantity: number;
  totalRevenue: number;
  category: string;
}

export interface OrderStatusData {
  name: string;
  value: number;
  color: string;
  icon: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  salesChart: SalesData[];
  topProducts: TopProduct[];
  orderStats: OrderStatusData[];
  totalOrders: number;
}

class DashboardService {
  async getDashboardSummary(): Promise<DashboardData> {
    try {
      const response = await apiService.get<DashboardData>(
        `${API_ENDPOINTS.MANAGER.DASHBOARD}/summary`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  async getLowStockProducts(): Promise<number> {
    try {
      const response = await apiService.get<{ count: number }>('/products/low-stock');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return 0;
    }
  }

  async getTodaySales(): Promise<number> {
    try {
      const response = await apiService.get<{ total: number }>('/orders/today-sales');
      return response.data.total;
    } catch (error) {
      console.error('Error fetching today sales:', error);
      return 0;
    }
  }

  async getOrderStats(): Promise<{ orderStats: OrderStatusData[]; totalOrders: number }> {
    try {
      const response = await apiService.get<{ orderStats: OrderStatusData[]; totalOrders: number }>(
        '/orders/stats'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return { orderStats: [], totalOrders: 0 };
    }
  }

  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      const response = await apiService.get<TopProduct[]>(`/products/top-selling?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  }

  async getSalesChart(months: number = 12): Promise<SalesData[]> {
    try {
      const response = await apiService.get<SalesData[]>(`/orders/sales-chart?months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales chart:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
