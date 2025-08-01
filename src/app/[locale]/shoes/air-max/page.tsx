"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Container, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Link from "next/link";
import ProductCard from "@/components/card";
import { sortProductsClientSide, convertSortParams } from "@/lib/utils/sortUtils";
import { ApiProduct } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  createdAt?: string;
  tags?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  images?: string[];
}

export default function AirMaxPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const { theme } = useTheme();

  // Function to fix image URLs
  const fixImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '/assets/images/placeholder.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return imageUrl;
    if (imageUrl.toLowerCase().includes('air-max')) return `/assets/images/lib/${imageUrl}`;
    return `/assets/images/${imageUrl}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { apiSortBy, sortOrder } = convertSortParams(sortBy);
        
        const queryParams = new URLSearchParams({
          status: 'active',
          sortBy: apiSortBy,
          sortOrder: sortOrder
        });
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?${queryParams}`);
        const data = await res.json();
        const desiredPath = ['Shoes', 'Nike', 'Air Max'];
        const filtered = (data.data || []).filter((item: ApiProduct) => {
          if (Array.isArray(item.categoryPath)) {
            const isMatch = desiredPath.every((cat, idx) => (item.categoryPath?.[idx] || '').toLowerCase() === cat.toLowerCase());
            if (isMatch) return true;
          }
          if (item.categoryPath && typeof item.categoryPath === 'string') {
            const pathString = item.categoryPath.toLowerCase();
            const desiredString = desiredPath.join('/').toLowerCase();
            if (pathString === desiredString) return true;
          }
          if (item.categories && Array.isArray(item.categories)) {
            const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
            if (categoryNames.includes('air max') || categoryNames.includes('airmax')) return true;
          }
          if (
            item.name.toLowerCase().includes('air max') ||
            item.name.toLowerCase().includes('airmax')
          )
            return true;
          return false;
        });
        
        // Client-side sorting as fallback if API sorting doesn't work
        const sorted = sortProductsClientSide(filtered, sortBy);
        setProducts(sorted);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sortBy]);

  return (
    <Box sx={{ 
      bgcolor: theme === THEME.LIGHT ? '#f8f9fa' : '#000', 
      color: theme === THEME.LIGHT ? '#000' : '#fff',
      minHeight: '80vh', 
      pt: 10, // Add padding top for theme-aware whitespace
      position: 'relative', 
      pb: 12 
    }}>
      {/* Theme-aware whitespace above banner */}
      <Box
        sx={{
          width: '100vw',
          height: 80, // 80px height for whitespace
          mx: 'calc(-50vw + 50%)',
          bgcolor: theme === THEME.LIGHT ? '#f8f9fa' : '#000',
          position: 'relative',
          zIndex: 1,
        }}
      />
      
      {/* Banner */}
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#000',
          overflow: 'hidden',
          p: 0,
          m: 0,
          minHeight: { xs: '320px', md: '400px' },
          maxHeight: '600px',
        }}
      >
        <img
          src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1752489718/image_oh01sx.avif"
          alt="Air Max Banner"
          style={{
            width: '100vw',
            height: '40vw',
            minHeight: '320px',
            maxHeight: '600px',
            objectFit: 'cover',
            display: 'block',
            margin: 0,
            padding: 0,
            filter: 'brightness(0.55)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            px: 2,
            zIndex: 2,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontWeight: 900, letterSpacing: 2, mb: 2, textShadow: '0 2px 16px #000' }}
          >
            NIKE AIR MAX
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, textShadow: '0 2px 8px #000' }}
          >
            Công nghệ đệm khí, phong cách hiện đại.
          </Typography>
        </Box>
      </Box>
      {/* Breadcrumb */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Link
              href="/shoes"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: theme === THEME.LIGHT ? '#000' : '#fff',
                fontWeight: 700,
                marginRight: 2,
              }}
            >
              <span style={{ fontWeight: 700, marginRight: 4 }}>{'< BACK'}</span>
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{ 
                  color: theme === THEME.LIGHT ? '#000' : '#fff', 
                  fontWeight: 400, 
                  fontSize: '1rem', 
                  transition: 'color 0.2s' 
                }}
              >
                Home
              </Typography>
            </Link>
            <Typography component="span" sx={{ color: theme === THEME.LIGHT ? '#000' : '#fff', mx: 0.5 }}>
              /
            </Typography>
            <Link href="/shoes" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{ 
                  color: theme === THEME.LIGHT ? '#000' : '#fff', 
                  fontWeight: 400, 
                  fontSize: '1rem', 
                  transition: 'color 0.2s' 
                }}
              >
                Shoes
              </Typography>
            </Link>
            <Typography component="span" sx={{ color: theme === THEME.LIGHT ? '#000' : '#fff', mx: 0.5 }}>
              /
            </Typography>
            <Typography
              component="span"
              sx={{
                color: theme === THEME.LIGHT ? '#000' : '#fff',
                fontWeight: 500,
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                fontSize: '1rem',
              }}
            >
              Air Max
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1" sx={{ 
              fontWeight: 'bold', 
              mb: 0,
              color: theme === THEME.LIGHT ? '#000' : '#fff'
            }}>
              NIKE AIR MAX
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme === THEME.LIGHT ? '#000' : '#fff', 
              fontWeight: 400, 
              ml: 1 
            }}>
              [{products.length}]
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Filter Bar */}
      <Container
        maxWidth="lg"
        sx={{ mb: 3, position: 'relative', zIndex: 2, mt: 6, px: { xs: 1, md: 4 } }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <FormControl sx={{ 
            minWidth: 200,
            '& .MuiInputLabel-root': {
              color: theme === THEME.LIGHT ? '#666' : '#ccc',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme === THEME.LIGHT ? '#ddd' : '#444',
              },
              '&:hover fieldset': {
                borderColor: theme === THEME.LIGHT ? '#999' : '#666',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme === THEME.LIGHT ? '#1976d2' : '#90caf9',
              },
            },
            '& .MuiSelect-select': {
              color: theme === THEME.LIGHT ? '#000' : '#fff',
            },
          }}>
            <InputLabel>Sort By</InputLabel>
            <Select 
              value={sortBy} 
              label="Sort By" 
              onChange={e => setSortBy(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: theme === THEME.LIGHT ? '#fff' : '#1a1a1a',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        bgcolor: theme === THEME.LIGHT ? '#f5f5f5' : '#333',
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* Product List */}
        <Box display="flex" flexWrap="wrap" gap={6} justifyContent="center" alignItems="stretch">
          {loading ? (
            <Typography
              variant="h6"
              sx={{ 
                color: theme === THEME.LIGHT ? '#666' : '#ccc', 
                textAlign: 'center', 
                width: '100%' 
              }}
            >
              Loading...
            </Typography>
          ) : products.length > 0 ? (
            products.map(product => (
              <Box
                key={product._id}
                flex="1 1 320px"
                maxWidth={320}
                minWidth={260}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  m: 0,
                }}
              >
                <ProductCard
                  _id={product._id}
                  productId={product._id}
                  name={product.name}
                  image={fixImageUrl(product.images?.[0] || '')}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  tags={product.tags}
                  brand={product.brand}
                  categories={product.categories}
                />
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
              <Typography variant="h5" sx={{ 
                color: theme === THEME.LIGHT ? '#666' : '#ccc', 
                mb: 2 
              }}>
                Không tìm thấy sản phẩm Air Max
              </Typography>
              <Typography variant="body1" sx={{ 
                color: theme === THEME.LIGHT ? '#666' : '#ccc' 
              }}>
                Sản phẩm có thể đang được cập nhật hoặc tạm thời không có sẵn.
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
