'use client';

import React, { useEffect, useRef } from 'react';
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
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import { useTranslations } from 'next-intl';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { PRODUCT_LABELS, ProductLabel } from '@/types/components/label';
 
import { useAuthContext } from '@/context/AuthContext';
import api from '@/services/api';
import { useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

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
  onAddToCart?: () => void;
  labels?: ProductLabel[];
  allCategories?: CategoryLike[];
  allBrands?: { _id: string; name: string }[];
  productId: string;
  backgroundColor?: string; // Thêm background color như Nike project
  colors?: number; // Số lượng màu sắc
  addToCartButtonProps?: React.ComponentProps<typeof Button>;
}

const ProductCard: React.FC<ProductCardProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _id,
  name,
  image,
  price,
  discountPrice,
  tags,
  brand,
  categories,
  labels,
  allCategories,
  allBrands,
  productId,
  backgroundColor = '#ffffff',
  colors = 1,
  addToCartButtonProps,
}) => {
  const t = useTranslations('productCard');
  const cardRef = useRef<HTMLDivElement>(null);
  const isDiscounted = discountPrice !== undefined && discountPrice < price;
  const displayLabels = labels?.filter(l => l !== 'sale') || [];

  // Kiểm tra xem có phải ảnh trong lib không
  const isLibImage = image.includes('/assets/images/lib/');

  // GSAP Animation cho entrance effect (chỉ cho lib images)
  useEffect(() => {
    if (isLibImage && cardRef.current) {
      gsap.fromTo(cardRef.current, 
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
          ease: "elastic.out(1,0.3)",
          delay: Math.random() * 0.3, // Stagger effect
        }
      );
    }
  }, [isLibImage]);

  // Debug logs
  if (typeof window !== 'undefined') {
    console.log('ProductCard tags:', tags);
    console.log('ProductCard allCategories:', allCategories);
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

  const { token } = useAuthContext();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "warning" | "error" }>({ open: false, message: "", severity: "success" });

  const handleAddToCart = async () => {
    if (!token) {
      setSnackbar({ open: true, message: t('loginToViewCart') || 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', severity: 'warning' });
      return;
    }
    try {
      await api.post('/carts/add', { productId });
      setSnackbar({ open: true, message: t('addToCartSuccess') || 'Đã thêm vào giỏ hàng!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: t('addToCartError') || 'Thêm vào giỏ hàng thất bại!', severity: 'error' });
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
          sx={{ 
            borderRadius: '24px',
            background: backgroundColor,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
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
            '&:hover': {
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.16)',
              '.cart-btn': {
                opacity: 1,
                pointerEvents: 'auto',
              },
              '.product-image': {
                transform: 'translateX(-50%) rotate(-15deg) scale(1.65)',
                filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.18))',
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
          >
            <FavoriteButton
              productId={productId}
              size="small"
              color="error"
              showTooltip={true}
            />
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
              transition: 'transform 0.4s cubic-bezier(.4,2,.6,1), filter 0.4s cubic-bezier(.4,2,.6,1)',
            }}
            className="product-image"
          >
            <img
              src={image}
              alt={name}
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
              background: 'linear-gradient(transparent, rgba(255,255,255,0.9) 20%, white)',
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
                  color: 'black',
                  fontSize: '14px',
                }}
              >
                {name}
              </Typography>

              {/* Colors Info */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
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
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ color: '#FFD600', fontSize: 20, mr: 0.2 }} />
                ))}
                <Box sx={{ bgcolor: '#f5f5f5', color: '#222', fontWeight: 600, fontSize: 14, borderRadius: 1, px: 1, ml: 1 }}>
                  5.0
                </Box>
              </Box>

              {/* Brand and Categories */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '12px',
                  marginBottom: 1,
                }}
              >
                {displayBrand} - {categories?.map(cat => cat.name).join(', ') || t('uncategorized')}
              </Typography>

              {/* Tags */}
              {(tags || []).length > 0 && (
                <Stack direction="row" spacing={0.5} mb={2} flexWrap="wrap">
                  {(tags || []).map((tag) => {
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
                          backgroundColor: '#f1f1f1',
                          color: '#333',
                          fontSize: '10px',
                          height: '20px',
                        }}
                      />
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Box>

          {/* Icon giỏ hàng ẩn, hover card mới hiện ra */}
          <IconButton
            className="cart-btn"
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%) translateY(20px)',
              background: '#1976d2',
              color: '#fff',
              width: 48,
              height: 48,
              zIndex: 3,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.3s, transform 0.4s cubic-bezier(.4,2,.6,1)',
              '&:hover': {
                background: '#1565c0',
              },
            }}
            onClick={handleAddToCart}
          >
            <ShoppingCartIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Card>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    );
  }

  // Nếu không phải ảnh lib, render card style đơn giản
  return (
    <Card sx={{
      maxWidth: 320,
      borderRadius: 4,
      boxShadow: 2,
      p: 1.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#fff',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 6 },
    }}>
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
        >
          <FavoriteButton
            productId={productId}
            size="small"
            color="error"
            showTooltip={true}
          />
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
                top: 12 + (isDiscounted ? (idx + 1) : idx) * 32,
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
      <CardContent sx={{ width: '100%', p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography
          gutterBottom
          variant="subtitle1"
          component="h3"
          sx={{ fontWeight: 600, mb: 1, color: '#222', minHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e', mr: 1 }}>
            {isDiscounted ? discountPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Typography>
          {isDiscounted && (
            <Typography variant="body2" sx={{ color: '#888', textDecoration: 'line-through', mr: 1 }}>
              {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
          )}
        </Box>
        {/* Star rating and value (placeholder) */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} sx={{ color: '#FFD600', fontSize: 20, mr: 0.2 }} />
          ))}
          <Box sx={{ bgcolor: '#f5f5f5', color: '#222', fontWeight: 600, fontSize: 14, borderRadius: 1, px: 1, ml: 1 }}>
            5.0
          </Box>
        </Box>
        {/* Brand and categories */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {displayBrand} - {categories?.map(cat => cat.name).join(', ') || t('uncategorized')}
        </Typography>
        {/* Tags */}
        {(tags || []).length > 0 && (
          <Stack direction="row" spacing={0.5} mb={1} flexWrap="wrap" sx={{ rowGap: 0.75 }}>
            {(tags || []).map((tag) => {
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
                  sx={{ fontWeight: 600, textTransform: 'uppercase', backgroundColor: '#f1f1f1', color: '#333' }}
                />
              );
            })}
          </Stack>
        )}
        <Button
          variant={addToCartButtonProps?.variant || 'contained'}
          startIcon={addToCartButtonProps?.startIcon || <ShoppingCartIcon />}
          onClick={handleAddToCart}
          sx={{
            mt: 'auto',
            width: '100%',
            bgcolor: '#111a2f',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 2,
            py: 1,
            textTransform: 'none',
            '&:hover': { bgcolor: '#222c4c' },
            ...addToCartButtonProps?.sx, // đặt cuối cùng để props có thể override
          }}
          {...addToCartButtonProps}
        >
          {addToCartButtonProps?.children || t('addToCart')}
        </Button>
      </CardContent>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ProductCard;