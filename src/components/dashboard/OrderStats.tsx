'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OrderStatusData {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

interface OrderStatsProps {
  orderStatusData: OrderStatusData[] | null | undefined;
  totalOrders: number | null | undefined;
}

export default function OrderStats({ orderStatusData, totalOrders }: OrderStatsProps) {
  const theme = useTheme();
  
  // Default values if data is null or undefined
  const safeOrderStatusData = orderStatusData || [];
  const safeTotalOrders = totalOrders || 0;

  // Debug: Log data to console


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage =
        safeTotalOrders > 0 ? ((data.value / safeTotalOrders) * 100).toFixed(1) : '0.0';
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
          <Typography variant="body2" sx={{ 
            fontWeight: 600, 
            mb: 1,
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary
          }}>
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6a82fb', fontWeight: 600 }}>
            {data.value} orders ({percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomLegend = ({ payload }: any) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
      {// eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload?.map((entry: any, index: number) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: 1,
            background: theme.palette.mode === 'dark' 
              ? 'rgba(60, 70, 90, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 15px rgba(0,0,0,0.3)'
              : '0 4px 15px rgba(0,0,0,0.1)',
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: entry.color,
              borderRadius: '50%',
            }}
          />
          <Typography variant="caption" sx={{ 
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary
          }}>
            {entry.value}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary
          }}>
            (
            {safeTotalOrders > 0
              ? ((entry.payload.value / safeTotalOrders) * 100).toFixed(1)
              : '0.0'}
            %)
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%' }}
    >
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
        <Card sx={{ 
          height: '100%', 
          minHeight: 400, 
          flex: 1, 
          maxWidth: 600, 
          width: '100%',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
            : 'background.paper',
          border: theme.palette.mode === 'dark'
            ? '1px solid rgba(100, 120, 150, 0.3)'
            : '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 30px rgba(0,0,0,0.3)'
            : 4,
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
              }}
            >
              Order Status Distribution
            </Typography>
            {safeOrderStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={safeOrderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {safeOrderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                { }
                <CustomLegend
                  payload={safeOrderStatusData.map((item) => ({
                    value: item.name,
                    color: item.color,
                    payload: item,
                  }))}
                />
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 250,
                  color: theme.palette.mode === 'dark' ? '#b0b0b0' : 'text.secondary',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  No Order Data Available
                </Typography>
                <Typography variant="body2">
                  Order statistics will appear here once available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
        <Card sx={{ 
          height: '100%', 
          minHeight: 400, 
          flex: 1, 
          maxWidth: 600, 
          width: '100%',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
            : 'background.paper',
          border: theme.palette.mode === 'dark'
            ? '1px solid rgba(100, 120, 150, 0.3)'
            : '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 30px rgba(0,0,0,0.3)'
            : 4,
        }}>
          <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
              }}
            >
              Order Summary
            </Typography>
            {safeOrderStatusData.length > 0 ? (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                  {safeOrderStatusData.map((status, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2,
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(60, 70, 90, 0.8)' 
                          : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: `2px solid ${status.color}`,
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: status.color }}>{status.icon}</Box>
                        <Box>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary
                          }}>
                            {status.name}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary
                          }}>
                            {safeTotalOrders > 0
                              ? ((status.value / safeTotalOrders) * 100).toFixed(1)
                              : '0.0'}
                            % of total
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 900,
                          color: status.color,
                          fontFamily: "'Anton', sans-serif",
                        }}
                      >
                        {status.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6a82fb, #fc5c7d)',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 8px 25px rgba(106, 130, 251, 0.4)',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {safeTotalOrders}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                  color: theme.palette.mode === 'dark' ? '#b0b0b0' : 'text.secondary',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  No Order Data Available
                </Typography>
                <Typography variant="body2">
                  Order summary will appear here once available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
