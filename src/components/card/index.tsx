'use client';

import React, { useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import { useTranslations } from 'next-intl';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { ProductLabel } from '@/types/components/label';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

// Thêm type cho category hỗ trợ cả id và _id
export type CategoryLike = { id?: string; _id?: string; name: string };

interface ProductCardProps {
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
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  price,
  discountPrice,
  tags,
  brand,
  categories,
  onAddToCart,
  allCategories,
  allBrands,
  productId,
  backgroundColor = '#ffffff',
  colors = 1,
}) => {
  const t = useTranslations('productCard');
  const cardRef = useRef<HTMLDivElement>(null);
  const isDiscounted = discountPrice !== undefined && discountPrice < price;

  // Kiểm tra xem có phải ảnh trong lib không
  const isLibImage = image.includes('/assets/images/lib/');

  // GSAP Animation cho entrance effect (luôn áp dụng cho mọi card)
  useEffect(() => {
    if (cardRef.current) {
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
  }, []);

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

  // Render giao diện khác nhau cho ảnh lib và ảnh thường
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
              background: '#2f2f30',
              color: '#fff',
              width: 48,
              height: 48,
              zIndex: 3,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.3s, transform 0.4s cubic-bezier(.4,2,.6,1)',
              '&:hover': {
                background: '#5e5091',
              },
            }}
            onClick={onAddToCart}
          >
            <ShoppingCartIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Card>
      </motion.div>
    );
  }

  // Card thường: ảnh để thẳng, hover chỉ phóng nhẹ
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
          pt: 0,
          pb: 3,
          px: 2,
          position: 'relative',
          overflow: 'visible',
          minWidth: 260,
          maxWidth: 300,
          minHeight: 350,
          maxHeight: 400,
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
              transform: 'scale(1.08)', // chỉ phóng nhẹ, không nghiêng
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.12))',
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
        {/* Ảnh sản phẩm để thẳng, lấp đầy chiều ngang, crop dọc, KHÔNG absolute */}
        <Box
          sx={{
            width: '100%',
            height: 140,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            pointerEvents: 'none',
            overflow: 'hidden',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
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
              objectFit: 'cover', // lấp đầy ngang, crop dọc
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.12))',
              display: 'block',
              background: 'none',
              transition: 'filter 0.4s cubic-bezier(.4,2,.6,1)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
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
            transform: 'translateY(50px)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(30px)',
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
            background: '#2f2f30',
            color: '#fff',
            width: 48,
            height: 48,
            zIndex: 3,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.3s, transform 0.4s cubic-bezier(.4,2,.6,1)',
            '&:hover': {
              background: '#5e5091',
            },
          }}
          onClick={onAddToCart}
        >
          <ShoppingCartIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
