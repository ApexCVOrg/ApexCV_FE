'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  LocalShipping,
  Inventory,
  ShoppingCart,
  AttachMoney,
  Cancel,
} from '@mui/icons-material';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
}) => (
  <Card
    sx={{
      height: '100%',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
      borderTop: `4px solid ${color}`,
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ color, opacity: 0.8 }}>
          {icon}
        </Box>
        {trend && (
          <Chip
            label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
            size="small"
            color={trend.isPositive ? 'success' : 'error'}
            sx={{ fontSize: '0.75rem' }}
          />
        )}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          letterSpacing: 1,
          fontFamily: "'Anton', sans-serif",
          mb: 1,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

interface SummaryCardsProps {
  data: {
    lowStockProducts: number;
    todaySales: number;
    deliveredOrders: number;
    conversionRate: number;
    orderCompletionRate: number;
    cancelledOrders: number;
  };
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const cards = [
    {
      title: 'Low Stock Products',
      value: data.lowStockProducts,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      subtitle: 'Products with stock < 5',
    },
    {
      title: 'Today Sales',
      value: formatCurrency(data.todaySales),
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: 'Delivered Orders',
      value: data.deliveredOrders,
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      color: '#2196f3',
    },
    {
      title: 'Conversion Rate',
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      trend: { value: 5.2, isPositive: true },
    },
    {
      title: 'Order Completion Rate',
      value: `${data.orderCompletionRate.toFixed(1)}%`,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#00bcd4',
      trend: { value: 2.1, isPositive: true },
    },
    {
      title: 'Cancelled Orders',
      value: data.cancelledOrders,
      icon: <Cancel sx={{ fontSize: 40 }} />,
      color: '#f44336',
      trend: { value: 8.3, isPositive: false },
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <SummaryCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
} 