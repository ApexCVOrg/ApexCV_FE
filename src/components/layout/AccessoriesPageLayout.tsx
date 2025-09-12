"use client";
import React, { useEffect, useState } from "react";
import { Box, Container, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Link } from "@mui/material";
import ProductCard from "@/components/card";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useLocale } from 'next-intl';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  categoryPath?: string[];
  createdAt: string;
}

interface AccessoriesPageLayoutProps {
  pageTitle: string;
  category: string;
  bannerImage?: string;
  bannerAlt?: string;
  fetchProducts: (sortBy: string, gender?: string) => Promise<Product[]>;
  emptyMessage: string;
  tabs?: Array<{ label: string; value: string; image: string }>;
}

export default function AccessoriesPageLayout({
  pageTitle,
  category,
  bannerImage = "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753088737/45356_sn4l7p.webp",
  bannerAlt = "Accessories Collection Banner",
  fetchProducts,
  emptyMessage,
  tabs = []
}: AccessoriesPageLayoutProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [gender, setGender] = useState('all');
  const [productCount, setProductCount] = useState(0);
  const locale = useLocale();
  const { theme } = useTheme();

  // Get current tab from URL path
  const currentTab = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '';

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProducts = await fetchProducts(sortBy, gender);
        setProducts(fetchedProducts);
        setProductCount(fetchedProducts.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchProducts, sortBy, gender]);

  return (
      <Box sx={{ 
      minHeight: '100vh', 
      pt: 10, // Changed from mt: 10 to pt: 10 to eliminate whitespace
      position: 'relative',
      bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
      color: theme === THEME.LIGHT ? '#000' : '#fff',
    }}>
      {/* Banner background with overlay - below header */}
      <Box
        sx={{
          width: '100vw',
        height: 400, 
          mx: 'calc(-50vw + 50%)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: theme === THEME.LIGHT ? '#fff' : '#000', // Theme background for whitespace
        }}
      >
        <img 
          src={bannerImage} 
          alt={bannerAlt} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }} 
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.45)',
            zIndex: 2,
          }}
        />
        {/* Breadcrumb and heading over banner, above overlay */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 3,
            width: '100%',
            maxWidth: '1600px',
            mx: 'auto',
            px: { xs: 2, md: 6 },
          }}
        >
          <Box sx={{ pt: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Link
                href="/accessories"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  marginRight: 2,
                }}
              >
                <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5, color: '#fff' }} /> BACK
            </Link>
            <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
                <Typography
                  component="span"
                  sx={{
                    color: '#fff',
                    fontWeight: 400,
                    fontSize: '1rem',
                    transition: 'color 0.2s',
                  }}
                >
                  Home
                </Typography>
            </Link>
              <Typography component="span" sx={{ color: '#fff', mx: 0.5 }}>
                /
              </Typography>
            <Link href="/accessories" style={{ textDecoration: 'none' }}>
                <Typography
                  component="span"
                  sx={{
                    color: '#fff',
                    fontWeight: 400,
                    fontSize: '1rem',
                    transition: 'color 0.2s',
                  }}
                >
                  Accessories
                </Typography>
            </Link>
              <Typography component="span" sx={{ color: '#fff', mx: 0.5 }}>
                /
              </Typography>
              <Typography
                component="span"
                sx={{
                  color: '#fff',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  fontSize: '1rem',
                }}
              >
                {category}
              </Typography>
          </Box>
            {/* Heading & description */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 'bold', mb: 0, color: '#fff' }}
              >
              {pageTitle}
            </Typography>
            {productCount > 0 && (
                <Typography variant="body2" sx={{ color: 'grey.300', fontWeight: 400, ml: 1 }}>
                [{productCount}]
              </Typography>
            )}
            </Box>
          </Box>
          </Box>
        </Box>
        
        {/* Tab Card Navigation */}
        {tabs.length > 0 && (
        <Container maxWidth="xl" sx={{ mb: 4, mt: -8, position: 'relative', zIndex: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 2, md: 3 }, 
              justifyContent: 'center', 
              alignItems: 'flex-end', 
              pb: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              px: { xs: 1, sm: 2 }
            }}>
              {tabs.map(tab => (
                <Link key={tab.value} href={`/accessories/${tab.value}`} style={{ textDecoration: 'none' }} sx={{ flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 200px' } }}>
                  <Box sx={{
                    border: 0,
                  borderBottom: tab.value === currentTab ? `4px solid ${theme === THEME.LIGHT ? '#000' : '#fff'}` : 'none',
                  bgcolor: tab.value === currentTab ? (theme === THEME.LIGHT ? '#000' : '#fff') : (theme === THEME.LIGHT ? '#fff' : '#1a1a1a'),
                  color: tab.value === currentTab ? (theme === THEME.LIGHT ? '#fff' : '#000') : (theme === THEME.LIGHT ? '#111' : '#fff'),
                    fontWeight: tab.value === currentTab ? 700 : 500,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    p: 0,
                    pb: 0,
                    minWidth: { xs: 140, sm: 160, md: 180 },
                    maxWidth: { xs: 200, sm: 220, md: 240 },
                    mx: { xs: 0.5, sm: 1 },
                    borderRadius: { xs: 1, sm: 2 },
                    overflow: 'hidden',
                    boxShadow: tab.value === currentTab ? '0 8px 32px rgba(0,0,0,0.15)' : '0 4px 16px rgba(0,0,0,0.08)',
                    '&:hover': {
                    borderBottom: `4px solid ${theme === THEME.LIGHT ? '#000' : '#fff'}`,
                    bgcolor: tab.value === currentTab ? (theme === THEME.LIGHT ? '#000' : '#fff') : (theme === THEME.LIGHT ? '#f5f5f5' : '#333'),
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                      fontWeight: 700,
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: { xs: 120, sm: 140, md: 160 }, 
                      overflow: 'hidden', 
                      borderRadius: 0,
                      position: 'relative'
                    }}>
                      <img 
                        src={tab.image} 
                        alt={tab.label} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }} 
                      />
                    </Box>
                    <Typography sx={{ 
                      py: { xs: 1.5, sm: 2 }, 
                      fontWeight: tab.value === currentTab ? 700 : 600, 
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, 
                      letterSpacing: { xs: 0.5, sm: 1 }, 
                    bgcolor: tab.value === currentTab ? (theme === THEME.LIGHT ? '#000' : '#fff') : (theme === THEME.LIGHT ? '#fff' : '#1a1a1a'), 
                    color: tab.value === currentTab ? (theme === THEME.LIGHT ? '#fff' : '#000') : (theme === THEME.LIGHT ? '#111' : '#fff'), 
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease'
                    }}>
                      {tab.label}
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Box>
          </Container>
        )}
      
      {/* Sort Bar */}
      <Box
        sx={{
          mb: 2,
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          mt: 5,
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: '1600px',
          width: '100%',
          bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
        }}
      >
        <FormControl 
          sx={{ 
            minWidth: 150,
            mr: 2,
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
          }}
        >
            <InputLabel>Gender</InputLabel>
            <Select 
              value={gender} 
              label="Gender" 
              onChange={(e) => setGender(e.target.value)}
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
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="men">Men</MenuItem>
              <MenuItem value="women">Women</MenuItem>
            </Select>
          </FormControl>
        <FormControl 
          sx={{ 
            minWidth: 200, 
            mr: { xs: 3, sm: 6, md: 8 },
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
          }}
        >
            <InputLabel>Sort By</InputLabel>
            <Select 
              value={sortBy} 
              label="Sort By" 
              onChange={(e) => setSortBy(e.target.value)}
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
        
      {/* Product Grid */}
      <Container
        maxWidth={false}
        sx={{ 
          py: 4, 
          px: { xs: 2, sm: 3, md: 4 }, 
          maxWidth: '1600px', 
          width: '100%',
          bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
        }}
      >
        {error && (
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center', 
              color: 'error.main', 
              py: 2,
              bgcolor: theme === THEME.LIGHT ? '#ffebee' : '#3d1f1f',
              borderRadius: 1,
              px: 2,
            }}
          >
            {error}
          </Typography>
        )}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <CircularProgress sx={{ color: theme === THEME.LIGHT ? '#1976d2' : '#90caf9' }} />
          </Box>
        ) : (
          <>
            {products.length === 0 && (
              <Typography 
                variant="body1" 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: theme === THEME.LIGHT ? '#666' : '#ccc',
                  fontSize: '1.1rem',
                }}
              >
                {emptyMessage}
              </Typography>
            )}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: { xs: 2, sm: 3 },
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {products.map(product => (
                <Box
                  key={product._id}
                  sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                <ProductCard
                  _id={product._id}
                  productId={product._id}
                  name={product.name}
                  image={(() => {
                    // If image is a full URL (starts with http/https), use it directly
                    if (product.images?.[0]?.startsWith('http')) {
                      return product.images[0];
                    }
                    // If image is a local path, construct the path
                    if (product.images?.[0]) {
                      return `/assets/images/accessories/${category.toLowerCase()}/${product.images[0]}`;
                    }
                    return "/assets/images/placeholder.jpg";
                  })()}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  tags={product.tags}
                  brand={product.brand}
                  categories={product.categories}
                  categoryPath={product.categoryPath}
                />
              </Box>
            ))}
          </Box>
          </>
        )}
      </Container>
    </Box>
  );
} 