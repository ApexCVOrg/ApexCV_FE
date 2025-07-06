"use client";

import React, { useEffect, useState } from "react";
import { Paper, Typography, Box, useTheme, Button, CircularProgress } from "@mui/material";
import Grid from '@mui/material/Grid';
import { useTranslations } from "next-intl";
import { useRouter } from 'next/navigation';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SalesChart from '@/components/dashboard/SalesChart';
import TopProducts from '@/components/dashboard/TopProducts';
import OrderStats from '@/components/dashboard/OrderStats';
import { ShoppingCart, Cancel, LocalShipping, CheckCircle } from '@mui/icons-material';

// Interface cho FE components
interface DashboardData {
  summary: {
    lowStockProducts: number;
    todaySales: number;
    deliveredOrders: number;
    conversionRate: number;
    orderCompletionRate: number;
    cancelledOrders: number;
  };
  salesChart: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    image: string;
    totalQuantity: number | null | undefined;
    totalRevenue: number | null | undefined;
    category: string;
  }>;
  orderStats: Array<{
    name: string;
    value: number;
    color: string;
    icon: React.ReactNode;
  }>;
  totalOrders: number;
}

export default function DashboardPage() {
  const t = useTranslations("manager.dashboard");
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper function để map status thành icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ShoppingCart />;
      case 'paid':
      case 'processing':
        return <LocalShipping />;
      case 'delivered':
      case 'shipped':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <ShoppingCart />;
    }
  };

  // Helper function để map status thành tên hiển thị
  const getStatusName = (status: string) => {
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
  };

  // Transform backend data to frontend format
  const transformBackendData = (backendData: any): DashboardData => {
    // Danh sách 12 tháng
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // Map dữ liệu backend trả về
    const salesChartMap = new Map((backendData.salesChart || []).map((item: any) => [item.month, item]));
    // Fill đủ 12 tháng
    const fullSalesChart = months.map(month => {
      const item = salesChartMap.get(month) as { month: string; revenue: number; orders: number } | undefined;
      return item && typeof item.revenue === 'number' && typeof item.orders === 'number'
        ? { month, revenue: item.revenue, orders: item.orders }
        : { month, revenue: 0, orders: 0 };
    });

    return {
      summary: {
        lowStockProducts: backendData.lowStockCount,
        todaySales: backendData.todaySales,
        deliveredOrders: backendData.deliveredOrders,
        conversionRate: backendData.conversionRate,
        orderCompletionRate: backendData.completionRate,
        cancelledOrders: backendData.cancelledOrders,
      },
      salesChart: fullSalesChart,
      topProducts: backendData.topProducts.map((product: any) => ({
        _id: product._id,
        name: product.name,
        image: product.image,
        totalQuantity: product.totalSold,
        totalRevenue: product.revenue,
        category: product.category,
      })),
      orderStats: backendData.orderStats.map((stat: any) => ({
        name: getStatusName(stat.status),
        value: stat.count,
        color: stat.color,
        icon: getStatusIcon(stat.status),
      })),
      totalOrders: backendData.orderStats.reduce((sum: number, stat: any) => sum + stat.count, 0),
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manager/dashboard/summary`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            router.push('/auth/login');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          const transformedData = transformBackendData(result.data);
          setDashboardData(transformedData);
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !dashboardData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error">
          {error || 'Failed to load dashboard data'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            letterSpacing: 2,
            fontFamily: "'Anton', sans-serif",
          }}
        >
          {t("overview")}
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 4 }}>
        <SummaryCards data={dashboardData.summary} />
      </Box>

      {/* Charts and Analytics */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Sales Chart and Top Products Row */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 800px', minWidth: 0 }}>
            <SalesChart data={dashboardData.salesChart} />
          </Box>
          <Box sx={{ flex: '0 1 400px', minWidth: 0 }}>
            <TopProducts products={dashboardData.topProducts} />
          </Box>
        </Box>

        {/* Order Statistics */}
        <Box>
          <OrderStats 
            orderStatusData={dashboardData.orderStats}
            totalOrders={dashboardData.totalOrders}
          />
        </Box>
      </Box>
    </Box>
  );
}
 