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

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: {
    _id: string;
    name: string;
  };
  categories: { 
    _id: string; 
    name: string;
    parentCategory?: {
      _id: string;
      name: string;
      parentCategory?: {
        _id: string;
        name: string;
      };
    };
  }[];
  onAddToCart: () => void;
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
}) => {
  const t = useTranslations();
  const isDiscounted = discountPrice && discountPrice < price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart();
  };

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
            label={t('productCard.sale')}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
            }}
          />
        )}
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          {brand?.name || t('productCard.unknownBrand')} - {categories?.map(cat => {
            const pathParts = [];
            if (cat.parentCategory?.parentCategory?.name) {
              pathParts.push(cat.parentCategory.parentCategory.name);
            }
            if (cat.parentCategory?.name) {
              pathParts.push(cat.parentCategory.name);
            }
            if (cat.name) {
              pathParts.push(cat.name);
            }
            return pathParts.join(' > ');
          }).join(', ') || t('productCard.uncategorized')}
        </Typography>
        {tags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Stack>
        )}
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
          sx={{ mt: 'auto' }}
        >
          {t('productCard.addToCart')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
