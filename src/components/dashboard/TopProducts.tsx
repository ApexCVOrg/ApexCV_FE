'use client';

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

interface TopProduct {
  _id: string;
  name: string;
  image: string;
  totalQuantity: number | null | undefined;
  totalRevenue: number | null | undefined;
  category: string;
}

interface TopProductsProps {
  products: TopProduct[];
}

export default function TopProducts({ products }: TopProductsProps) {
  const theme = useTheme();
  
  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = amount || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  // Default empty array if products is null or undefined
  const safeProducts = products || [];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return '#ffd700';
      case 1: return '#c0c0c0';
      case 2: return '#cd7f32';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box
      sx={{
        height: '400px',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.9) 0%, rgba(30, 40, 60, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(230, 255, 230, 0.7) 0%, rgba(240, 250, 240, 0.7) 100%)',
        borderRadius: 4,
        p: 3,
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(180, 230, 180, 0.5)',
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
          background: 'linear-gradient(90deg, #4CAF50, #81C784)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
        <TrendingUp sx={{ mr: 1, color: '#4CAF50', fontSize: 28 }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
            fontFamily: "'Inter', sans-serif",
            fontSize: { xs: '1.3rem', md: '1.75rem' },
          }}
        >
          🏆 Top sản phẩm bán chạy
        </Typography>
      </Box>

      {safeProducts.length > 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          height: 'calc(100% - 80px)', 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '0px',
            display: 'none',
          },
          '&::-webkit-scrollbar-track': {
            display: 'none',
          },
          '&::-webkit-scrollbar-thumb': {
            display: 'none',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            display: 'none',
          },
          // Firefox
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {safeProducts.slice(0, 5).map((product, index) => {
            // Xử lý đường dẫn ảnh
            let imageUrl = '/assets/images/placeholder.jpg';
            if (product.image) {
              if (product.image.startsWith('/') || product.image.startsWith('http')) {
                imageUrl = product.image;
              } else {
                imageUrl = `/assets/images/${product.image}`;
              }
            }
            return (
              <Box
                key={product._id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(40, 50, 70, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(10px)',
                    boxShadow: '0 12px 30px rgba(76, 175, 80, 0.25)',
                  },
                }}
              >
                {/* Rank Badge */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${getRankColor(index)}, ${getRankColor(index)}cc)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    boxShadow: `0 6px 20px ${getRankColor(index)}50`,
                  }}
                >
                  {getRankIcon(index)}
                </Box>

                {/* Product Image */}
                <Avatar
                  src={imageUrl}
                  alt={product.name}
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 2,
                    border: '3px solid rgba(76, 175, 80, 0.3)',
                  }}
                />

                {/* Product Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      lineHeight: 1.2,
                      color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
                      display: 'block',
                      mb: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    {product.category}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={`${product.totalQuantity || 0} bán`}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #28a745, #218838)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: '#4CAF50',
                        fontSize: '0.85rem',
                      }}
                    >
                      {formatCurrency(product.totalRevenue)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100% - 80px)',
            color: 'text.secondary',
          }}
        >
          <TrendingUp sx={{ fontSize: 64, mb: 2, opacity: 0.5, color: 'success.main' }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có dữ liệu
          </Typography>
          <Typography variant="body2">
            Dữ liệu bán hàng sẽ hiển thị tại đây
          </Typography>
        </Box>
      )}
    </Box>
  );
}
