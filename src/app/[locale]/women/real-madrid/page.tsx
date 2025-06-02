'use client';

import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

const products = [
  {
    name: "Real Madrid Women 25/26 Home Authentic Jersey",
    price: "3,000,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/b4e7e2f40aa64a1f92a8132a6c81b574_9366/real-madrid-25-26-home-authentic-jersey.jpg",
    desc: "Women Football - New",
  },
  {
    name: "Real Madrid Women 25/26 Home Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/e86b3148bca44d478e0bc4bd6fea586f_9366/real-madrid-25-26-home-jersey.jpg",
    desc: "Women Football - New",
  },
  {
    name: "Real Madrid Women 25/26 Home Shorts",
    price: "1,100,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2c14518390e74640881e110fdf13ce5e_9366/real-madrid-25-26-home-shorts.jpg",
    desc: "Women Football - New",
  },
  {
    name: "Real Madrid Women 25/26 Home Socks",
    price: "800,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2c14518390e74640881e110fdf13ce5e_9366/real-madrid-25-26-home-shorts.jpg",
    desc: "Women Football - New",
  },
];

export default function RealMadridPage() {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {products.map((item, idx) => (
          <Grid key={idx} sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <Card 
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 