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
  totalQuantity: number | null | undefined;
  totalRevenue: number | null | undefined;
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

// Backend response interface
interface BackendDashboardResponse {
  success: boolean;
  data: {
    lowStockCount: number;
    todaySales: number;
    deliveredOrders: number;
    conversionRate: number;
    completionRate: number;
    cancelledOrders: number;
    salesChart: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
    topProducts: Array<{
      _id: string;
      name: string;
      category: string;
      image: string;
      totalSold: number;
      revenue: number;
    }>;
    orderStats: Array<{
      status: string;
      count: number;
      percent: number;
      color: string;
    }>;
  };
}

class DashboardService {
  async getDashboardSummary(): Promise<DashboardData> {
    try {
      const response = await apiService.get<BackendDashboardResponse>(
        `${API_ENDPOINTS.MANAGER.DASHBOARD}/summary`
      );

      if (!response.data.success) {
        throw new Error('Failed to fetch dashboard data');
      }

      const backendData = response.data.data;

      // Transform backend data to frontend format
      return {
        summary: {
          lowStockProducts: backendData.lowStockCount,
          todaySales: backendData.todaySales,
          deliveredOrders: backendData.deliveredOrders,
          conversionRate: backendData.conversionRate,
          orderCompletionRate: backendData.completionRate,
          cancelledOrders: backendData.cancelledOrders,
        },
        salesChart: backendData.salesChart,
        topProducts: backendData.topProducts.map(product => ({
          _id: product._id,
          name: product.name,
          image: product.image,
          totalQuantity: product.totalSold,
          totalRevenue: product.revenue,
          category: product.category,
        })),
        orderStats: backendData.orderStats.map(stat => ({
          name: this.getStatusName(stat.status),
          value: stat.count,
          color: stat.color,
          icon: this.getStatusIcon(stat.status),
        })),
        totalOrders: backendData.orderStats.reduce((sum, stat) => sum + stat.count, 0),
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  private getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'shopping_cart';
      case 'paid':
      case 'processing':
        return 'local_shipping';
      case 'delivered':
      case 'shipped':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'shopping_cart';
    }
  }

  private getStatusName(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'paid':
        return 'Paid';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
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
