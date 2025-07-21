'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Grid from '@mui/material/Grid';
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
  // Default values if data is null or undefined
  const safeOrderStatusData = orderStatusData || [];
  const safeTotalOrders = totalOrders || 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage =
        safeTotalOrders > 0 ? ((data.value / safeTotalOrders) * 100).toFixed(1) : '0.0';
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="primary">
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
            bgcolor: 'background.paper',
            border: '1px solid #f0f0f0',
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
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {entry.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
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
        <Card sx={{ height: '100%', minHeight: 400, flex: 1, maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                textTransform: 'uppercase',
                letterSpacing: 1,
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
                {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                <CustomLegend
                  payload={safeOrderStatusData.map((item, index) => ({
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
                  color: 'text.secondary',
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
        <Card sx={{ height: '100%', minHeight: 400, flex: 1, maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Order Summary
            </Typography>
            {safeOrderStatusData.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {safeOrderStatusData.map((status, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
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
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {status.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
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
                    bgcolor: 'primary.main',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {safeTotalOrders}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Orders
                  </Typography>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                  color: 'text.secondary',
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
