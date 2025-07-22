'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ProductCard from '@/components/card';
import { HeroBanner } from '@/components/banner';
// import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Link from 'next/link';
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
}

export default function KidsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const productsPerPage = 8;
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Theme hook
  const { theme } = useTheme();



  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=kids`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          const teamNames = [
            'arsenal',
            'real madrid',
            'manchester united',
            'bayern munich',
            'juventus',
          ];
          // Lọc sản phẩm thuộc 5 team lớn cho kids
          const teamProducts = (result.data || []).filter(
            (p: Product) => p.categories?.[1] && teamNames.includes(p.categories[1].name.toLowerCase())
          );
          
          console.log('Kids page debug:', {
            totalProducts: result.data?.length || 0,
            teamProductsCount: teamProducts.length,
            teamProducts: teamProducts.map((p: Product) => ({
              name: p.name,
              categories: p.categories?.map((c: { _id: string; name: string; parentCategory?: { _id: string; name: string; parentCategory?: { _id: string; name: string } } }) => c.name),
              images: p.images
            }))
          });
          
          setProducts(teamProducts);
          setDisplayedProducts(teamProducts.slice(0, productsPerPage));
        } else {
          throw new Error(result.message || 'API returned unsuccessful response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=kids`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
        setDisplayedProducts(result.data.slice(0, productsPerPage));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('[KidsPage] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };



  const handleCarouselPrev = () => {
    setCarouselIndex(prev => Math.max(prev - 1, 0));
  };

  const handleCarouselNext = () => {
    setCarouselIndex(prev => Math.min(prev + 1, Math.ceil(products.length / 4) - 1));
  };

  if (error) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
      color: theme === THEME.LIGHT ? '#000' : '#fff',
      minHeight: '100vh'
    }}>
      {/* Hero Banner */}
      <HeroBanner
        imageSrc="/assets/images/kids/banner/global_smiley_commercial_ss25_launch_kids_glp_banner_hero_4_d_49322caabb.avif"
        imageAlt="ADIDAS SMILEY Banner"
        title="ADIDAS | SMILEY"
        subtitle="Share true joy with your smile."
        ctaText="Shop Now"
        ctaLink="/shop"
      />
      <Container maxWidth="xl" disableGutters>
        {/* Categories Section */}
        <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: theme === THEME.LIGHT ? '#fff' : '#000' }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              component="h2"
              align="center"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                color: theme === THEME.LIGHT ? '#000' : '#fff',
              }}
            >
              MUA SẮM THEO DANH MỤC
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{
                color: theme === THEME.LIGHT ? '#666' : '#ccc',
                mb: 6,
                fontWeight: 300,
              }}
            >
              Khám phá bộ sưu tập đa dạng dành cho trẻ em
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: { xs: 3, md: 3 },
                mt: 4,
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              {[
                {
                  name: 'Áo đấu',
                  image: '/assets/images/kids/arsenal/Arsenal_Shirt.avif',
                  description: 'Chính thức và đẳng cấp',
                  href: '/kids/jersey',
                },
                {
                  name: 'Tracksuit',
                  image: '/assets/images/kids/arsenal/Arsenal_Tracksuit.png',
                  description: 'Thoải mái vận động',
                  href: '/kids/tracksuit',
                },
              ].map(category => (
                <Link key={category.name} href={category.href} style={{ textDecoration: 'none' }}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      overflow: 'hidden',
                      maxWidth: '360px',
                      mx: 'auto',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: theme === THEME.LIGHT ? '#f5f5f5' : '#333' }}>
                      <CardMedia
                        component="img"
                        image={category.image}
                        alt={category.name}
                        sx={{
                          height: { xs: 240, sm: 280, md: 320 },
                          objectFit: 'cover',
                          width: '100%',
                          transition: 'transform 0.4s ease',
                          filter: 'brightness(0.95)',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            filter: 'brightness(1)',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          color: 'white',
                          p: { xs: 2, md: 3 },
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            fontSize: { xs: '1.5rem', md: '1.75rem' },
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            opacity: 0.95,
                            fontSize: { xs: '0.9rem', md: '1rem' },
                            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                          }}
                        >
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Link>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Featured Products */}
        <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: theme === THEME.LIGHT ? '#f8f9fa' : '#1a1a1a' }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                mb: 6,
                gap: { xs: 3, md: 0 },
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    mb: 1,
                  }}
                >
                  SẢN PHẨM NỔI BẬT
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme === THEME.LIGHT ? '#666' : '#ccc',
                    fontWeight: 300,
                  }}
                >
                  Những sản phẩm được yêu thích nhất
                </Typography>
              </Box>
            </Box>
            {loading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '300px',
                }}
              >
                <CircularProgress size={60} sx={{ color: theme === THEME.LIGHT ? '#000' : '#fff' }} />
              </Box>
            )}
            {error && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '300px',
                  justifyContent: 'center',
                }}
              >
                <Typography color="error" align="center" variant="h6" sx={{ mb: 2 }}>
                  Đã xảy ra lỗi: {error}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={refreshProducts}
                  sx={{
                    borderColor: theme === THEME.LIGHT ? '#000' : '#fff',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    '&:hover': {
                      borderColor: theme === THEME.LIGHT ? '#000' : '#fff',
                      bgcolor: theme === THEME.LIGHT ? '#000' : '#fff',
                      color: theme === THEME.LIGHT ? '#fff' : '#000',
                    },
                  }}
                >
                  Thử lại
                </Button>
              </Box>
            )}
            {!loading && !error && displayedProducts.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '300px',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" align="center" sx={{ mb: 2, color: theme === THEME.LIGHT ? '#666' : '#ccc' }}>
                  Không tìm thấy sản phẩm nào
                </Typography>
                <Button
                  variant="outlined"
                  onClick={refreshProducts}
                  sx={{
                    borderColor: theme === THEME.LIGHT ? '#000' : '#fff',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    '&:hover': {
                      borderColor: theme === THEME.LIGHT ? '#000' : '#fff',
                      bgcolor: theme === THEME.LIGHT ? '#000' : '#fff',
                      color: theme === THEME.LIGHT ? '#fff' : '#000',
                    },
                  }}
                >
                  Tải lại
                </Button>
              </Box>
            )}
            {!loading && !error && products.length > 0 && (
              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                {/* Left Navigation Button */}
                <IconButton
                  onClick={handleCarouselPrev}
                  disabled={carouselIndex === 0}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    bgcolor: theme === THEME.LIGHT ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    '&:hover': { 
                      bgcolor: theme === THEME.LIGHT ? 'white' : 'rgba(0,0,0,0.9)',
                      color: theme === THEME.LIGHT ? '#000' : '#fff'
                    },
                    '&.Mui-disabled': { opacity: 0 },
                  }}
                >
                  <ArrowBackIosIcon />
                </IconButton>

                {/* Right Navigation Button */}
                <IconButton
                  onClick={handleCarouselNext}
                  disabled={carouselIndex >= Math.ceil(products.length / 4) - 1}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    bgcolor: theme === THEME.LIGHT ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    '&:hover': { 
                      bgcolor: theme === THEME.LIGHT ? 'white' : 'rgba(0,0,0,0.9)',
                      color: theme === THEME.LIGHT ? '#000' : '#fff'
                    },
                    '&.Mui-disabled': { opacity: 0 },
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>

                <Box
                  ref={carouselRef}
                  sx={{
                    display: 'flex',
                    gap: { xs: 2, sm: 3, md: 4 },
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${carouselIndex * 280 * 4}px)`,
                    width: `${Math.max(products.length, 4) * 280}px`,
                  }}
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
                        name={product.name || 'Unnamed Product'}
                        image={
                          product.images?.[0]
                            ? `/assets/images/kids/${product.categories?.[1]?.name.toLowerCase()}/${product.images[0]}`
                            : '/assets/images/kids/arsenal/Arsenal_Shirt.avif'
                        }
                        price={product.price || 0}
                        discountPrice={product.discountPrice}
                        tags={product.tags || []}
                        brand={product.brand || { _id: '', name: 'Unknown Brand' }}
                        categories={product.categories || []}
                      />
                    </Box>
                  ))}
                </Box>

                {/* Carousel Indicators */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 4,
                  }}
                >
                  {Array.from({ length: Math.ceil(products.length / 4) }).map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: carouselIndex === index ? (theme === THEME.LIGHT ? '#000' : '#fff') : (theme === THEME.LIGHT ? '#ccc' : '#666'),
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: carouselIndex === index ? (theme === THEME.LIGHT ? '#000' : '#fff') : (theme === THEME.LIGHT ? '#999' : '#888'),
                          transform: 'scale(1.2)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Container>
        </Box>
      </Container>
    </Box>
  );
}
