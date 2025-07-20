"use client";

import React, { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const t = useTranslations("admin.dashboard");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformBackendData = (backendData: any): DashboardData => {
    // Danh sách 12 tháng
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // Map dữ liệu backend trả về
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topProducts: backendData.topProducts.map((product: any) => ({
        _id: product._id,
        name: product.name,
        image: product.image,
        totalQuantity: product.totalSold,
        totalRevenue: product.revenue,
        category: product.category,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderStats: backendData.orderStats.map((stat: any) => ({
        name: getStatusName(stat.status),
        value: stat.count,
        color: stat.color,
        icon: getStatusIcon(stat.status),
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalOrders: backendData.orderStats.reduce((sum: number, stat: any) => sum + stat.count, 0),
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Get current locale from URL
      const currentLocale = window.location.pathname.split('/')[1];
      const loginUrl = currentLocale === 'en' || currentLocale === 'vi' 
        ? `/${currentLocale}/auth/login` 
        : '/vi/auth/login';
      router.push(loginUrl);
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
            // Get current locale from URL
            const currentLocale = window.location.pathname.split('/')[1];
            const loginUrl = currentLocale === 'en' || currentLocale === 'vi' 
              ? `/${currentLocale}/auth/login` 
              : '/vi/auth/login';
            router.push(loginUrl);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    // Get current locale from URL
    const currentLocale = window.location.pathname.split('/')[1];
    const loginUrl = currentLocale === 'en' || currentLocale === 'vi' 
      ? `/${currentLocale}/auth/login` 
      : '/vi/auth/login';
    router.push(loginUrl);
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          letterSpacing: 2,
          textTransform: 'uppercase',
          mb: 3,
          fontFamily: "'Anton', sans-serif",
        }}
      >
        {t('overview')}
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        <Box sx={{ width: '100%', mb: 3 }}>
          <SummaryCards data={dashboardData!.summary} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3, width: '100%', overflowX: 'hidden' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SalesChart data={dashboardData!.salesChart} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%', mb: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <OrderStats orderStatusData={dashboardData!.orderStats} totalOrders={dashboardData!.totalOrders} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <TopProducts products={dashboardData!.topProducts} />
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
 