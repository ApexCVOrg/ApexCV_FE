'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Snackbar,
  Alert,
  IconButton,
  Rating,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslations } from 'next-intl';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { PRODUCT_LABELS, ProductLabel } from '@/types/components/label';

import { useAuthContext } from '@/context/AuthContext';
import { useCartContext } from '@/context/CartContext';
import api from '@/services/api';
import { useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

// Thêm type cho category hỗ trợ cả id và _id
export type CategoryLike = { id?: string; _id?: string; name: string };

interface ProductCardProps {
  _id: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: string | { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  categoryPath?: string[]; // Thêm categoryPath
  onViewDetail?: () => void; // Click handler cho mở sidebar
  labels?: ProductLabel[];
  allCategories?: CategoryLike[];
  allBrands?: { _id: string; name: string }[];
  productId: string;
  backgroundColor?: string; // Thêm background color như Nike project
  colors?: number; // Số lượng màu sắc
  availableColors?: string[]; // Danh sách màu sắc có sẵn
  addToCartButtonProps?: React.ComponentProps<typeof Button>;
  averageRating?: number; // Thêm prop này
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  price,
  discountPrice,
  tags,
  brand,
  categories,
  categoryPath,
  onViewDetail,
  labels,
  allCategories,
  allBrands,
  productId,
  backgroundColor = '#ffffff',
  colors = 1,
  availableColors = [],
  addToCartButtonProps,
  averageRating = 5.0, // Giá trị mặc định nếu không truyền
}) => {
  // Theme hook
  const { theme } = useTheme();
  const t = useTranslations('productCard');
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const isDiscounted = discountPrice !== undefined && discountPrice < price;
  const displayLabels = labels?.filter(l => l !== 'sale') || [];

  // Kiểm tra xem có phải ảnh trong lib không
  const isLibImage = image.includes('/assets/images/lib/');

  // GSAP Animation cho entrance effect (chỉ cho lib images)
  useEffect(() => {
    if (isLibImage && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'elastic.out(1,0.3)',
          delay: Math.random() * 0.3, // Stagger effect
        }
      );
    }
  }, [isLibImage]);

  // Debug logs
  if (typeof window !== 'undefined') {
  }

  // Hiển thị brand đúng tên
  let displayBrand = '';
  if (brand) {
    if (typeof brand === 'string' && allBrands) {
      const found = allBrands.find(b => String(b._id) === String(brand));
      displayBrand = found ? found.name : brand;
    } else if (typeof brand === 'object' && brand.name) {
      displayBrand = brand.name;
    }
  }
  if (!displayBrand) displayBrand = t('unknownBrand');

  const handleCardClick = () => {
    if (onViewDetail) {
      onViewDetail(); // Mở sidebar
    }
  };

  const handleViewDetailButton = () => {
    router.push(`/product/${productId}`); // Chuyển đến trang detail
  };

  // const handleAddToCartClick = async () => {
  //   if (!token) {
  //     setSnackbar({
  //       open: true,
  //       message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
  //       severity: 'warning',
  //     });
  //     return;
  //   }
  //   try {
  //     await api.post('/carts/add', { productId });
  //     setSnackbar({
  //       open: true,
  //       message: t('addToCartSuccess') || 'Đã thêm vào giỏ hàng!',
  //       severity: 'success',
  //     });
  //   } catch {
  //     setSnackbar({
  //       open: true,
  //       message: t('addToCartError') || 'Thêm vào giỏ hàng thất bại!',
  //       severity: 'error',
  //     });
  //   }
  // };

  // const handleCloseSnackbar = () => {
  //   setSnackbar(prev => ({ ...prev, open: false }));
  // };

  const { token } = useAuthContext();
  const { refreshCart } = useCartContext();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleAddToCart = async () => {
    if (!token) {
      setSnackbar({
        open: true,
        message: t('loginToViewCart') || 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
        severity: 'warning',
      });
      return;
    }
    try {
      await api.post('/carts/add', { productId });
      await refreshCart(); // Refresh cart state
      setSnackbar({
        open: true,
        message: t('addToCartSuccess') || 'Đã thêm vào giỏ hàng!',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: t('addToCartError') || 'Thêm vào giỏ hàng thất bại!',
        severity: 'error',
      });
    }
  };

  // Nếu là ảnh lib, render card style hiện tại với animation
  if (isLibImage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ height: '100%' }}
      >
        <Card
          ref={cardRef}
          onClick={handleCardClick}
          sx={{
            borderRadius: '24px',
            background: theme === THEME.LIGHT ? backgroundColor : '#1a1a1a',
            boxShadow: theme === THEME.LIGHT 
              ? '0 4px 24px 0 rgba(0,0,0,0.08)' 
              : '0 4px 24px 0 rgba(0,0,0,0.3)',
            p: 0,
            pt: 7,
            pb: 3,
            px: 2,
            position: 'relative',
            overflow: 'visible',
            minWidth: 260,
            maxWidth: 300,
            minHeight: 250,
            maxHeight: 250,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'box-shadow 0.3s',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: theme === THEME.LIGHT 
                ? '0 8px 32px 0 rgba(0,0,0,0.16)' 
                : '0 8px 32px 0 rgba(0,0,0,0.4)',
              '.cart-btn': {
                opacity: 1,
                pointerEvents: 'auto',
              },
              '.product-image': {
                transform: 'translateX(-50%) rotate(-15deg) scale(1.65)',
                filter: theme === THEME.LIGHT 
                  ? 'drop-shadow(0 8px 32px rgba(0,0,0,0.18))' 
                  : 'drop-shadow(0 8px 32px rgba(0,0,0,0.3))',
              },
            },
          }}
        >
          {/* Favorite Button (top right of card) */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 3,
              pointerEvents: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <FavoriteButton productId={productId} size="small" color="error" showTooltip={true} />
          </Box>
          {/* Ảnh sản phẩm nổi ra ngoài card, hiệu ứng đồng bộ hover */}
          <Box
            sx={{
              position: 'absolute',
              top: -80,
              left: '50%',
              transform: 'translateX(-50%) rotate(-15deg)',
              zIndex: 2,
              width: 260,
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              pointerEvents: 'none',
              transition:
                'transform 0.4s cubic-bezier(.4,2,.6,1), filter 0.4s cubic-bezier(.4,2,.6,1)',
            }}
            className="product-image"
          >
            <Image
              src={image}
              alt={name}
              width={300}
              height={300}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.12))',
                display: 'block',
                background: 'none',
                transition: 'filter 0.4s cubic-bezier(.4,2,.6,1)',
              }}
            />
          </Box>

          {/* Product Description Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: theme === THEME.LIGHT 
                ? 'linear-gradient(transparent, rgba(255,255,255,0.9) 20%, white)' 
                : 'linear-gradient(transparent, rgba(26,26,26,0.9) 20%, #1a1a1a)',
              padding: '20px',
              borderRadius: '20px 20px 0 0',
              transform: 'translateY(60px)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(0)',
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Product Name */}
              <Typography
                gutterBottom
                variant="h6"
                component="h3"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  height: '2.4em',
                  lineHeight: '1.2em',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  letterSpacing: '0.5px',
                  color: theme === THEME.LIGHT ? 'black' : 'white',
                  fontSize: '14px',
                }}
              >
                {name}
              </Typography>

              {/* Colors Info */}
              <Typography
                variant="body2"
                color={theme === THEME.LIGHT ? 'text.secondary' : 'text.primary'}
                sx={{
                  fontSize: '12px',
                  textTransform: 'capitalize',
                  letterSpacing: '0.5px',
                  marginBottom: 1,
                }}
              >
                {colors} colors
              </Typography>

              {/* Price Section */}
              <Box sx={{ mb: 2 }}>
                {isDiscounted ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="h6"
                      color="error"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ShoppingCartIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {discountPrice.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        textDecoration: 'line-through',
                        fontSize: '12px',
                      }}
                    >
                      {price.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ShoppingCartIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    {price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </Typography>
                )}
              </Box>

              {/* Star rating (5.0) */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating
                  value={averageRating}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{ color: '#FFD600' }}
                />
                <Box
                  sx={{
                    bgcolor: '#f5f5f5',
                    color: '#222',
                    fontWeight: 600,
                    fontSize: 14,
                    borderRadius: 1,
                    px: 1,
                    ml: 1,
                  }}
                >
                  {averageRating.toFixed(1)}
                </Box>
              </Box>

              {/* Brand and Categories */}
              <Typography
                variant="body2"
                color={theme === THEME.LIGHT ? 'text.secondary' : 'text.primary'}
                sx={{
                  fontSize: '12px',
                  marginBottom: 1,
                }}
              >
                {displayBrand} - {categories?.map(cat => cat.name).join(', ') || categoryPath?.join(' / ') || t('uncategorized')}
              </Typography>

              {/* Tags */}
              {(tags || []).length > 0 && (
                <Stack direction="row" spacing={0.5} mb={2} flexWrap="wrap">
                  {(tags || []).map(tag => {
                    let displayTag = tag;
                    let found: CategoryLike | undefined;
                    if (allCategories) {
                      found = allCategories.find(cat => String(cat.id ?? cat._id) === String(tag));
                      if (found) displayTag = found.name;
                    }
                    return (
                      <Chip
                        key={tag}
                        label={displayTag}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          backgroundColor: theme === THEME.LIGHT ? '#f1f1f1' : '#333',
                          color: theme === THEME.LIGHT ? '#333' : '#e0e0e0',
                          fontSize: '10px',
                          height: '20px',
                        }}
                      />
                    );
                  })}
                </Stack>
              )}

              {/* Available Colors */}
              {availableColors && availableColors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      mb: 1,
                    }}
                  >
                    Available Colors
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {availableColors.slice(0, 4).map((color, index) => (
                      <Box
                        key={`${productId}-color-${index}`}
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: color.toLowerCase(),
                          border: '1px solid #e0e0e0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.2)',
                          },
                        }}
                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                      />
                    ))}
                    {availableColors.length > 4 && (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          fontWeight: 600,
                          color: '#666',
                        }}
                        title={`+${availableColors.length - 4} more colors`}
                      >
                        +{availableColors.length - 4}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Box>

          {/* 2 Icon buttons ẩn, hover card mới hiện ra */}
          <Box
            className="cart-btn"
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%) translateY(20px)',
              zIndex: 3,
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.3s, transform 0.4s cubic-bezier(.4,2,.6,1)',
              display: 'flex',
              gap: 1,
            }}
          >
            <IconButton
              onClick={e => {
                e.stopPropagation();
                handleViewDetailButton();
              }}
              sx={{
                bgcolor: theme === THEME.LIGHT ? 'white' : '#333',
                color: '#1976d2',
                border: '2px solid #1976d2',
                width: 48,
                height: 48,
                boxShadow: theme === THEME.LIGHT 
                  ? '0 2px 8px 0 rgba(0,0,0,0.10)' 
                  : '0 2px 8px 0 rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#1976d2',
                  color: 'white',
                  borderColor: '#1976d2',
                },
              }}
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton
              onClick={e => {
                e.stopPropagation();
                handleAddToCart();
              }}
              sx={{
                bgcolor: '#1976d2',
                color: '#fff',
                width: 48,
                height: 48,
                boxShadow: theme === THEME.LIGHT 
                  ? '0 2px 8px 0 rgba(0,0,0,0.10)' 
                  : '0 2px 8px 0 rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#1565c0',
                },
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Card>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    );
  }

  // Nếu không phải ảnh lib, render card style đơn giản
  return (
    <Card
      onClick={handleCardClick}
      sx={{
        maxWidth: 320,
        borderRadius: 4,
        boxShadow: theme === THEME.LIGHT ? 2 : '0 4px 20px rgba(0,0,0,0.3)',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: theme === THEME.LIGHT ? '#fff' : '#1a1a1a',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': { 
          boxShadow: theme === THEME.LIGHT ? 6 : '0 8px 32px rgba(0,0,0,0.4)' 
        },
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
        <Box
          sx={{
            width: 320,
            height: 220,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#f6f6f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardMedia
            component="img"
            image={image}
            alt={name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        {/* Favorite Button */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 3,
          }}
          onClick={e => e.stopPropagation()}
        >
          <FavoriteButton productId={productId} size="small" color="error" showTooltip={true} />
        </Box>
        {isDiscounted && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: '#222',
              color: '#fff',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 700,
              fontSize: 13,
              zIndex: 2,
            }}
          >
            {`${Math.round(100 - (discountPrice! / price) * 100)}% OFF`}
          </Box>
        )}
        {displayLabels.map((label, idx) => {
          const labelDisplay = PRODUCT_LABELS.find(l => l.value === label)?.label || label;
          return (
            <Chip
              key={label + idx}
              label={labelDisplay}
              color="warning"
              size="small"
              sx={{
                position: 'absolute',
                top: 12 + (isDiscounted ? idx + 1 : idx) * 32,
                left: 12,
                fontWeight: 'bold',
                fontSize: 12,
                paddingX: 1,
                zIndex: 2,
              }}
            />
          );
        })}
      </Box>
      <CardContent
        sx={{
          width: '100%',
          p: 0,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Typography
          gutterBottom
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: theme === THEME.LIGHT ? '#222' : '#e0e0e0',
            minHeight: 48,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e', mr: 1 }}>
            {isDiscounted
              ? discountPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
              : price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Typography>
          {isDiscounted && (
            <Typography
              variant="body2"
              sx={{ color: '#888', textDecoration: 'line-through', mr: 1 }}
            >
              {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
          )}
        </Box>
        {/* Star rating and value (placeholder) */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating
            value={averageRating}
            precision={0.1}
            readOnly
            size="small"
            sx={{ color: '#FFD600' }}
          />
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              color: '#222',
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 1,
              px: 1,
              ml: 1,
            }}
          >
            {averageRating.toFixed(1)}
          </Box>
        </Box>
        {/* Brand and categories */}
        <Typography 
          variant="body2" 
          color={theme === THEME.LIGHT ? 'text.secondary' : '#b0b0b0'} 
          sx={{ mb: 1 }}
        >
          {displayBrand} - {categories?.map(cat => cat.name).join(', ') || categoryPath?.join(' / ') || t('uncategorized')}
        </Typography>
        {/* Tags */}
        {(tags || []).length > 0 && (
          <Stack direction="row" spacing={0.5} mb={1} flexWrap="wrap" sx={{ rowGap: 0.75 }}>
            {(tags || []).map(tag => {
              let displayTag = tag;
              let found: CategoryLike | undefined;
              if (allCategories) {
                found = allCategories.find(cat => String(cat.id ?? cat._id) === String(tag));
                if (found) displayTag = found.name;
              }
              return (
                <Chip
                  key={tag}
                  label={displayTag}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: theme === THEME.LIGHT ? '#f1f1f1' : '#333',
                    color: theme === THEME.LIGHT ? '#333' : '#e0e0e0',
                  }}
                />
              );
            })}
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 'auto', width: '100%' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={e => {
              e.stopPropagation();
              handleViewDetailButton();
            }}
            sx={{
              bgcolor: theme === THEME.LIGHT ? 'white' : '#333',
              color: theme === THEME.LIGHT ? '#111a2f' : '#e0e0e0',
              borderColor: theme === THEME.LIGHT ? '#111a2f' : '#555',
              fontWeight: 700,
              borderRadius: 2,
              py: 1,
              textTransform: 'none',
              '&:hover': {
                bgcolor: theme === THEME.LIGHT ? '#111a2f' : '#555',
                color: 'white',
                borderColor: theme === THEME.LIGHT ? '#111a2f' : '#555',
              },
            }}
          >
            View Detail
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCartIcon />}
            onClick={e => {
              e.stopPropagation();
              handleAddToCart();
            }}
            sx={{
              bgcolor: '#111a2f',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 2,
              py: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#222c4c' },
              ...addToCartButtonProps?.sx,
            }}
            {...addToCartButtonProps}
          >
            {addToCartButtonProps?.children || t('addToCart')}
          </Button>
        </Stack>
      </CardContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ProductCard;
