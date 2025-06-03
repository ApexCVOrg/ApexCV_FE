'use client';

import React from 'react';
import { ProductInfo } from '../../../../components/layout/TeamLayout';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

const products: ProductInfo[] = [
  {
    name: "Arsenal 25/26 Home Authentic Jersey",
    price: "3,000,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/6b8e2e2b7e2b4e1e8c8eafc800b6b6b2_9366/arsenal-25-26-home-authentic-jersey.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Arsenal 25/26 Home Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/7c8e2e2b7e2b4e1e8c8eafc800b6b6b2_9366/arsenal-25-26-home-jersey.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Arsenal 25/26 Home Jersey Kids",
    price: "1,500,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/8d8e2e2b7e2b4e1e8c8eafc800b6b6b2_9366/arsenal-25-26-home-jersey-kids.jpg",
    desc: "Kids Football - New",
  },
  {
    name: "Arsenal 25/26 Home Shorts",
    price: "1,100,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2c14518390e74640881e110fdf13ce5e_9366/arsenal-25-26-home-shorts.jpg",
    desc: "Men Football - New",
  },
];

export default function ArsenalPage() {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 2,
        maxWidth: 1200,
        width: '100%',
        alignItems: 'stretch',
      }}>
        {products.map((item, idx) => (
          <Card
            key={idx}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
              }
            }}
          >
            <CardMedia
              component="img"
              height={260}
              image={item.image}
              alt={item.name}
              sx={{
                objectFit: 'cover',
                bgcolor: '#f5f5f5'
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {item.price}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.desc}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
} 