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
import { useTranslations } from 'next-intl';
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

  return (
    <Card sx={{ 
      maxWidth: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        boxShadow: 6,
      },
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="300"
          image={image}
          alt={name}
          sx={{ objectFit: 'cover' }}
        />
        {isDiscounted && (
          <Chip
            label={t('sale')}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontWeight: 'bold',
              fontSize: 12,
              paddingX: 1,
              zIndex: 2,
            }}
          />
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
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
            height: '3.6em',
            lineHeight: '1.2em',
          }}
        >
          {name}
        </Typography>
        <Box sx={{ mb: 1 }}>
          {isDiscounted ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="h6"
                color="error"
                sx={{ fontWeight: 'bold' }}
              >
                {discountPrice.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
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
              sx={{ fontWeight: 'bold' }}
            >
              {price.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </Typography>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {displayBrand} - {categories?.map(cat => cat.name).join(', ') || t('uncategorized')}
        </Typography>
        {(tags || []).length > 0 && (
          <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
            {(tags || []).map((tag) => {
              let displayTag = tag;
              let found: CategoryLike | undefined;
              if (allCategories) {
                found = allCategories.find(cat => String(cat.id ?? cat._id) === String(tag));
                if (found) displayTag = found.name;
              }
              if (typeof window !== 'undefined') {
                console.log('tag:', tag, 'found:', found, 'displayTag:', displayTag);
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
                  }}
                />
              );
            })}
          </Stack>
        )}
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={onAddToCart}
          sx={{ mt: 'auto' }}
        >
          {t('addToCart')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
