'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import ProductCard from '@/components/card';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useParams, usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';
import api from '@/services/api';

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

interface ShoesPageLayoutProps {
  pageTitle: string;
  pageDescription?: string;
  category: string;
  bannerImage?: string;
  bannerAlt?: string;
  fetchProducts: (sortBy: string) => Promise<Product[]>;
  emptyMessage: string;
  tabs?: Array<{ label: string; value: string; image: string }>;
}

export default function ShoesPageLayout({
  pageTitle,
  category,
  bannerImage = 'https://res.cloudinary.com/dqmb4e2et/image/upload/v1752376328/originals_ss25_the_original_introduce_plp_the_original_iwp_background_media_d_79a5b46e37_lwnind.avif',
  bannerAlt = 'Shoes Collection Banner',
  fetchProducts,
  emptyMessage,
  tabs = [],
}: ShoesPageLayoutProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});
  const { locale } = useParams();
  const pathname = usePathname();
  const productCount = products.length;
  const { theme } = useTheme();

  // Get current tab from pathname
  const currentTab = pathname.split('/').pop() || '';

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProducts = await fetchProducts(sortBy);
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [sortBy, fetchProducts]);

  useEffect(() => {
    const fetchAverages = async () => {
      const ratings: Record<string, number> = {};
      await Promise.all(products.map(async (product) => {
        try {
          const res = await api.get(`/reviews/average/${product._id}`);
          const data = res.data as { average: number };
          ratings[product._id] = data.average || 0;
        } catch {
          ratings[product._id] = 0;
        }
      }));
      setAverageRatings(ratings);
    };
    if (products.length > 0) fetchAverages();
  }, [products]);

  return (
    <Box sx={{ 
      bgcolor: theme === THEME.LIGHT ? '#f8f9fa' : '#000', 
      minHeight: '100vh', 
      position: 'relative',
      color: theme === THEME.LIGHT ? '#000' : '#fff',
      width: '100%',
      pt: 9, // Increased padding top to ensure no whitespace
    }}>
      {/* Banner ở phía sau */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          zIndex: 1,
          mt: -9, // Compensate for the padding top
          bgcolor: theme === THEME.LIGHT ? '#f8f9fa' : '#000', // Ensure banner area has theme background
        }}
      >
        <img
          src={bannerImage}
          alt={bannerAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Breadcrumb và navigation ở phía trên banner */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Breadcrumb */}
        <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Link
              href="/shoes"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                marginRight: 2,
              }}
            >
              <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5 }} /> BACK
            </Link>
            <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
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
                color: theme === THEME.LIGHT ? 'text.primary' : '#fff',
                fontWeight: 500,
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                fontSize: '1rem',
              }}
            >
              {category}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 0,
                color: theme === THEME.LIGHT ? '#000' : '#fff'
              }}
            >
              {pageTitle}
            </Typography>
            {productCount > 0 && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme === THEME.LIGHT ? '#000' : '#fff', 
                  fontWeight: 400, 
                  ml: 1 
                }}
              >
                [{productCount}]
              </Typography>
            )}
          </Box>
        </Box>

        {/* Tab Card Navigation */}
        {tabs.length > 0 && (
          <Container maxWidth="xl" sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                pb: 2,
              }}
            >
              {tabs.map(tab => (
                <Link
                  key={tab.value}
                  href={`/shoes/${tab.value}`}
                  style={{ textDecoration: 'none', flex: 1 }}
                >
                  <Box
                    sx={{
                      border: 0,
                      borderBottom: tab.value === currentTab 
                        ? `4px solid ${theme === THEME.LIGHT ? '#000' : '#fff'}` 
                        : 'none',
                      bgcolor: tab.value === currentTab 
                        ? (theme === THEME.LIGHT ? '#000' : '#fff') 
                        : (theme === THEME.LIGHT ? '#fff' : '#1a1a1a'),
                      color: tab.value === currentTab 
                        ? (theme === THEME.LIGHT ? '#fff' : '#000') 
                        : (theme === THEME.LIGHT ? '#111' : '#fff'),
                      fontWeight: tab.value === currentTab ? 700 : 500,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      p: 0,
                      pb: 0,
                      minWidth: 180,
                      maxWidth: 220,
                      mx: 0.5,
                      '&:hover': {
                        borderBottom: `4px solid ${theme === THEME.LIGHT ? '#000' : '#fff'}`,
                        bgcolor: tab.value === currentTab 
                          ? (theme === THEME.LIGHT ? '#000' : '#fff') 
                          : (theme === THEME.LIGHT ? '#f5f5f5' : '#333'),
                        color: theme === THEME.LIGHT ? '#000' : '#fff',
                        fontWeight: 700,
                        transform: 'scale(1.04)',
                        boxShadow: theme === THEME.LIGHT 
                          ? '0 4px 24px 0 rgba(0,0,0,0.08)' 
                          : '0 4px 24px 0 rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ width: '100%', height: 160, overflow: 'hidden', borderRadius: 0 }}>
                      <img
                        src={tab.image}
                        alt={tab.label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        py: 2,
                        fontWeight: tab.value === currentTab ? 700 : 600,
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        bgcolor: tab.value === currentTab 
                          ? (theme === THEME.LIGHT ? '#000' : '#fff') 
                          : (theme === THEME.LIGHT ? '#fff' : '#1a1a1a'),
                        color: tab.value === currentTab 
                          ? (theme === THEME.LIGHT ? '#fff' : '#000') 
                          : (theme === THEME.LIGHT ? '#111' : '#fff'),
                        textTransform: 'uppercase',
                      }}
                    >
                      {tab.label}
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Box>
          </Container>
        )}
      </Box>

      {/* Sort Bar */}
      <Container
        maxWidth="lg"
        sx={{ mb: 3, position: 'relative', zIndex: 2, mt: 6, px: { xs: 1, md: 4 } }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <FormControl 
            sx={{ 
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
            }}
          >
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

        {/* Product Grid */}
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
              display="flex"
              flexWrap="wrap"
              gap={6}
              justifyContent="center"
              alignItems="stretch"
            >
              {products.map(product => (
                <Box
                  key={product._id}
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
                        return `/assets/images/shoes/${category.toLowerCase()}/${product.images[0]}`;
                      }
                      return '/assets/images/placeholder.jpg';
                    })()}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    tags={product.tags || []}
                    brand={product.brand || { _id: '', name: 'Unknown Brand' }}
                    categories={product.categories || []}
                    averageRating={averageRatings[product._id] ?? 0}
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
 