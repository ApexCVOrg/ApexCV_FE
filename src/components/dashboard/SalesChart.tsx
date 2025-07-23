'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';

interface SalesData {
  month: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: SalesData[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const theme = useTheme();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: theme.palette.mode === 'dark' 
              ? 'rgba(30, 40, 60, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 3,
            p: 2,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 30px rgba(0, 0, 0, 0.4)'
              : '0 10px 30px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography variant="body1" sx={{ 
            fontWeight: 700, 
            mb: 1, 
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary 
          }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6a82fb', fontWeight: 600 }}>
            💰 Doanh thu: {formatCurrency(payload[0]?.value || 0)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#fc5c7d', fontWeight: 600 }}>
            📦 Đơn hàng: {payload[1]?.value || 0}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        height: '400px',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.9) 0%, rgba(30, 40, 60, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(230, 240, 255, 0.7) 0%, rgba(250, 230, 240, 0.7) 100%)',
        borderRadius: 4,
        p: 3,
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(180, 200, 230, 0.5)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 30px rgba(0,0,0,0.3)'
          : '0 8px 30px rgba(0,0,0,0.08)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #6a82fb, #fc5c7d)',
        },
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 3,
          color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: { xs: '1.3rem', md: '1.75rem' },
        }}
      >
        📈 Doanh thu theo tháng
      </Typography>

      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6a82fb" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6a82fb" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fc5c7d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#fc5c7d" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: 'currentColor' }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis
            yAxisId="revenue"
            orientation="left"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#6a82fb"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={3}
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="#fc5c7d"
            strokeWidth={3}
            dot={{ fill: '#fc5c7d', strokeWidth: 2, r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', 
        gap: 3,
        background: theme.palette.mode === 'dark'
          ? 'rgba(40, 50, 70, 0.95)'
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        px: 3,
        py: 1,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 15px rgba(0,0,0,0.3)'
          : '0 4px 15px rgba(0,0,0,0.1)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            background: 'linear-gradient(45deg, #6a82fb, #898cfb)',
            borderRadius: '50%' 
          }} />
          <Typography variant="body2" sx={{ 
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary
          }}>
            Doanh thu
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            background: 'linear-gradient(45deg, #fc5c7d, #fc839e)',
            borderRadius: '50%' 
          }} />
          <Typography variant="body2" sx={{ 
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary
          }}>
            Đơn hàng
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
