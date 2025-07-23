'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid, useTheme } from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Inventory from '@mui/icons-material/Inventory';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import AttachMoney from '@mui/icons-material/AttachMoney';
import Cancel from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarIcon from '@mui/icons-material/Star';
import AutorenewIcon from '@mui/icons-material/Autorenew';

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
  action?: string;
  extra?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  action,
  extra,
}) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 30px rgba(0,0,0,0.4)' 
            : 4,
        },
        borderTop: `4px solid ${color}`,
        borderRadius: 4,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 15px rgba(0,0,0,0.2)' 
          : 2,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
          : 'background.paper',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
          {trend && (
            <Chip
              label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
              size="small"
              color={trend.isPositive ? 'success' : 'error'}
              sx={{ fontSize: '0.75rem', float: 'right' }}
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
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: theme.palette.mode === 'dark' ? '#e0e0e0' : theme.palette.text.secondary,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1, 
              display: 'block',
              color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
            }}
          >
            {subtitle}
          </Typography>
        )}
        {extra && (
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1, 
              display: 'block',
              color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
            }}
          >
            {extra}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

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
  const theme = useTheme();
  
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
    {
      title: 'Top Selling Product',
      value: "Arsenal Men's Home Jersey 2024/25",
      icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#ffd700' }} />,
      color: '#ffd700',
      subtitle: '125 units sold this month',
      action: 'View Details',
    },
    {
      title: 'Pending Orders',
      value: '8 orders',
      icon: <HourglassEmptyIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      color: '#ff9800',
      subtitle: '3 waiting confirmation / 2 packing / 3 shipping',
    },
    {
      title: 'Customer Feedback Rate',
      value: '92.4%',
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      color: '#4caf50',
      subtitle: '14 new reviews today',
      trend: { value: 4.8, isPositive: true },
      extra: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon sx={{ color: '#FFD700', fontSize: 18 }} />
          4.7
        </Box>
      ),
    },
    {
      title: 'Returning Customers',
      value: '32 this week',
      icon: <AutorenewIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
      color: '#2196f3',
      subtitle: 'Loyalty rate: 26% (↑2%)',
      trend: { value: 2, isPositive: true },
    },
  ];

  return (
    <Grid 
      container 
      spacing={3} 
      alignItems="stretch"
      justifyContent="center"
      sx={{ 
        maxWidth: '100%',
        mx: 'auto',
      }}
    >
      {cards.map((card, index) => (
        <Grid 
          key={index} 
          sx={{ 
            display: 'flex',
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(25% - 18px)', xl: 'calc(20% - 19.2px)' },
            minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(25% - 18px)', xl: 'calc(20% - 19.2px)' },
          }}
        >
          <Card
            sx={{
              width: '100%',
              minHeight: 220,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'stretch',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 30px rgba(0,0,0,0.4)' 
                  : 4 
              },
              borderTop: `4px solid ${card.color}`,
              borderRadius: 4,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 15px rgba(0,0,0,0.2)' 
                : 2,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
                : 'background.paper',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(100, 120, 150, 0.3)'
                : '1px solid rgba(0, 0, 0, 0.12)',
            }}
          >
            <CardContent
              sx={{
                p: 3,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Box sx={{ color: card.color, opacity: 0.8 }}>{card.icon}</Box>
                {card.trend && (
                  <Chip
                    label={`${card.trend.isPositive ? '+' : ''}${card.trend.value}%`}
                    size="small"
                    color={card.trend.isPositive ? 'success' : 'error'}
                    sx={{ fontSize: '0.75rem', float: 'right' }}
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
                  color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                }}
              >
                {card.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: theme.palette.mode === 'dark' ? '#e0e0e0' : theme.palette.text.secondary,
                }}
              >
                {card.title}
              </Typography>
              {card.subtitle && (
                <Typography
                  variant="caption"
                  sx={{ 
                    mt: 1, 
                    display: 'block',
                    color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
                  }}
                >
                  {card.subtitle}
                </Typography>
              )}
              {card.extra && (
                <Typography
                  variant="caption"
                  sx={{ 
                    mt: 1, 
                    display: 'block',
                    color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
                  }}
                >
                  {card.extra}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
