'use client';

import React from 'react';
import { Box, Card, CardMedia, CardContent, Typography } from '@mui/material';
import { ProductInfo } from '../../../../components/layout/TeamLayout';

const products: ProductInfo[] = [
  {
    name: "Juventus Kids 25/26 Home Authentic Jersey",
    price: "2,500,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/b4e7e2f40aa64a1f92a8132a6c81b574_9366/juventus-25-26-home-authentic-jersey-kids.jpg",
    desc: "Kids Football - New",
  },
  {
    name: "Juventus Kids 25/26 Home Jersey",
    price: "1,800,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/e86b3148bca44d478e0bc4bd6fea586f_9366/juventus-25-26-home-jersey-kids.jpg",
    desc: "Kids Football - New",
  },
  {
    name: "Juventus Kids 25/26 Home Shorts",
    price: "900,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2c14518390e74640881e110fdf13ce5e_9366/juventus-25-26-home-shorts-kids.jpg",
    desc: "Kids Football - New",
  },
  {
    name: "Juventus Kids 25/26 Home Socks",
    price: "600,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2c14518390e74640881e110fdf13ce5e_9366/juventus-25-26-home-shorts-kids.jpg",
    desc: "Kids Football - New",
  },
];

export default function JuventusPage() {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 3,
        alignItems: 'stretch',
      }}>
        {products.map((item, idx) => (
          <Card 
            key={idx}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardMedia
              component="img"
              image={item.image}
              alt={item.name}
              sx={{ 
                objectFit: 'contain',
                bgcolor: '#f5f5f5',
                p: 2,
                height: 250,
              }}
            />
            <CardContent sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700,
                color: 'primary.main'
              }}>
                {item.price}
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 500,
                minHeight: '3em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
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