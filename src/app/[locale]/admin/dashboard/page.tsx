'use client';

import React, { useEffect, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Paper, Typography, Box, useTheme, Button, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('manager.dashboard');
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
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    // Map dữ liệu backend trả về
     
    const salesChartMap = new Map(
      (backendData.salesChart || []).map((item: { month: string; revenue: number; orders: number }) => [item.month, item])
    );
    // Fill đủ 12 tháng
    const fullSalesChart = months.map(month => {
      const item = salesChartMap.get(month) as
        | { month: string; revenue: number; orders: number }
        | undefined;
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
      orderStats: backendData.orderStats && backendData.orderStats.length >= 5 
        ? backendData.orderStats.map((stat: any) => ({
            name: getStatusName(stat.status),
            value: stat.count,
            color: stat.color,
            icon: getStatusIcon(stat.status),
          }))
        : [
            // Mock data for testing UI - use until backend provides full data
            {
              name: 'Delivered',
              value: 14,
              color: '#4caf50',
              icon: getStatusIcon('delivered'),
            },
            {
              name: 'Paid',
              value: 10,
              color: '#2196f3',
              icon: getStatusIcon('paid'),
            },
            {
              name: 'Pending',
              value: 4,
              color: '#ff9800',
              icon: getStatusIcon('pending'),
            },
            {
              name: 'Shipped',
              value: 4,
              color: '#9c27b0',
              icon: getStatusIcon('shipped'),
            },
            {
              name: 'Cancelled',
              value: 2,
              color: '#f44336',
              icon: getStatusIcon('cancelled'),
            },
          ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalOrders: backendData.orderStats && backendData.orderStats.length >= 5
        ? backendData.orderStats.reduce((sum: number, stat: any) => sum + stat.count, 0)
        : 34, // Mock total for testing
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Get current locale from URL
      const currentLocale = window.location.pathname.split('/')[1];
      const loginUrl =
        currentLocale === 'en' || currentLocale === 'vi'
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/manager/dashboard/summary`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            // Get current locale from URL
            const currentLocale = window.location.pathname.split('/')[1];
            const loginUrl =
              currentLocale === 'en' || currentLocale === 'vi'
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
    const loginUrl =
      currentLocale === 'en' || currentLocale === 'vi'
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
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 1600, 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      pt: { xs: 4, md: 6 },
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: 1,
            mb: 1,
            fontFamily: "'Inter', sans-serif",
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
          }}
        >
          {t('overview')}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
            fontWeight: 300,
            fontFamily: '"Inter", "Roboto", sans-serif',
            fontSize: { xs: '1rem', md: '1.25rem' },
          }}
        >
          Quản lý hiệu suất và theo dõi hoạt động kinh doanh
        </Typography>
      </Box>

      {/* Main Dashboard Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Summary Cards Row */}
        <Box
          sx={{
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(230, 240, 255, 0.9) 0%, rgba(240, 245, 250, 0.9) 100%)',
            borderRadius: 6,
            p: { xs: 3, md: 5 },
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(180, 200, 230, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(15px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0,0,0,0.4)'
              : '0 12px 40px rgba(0,0,0,0.1)',
            maxWidth: 1400,
            mx: 'auto',
            width: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #6a82fb, #fc5c7d, #6a82fb)',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease-in-out infinite',
            },
            '@keyframes gradientShift': {
              '0%, 100%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 5,
              textAlign: 'center',
              color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
              fontFamily: "'Inter', sans-serif",
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              textShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px',
            }}
          >
            📊 Tổng quan thống kê
          </Typography>
          <SummaryCards data={dashboardData!.summary} />
        </Box>

        {/* Charts Row */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 5,
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
        }}>
          <Box sx={{ 
            flex: { lg: 2 },
            minHeight: 500,
          }}>
            <SalesChart data={dashboardData!.salesChart} />
          </Box>

          <Box sx={{ 
            flex: { lg: 1 },
            minHeight: 500,
          }}>
            <TopProducts products={dashboardData!.topProducts} />
          </Box>
        </Box>

        {/* Order Stats Row */}
        <Box sx={{
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
        }}>
          <OrderStats
            orderStatusData={dashboardData!.orderStats}
            totalOrders={dashboardData!.totalOrders}
          />
        </Box>
      </Box>
    </Box>
  );
}