'use client';

import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Chip,
} from '@mui/material';

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  price,
  discountPrice,
  tags = [],
  brand,
  categories = [],
  onAddToCart,
}) => {
  const isDiscounted = discountPrice !== undefined && discountPrice < price;

  return (
    <Card
      sx={{
        maxWidth: 280,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="280"
          image={image}
          alt={name}
          sx={{ objectFit: 'cover' }}
        />
        {isDiscounted && (
          <Chip
            label="Sale"
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontWeight: 'bold',
              fontSize: 12,
              paddingX: 1,
            }}
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2 }}
          noWrap
          title={name}
        >
          {name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          {isDiscounted ? (
            <>
              <Typography
                variant="body1"
                color="error"
                sx={{ fontWeight: 'bold' }}
              >
                {discountPrice?.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {price?.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </Typography>
            </>
          ) : (
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ fontWeight: 'bold' }}
            >
              {price?.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </Typography>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {brand?.name || 'Unknown Brand'} - {categories?.map(cat => cat.name).join(', ') || 'Uncategorized'}
        </Typography>

        {tags.length > 0 && (
          <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: '#f1f1f1',
                  color: '#333',
                }}
              />
            ))}
          </Stack>
        )}
      </CardContent>

      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            '&:hover': { backgroundColor: '#333' },
          }}
          onClick={onAddToCart}
        >
          Thêm vào giỏ
        </Button>
      </Box>
    </Card>
  );
};

export default ProductCard;
