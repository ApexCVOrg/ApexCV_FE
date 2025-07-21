"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import Link from "next/link";
import ProductCard from "@/components/card";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  createdAt: string;
}

const ACCESSORIES_CATEGORIES = [
  {
    name: "MEN",
    image: "/assets/images/accessories/men-accessories.jpg",
    href: "men",
    description: "Accessories for men"
  },
  {
    name: "WOMEN", 
    image: "/assets/images/accessories/women-accessories.jpg",
    href: "women",
    description: "Accessories for women"
  },
  {
    name: "KIDS",
    image: "/assets/images/accessories/kids-accessories.jpg", 
    href: "kids",
    description: "Accessories for kids"
  }
];

export default function AccessoriesPage() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", mt: 10, position: 'relative' }}>
      {/* Banner ở phía sau */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '100vh', 
        zIndex: 1 
      }}>
        <img 
          src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1752659630/SMP-apparel-accessories-banner_ikwyiy.jpg" 
          alt="Accessories Banner" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            filter: 'brightness(0.7) blur(2px)'
          }} 
        />
      </Box>
      
      {/* Breadcrumb và navigation ở phía trên banner */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Breadcrumb */}
        <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff', fontWeight: 700, marginRight: 2 }}>
              <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5, color: '#fff' }} /> BACK
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={{ color: '#fff', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
            </Link>
            <Typography component="span" sx={{ color: '#fff', mx: 0.5 }}>/</Typography>
            <Typography component="span" sx={{ color: '#fff', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Accessories</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0, color: '#fff' }}>
              ACCESSORIES
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Accessories Categories */}
      <Container maxWidth="lg" sx={{ mb: 3, position: 'relative', zIndex: 2, mt: 6, px: { xs: 1, md: 4 } }}>
        {/* Categories Grid */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={4}
          justifyContent="center"
          alignItems="stretch"
          sx={{ mt: 8 }}
        >
          {ACCESSORIES_CATEGORIES.map((category) => (
            <Box
              key={category.href}
              sx={{
                minWidth: 280,
                maxWidth: 280,
                flex: '0 0 auto',
                display: 'flex',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  transition: 'all 0.3s ease',
                  zIndex: 1,
                },
              }}
            >
              <Link href={`/accessories/${category.href}`} style={{ textDecoration: 'none', width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 320,
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
                    transition: 'box-shadow 0.3s',
                    bgcolor: '#fff',
                    '&:hover': {
                      boxShadow: '0 8px 32px 0 rgba(0,0,0,0.16)',
                    },
                  }}
                >
                  {/* Background Image */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '70%',
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      position: 'relative',
                    }}
                  />
                  {/* Text Section */}
                  <Box
                    sx={{
                      height: '30%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: category.name === 'MEN' ? '#000' : '#fff',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: category.name === 'MEN' ? '#fff' : '#000',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Box>
                </Box>
              </Link>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
} 