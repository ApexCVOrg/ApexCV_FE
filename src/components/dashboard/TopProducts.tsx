'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

interface TopProduct {
  _id: string;
  name: string;
  image: string;
  totalQuantity: number;
  totalRevenue: number;
  category: string;
}

interface TopProductsProps {
  products: TopProduct[];
}

export default function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Top Selling Products
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {products.map((product, index) => (
            <ListItem
              key={product._id}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: index < products.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <ListItemAvatar>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={product.image}
                    alt={product.name}
                    sx={{ width: 50, height: 50, borderRadius: 2 }}
                  />
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      minWidth: 20,
                      height: 20,
                    }}
                  />
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {product.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {product.category}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip
                        label={`${product.totalQuantity} sold`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: 'success.main',
                        }}
                      >
                        {formatCurrency(product.totalRevenue)}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {products.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: 'text.secondary',
            }}
          >
            <TrendingUp sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2">No sales data available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 