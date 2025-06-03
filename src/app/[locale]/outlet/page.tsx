'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import Link from 'next/link';


const mockProducts = [
  {
    name: 'Áo Thun Nam',
    image: '',
    price: '299.000đ',
  },
  {
    name: 'Giày Thể Thao',
    image: '/images/giay.jpg',
    price: '799.000đ',
  },
  // ... thêm sản phẩm mẫu
];

const categories = [
  {
    name: 'NAM',
    image: '/images/outlet-men.jpg',
    href: '/outlet/men',
  },
  {
    name: 'NỮ',
    image: '/images/outlet-women.jpg',
    href: '/outlet/women',
  },
  {
    name: 'TRẺ EM',
    image: '/images/outlet-kids.jpg',
    href: '/outlet/kids',
  },
  {
    name: 'SHOP SHOES',
    image: '/images/outlet-shoes.jpg',
    href: '/outlet/men-shoes', // hoặc route phù hợp
  },
  {
    name: 'SIZE CUỐI: GIẢM ĐẾN 40%',
    image: '/images/outlet-sale.jpg',
    href: '/outlet/last-size', // hoặc route phù hợp
  },
];

export default function OutletPage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Typography variant="h3" fontWeight={700} mb={4}>
        OUTLET
      </Typography>
      <Typography variant="subtitle1" mb={4}>
        Săn sale cực sốc các sản phẩm chính hãng với giá tốt nhất!
      </Typography>
      <Grid container spacing={2} mb={4}>
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={2.4} key={cat.name}>
            <Card
              component={Link}
              href={cat.href}
              sx={{
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: 0,
                border: '1px solid #eee',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4 }
              }}
            >
              <CardMedia
                component="img"
                height="120"
                image={cat.image}
                alt={cat.name}
              />
              <CardContent sx={{ bgcolor: '#f5f8fa', minHeight: 70 }}>
                <Typography
                  fontWeight={700}
                  sx={{ textDecoration: 'underline', fontSize: 18 }}
                >
                  {cat.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        {mockProducts.map((product, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardMedia
                component="img"
                height="180"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  {product.name}
                </Typography>
                <Typography color="text.secondary">{product.price}</Typography>
                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
