'use client';

import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import { useTranslations } from 'next-intl';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { PRODUCT_LABELS, ProductLabel } from '@/types/components/label';

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
  labels,
  allCategories,
  allBrands,
  productId,
}) => {
  const t = useTranslations('productCard');
  const isDiscounted = discountPrice !== undefined && discountPrice < price;
  const displayLabels = labels?.filter(l => l !== 'sale') || [];

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

  // Debug logs
  if (typeof window !== 'undefined') {
    console.log('ProductCard tags:', tags);
    console.log('ProductCard allCategories:', allCategories);
  }

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
            width: '100%',
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
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={onAddToCart}
          sx={{ mt: 'auto', width: '100%', bgcolor: '#111a2f', color: '#fff', fontWeight: 700, borderRadius: 2, py: 1, '&:hover': { bgcolor: '#222c4c' } }}
        >
          {t('addToCart')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
