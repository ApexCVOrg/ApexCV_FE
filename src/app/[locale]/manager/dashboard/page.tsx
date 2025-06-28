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
    totalQuantity: number;
    totalRevenue: number;
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

  // Mock data for demonstration
  const mockData: DashboardData = {
    summary: {
      lowStockProducts: 12,
      todaySales: 25000000,
      deliveredOrders: 156,
      conversionRate: 3.2,
      orderCompletionRate: 87.5,
      cancelledOrders: 8,
    },
    salesChart: [
      { month: 'Jan', revenue: 45000000, orders: 120 },
      { month: 'Feb', revenue: 52000000, orders: 135 },
      { month: 'Mar', revenue: 48000000, orders: 110 },
      { month: 'Apr', revenue: 61000000, orders: 145 },
      { month: 'May', revenue: 55000000, orders: 130 },
      { month: 'Jun', revenue: 68000000, orders: 160 },
      { month: 'Jul', revenue: 72000000, orders: 175 },
      { month: 'Aug', revenue: 65000000, orders: 155 },
      { month: 'Sep', revenue: 58000000, orders: 140 },
      { month: 'Oct', revenue: 63000000, orders: 150 },
      { month: 'Nov', revenue: 70000000, orders: 165 },
      { month: 'Dec', revenue: 75000000, orders: 180 },
    ],
    topProducts: [
      {
        _id: '1',
        name: 'Arsenal Home Jersey 2024/25',
        image: '/assets/images/Arsenal_24-25_Home_Jersey_Red.avif',
        totalQuantity: 45,
        totalRevenue: 6750000,
        category: 'Jerseys',
      },
      {
        _id: '2',
        name: 'Manchester United Training Jacket',
        image: '/assets/images/MU_Training_Jacket.avif',
        totalQuantity: 38,
        totalRevenue: 4560000,
        category: 'Jackets',
      },
      {
        _id: '3',
        name: 'Real Madrid Home Shorts',
        image: '/assets/images/Real_Madrid_25-26_Home_Shorts.avif',
        totalQuantity: 32,
        totalRevenue: 1920000,
        category: 'Shorts',
      },
      {
        _id: '4',
        name: 'Bayern Munich Shoes',
        image: '/assets/images/FC_Bayern_Shoes.avif',
        totalQuantity: 28,
        totalRevenue: 4200000,
        category: 'Shoes',
      },
      {
        _id: '5',
        name: 'Juventus Hoodie',
        image: '/assets/images/Juventus_Hoodie.png',
        totalQuantity: 25,
        totalRevenue: 2500000,
        category: 'Hoodies',
      },
    ],
    orderStats: [
      {
        name: 'Pending',
        value: 23,
        color: '#ff9800',
        icon: <ShoppingCart />,
      },
      {
        name: 'Processing',
        value: 45,
        color: '#2196f3',
        icon: <LocalShipping />,
      },
      {
        name: 'Delivered',
        value: 156,
        color: '#4caf50',
        icon: <CheckCircle />,
      },
      {
        name: 'Cancelled',
        value: 8,
        color: '#f44336',
        icon: <Cancel />,
      },
    ],
    totalOrders: 232,
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Giả sử JWT, decode payload để lấy role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('User role:', payload.role);
      } catch (e) {
        console.log('Cannot decode token:', e);
      }
    } else {
      console.log('No token found');
    }

    // Simulate API call
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In real implementation, fetch from API
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manager/dashboard/summary`);
        // const data = await response.json();
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data
        setDashboardData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (!dashboardData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load dashboard data
        </Typography>
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
 