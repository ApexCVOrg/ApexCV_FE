"use client";
import React, { useEffect, useState, useRef } from "react";
import { Container, Typography, Box, Card, CardMedia, Button, CircularProgress, IconButton } from "@mui/material";

import ProductCard from "@/components/card";
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
  categories: { _id: string; name: string }[];
  createdAt: string;
}

interface ApiProduct {
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

interface ApiResponse {
  data: ApiProduct[];
}

export default function AccessoriesPage() {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?status=active`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: ApiResponse = await response.json();
        if (result.data) {
          // Lọc sản phẩm accessories
          const accessoriesProducts = (result.data || []).filter((p: ApiProduct) => {
            // Kiểm tra categoryPath
            if (Array.isArray(p.categoryPath)) {
              return p.categoryPath.some((cat: string) => 
                cat.toLowerCase().includes('accessories') || cat.toLowerCase().includes('accessory')
              );
            }
            
            // Kiểm tra categories array
            if (p.categories && Array.isArray(p.categories)) {
              const categoryNames = p.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
              return categoryNames.some((name: string) => 
                name.includes('accessories') || name.includes('accessory')
              );
            }
            
            // Kiểm tra tags
            if (p.tags && Array.isArray(p.tags)) {
              return p.tags.some((tag: string) => 
                tag.toLowerCase().includes('accessories') || tag.toLowerCase().includes('accessory')
              );
            }
            
            return false;
          });
          
          setProducts(accessoriesProducts);
          setDisplayedProducts(accessoriesProducts.slice(0, productsPerPage));
        } else {
          throw new Error('API returned empty data');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?status=active`);
      const result: ApiResponse = await response.json();
      if (result.data) {
        setProducts(result.data);
        setDisplayedProducts(result.data.slice(0, productsPerPage));
      } else {
        throw new Error('API returned empty data');
      }
    } catch (err) {
      console.error('[AccessoriesPage] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };



  const handleCarouselNext = () => {
    const maxIndex = Math.max(0, products.length - 4);
    setCarouselIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const handleCarouselPrev = () => {
    setCarouselIndex(prev => Math.max(prev - 1, 0));
  };

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
        color: theme === THEME.LIGHT ? '#000' : '#fff'
      }}>
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
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          marginTop: '80px',
          minHeight: { xs: '60vh', md: '80vh', lg: '90vh' },
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1753088968/europe_SS_commercial_ss25_Summer_Sale_Phase4_Onsite_Hero_Banner_Men_Desktop_9c1cf5f1ad_fxuyvl.avif"
          alt="Accessories Collection"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            padding: { xs: 4, md: 8, lg: 12 },
            pb: { xs: 6, md: 10, lg: 12 },
          }}
        >
          {/* Main Title Block */}
          <Box
            sx={{
              bgcolor: 'white',
              color: 'black',
              px: { xs: 1.5, md: 2 },
              py: { xs: 0.5, md: 0.8 },
              mb: 0.5,
              maxWidth: 'fit-content',
              display: 'inline-block'
            }}
          >
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.2rem', md: '1.6rem', lg: '2rem' },
                lineHeight: 1,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: 0
              }}
            >
              SUMMER SALE ACCESSORIES
            </Typography>
          </Box>

          {/* Subtitle Block */}
          <Box
            sx={{
              bgcolor: 'white',
              color: 'black',
              px: { xs: 1.5, md: 2 },
              py: { xs: 0.4, md: 0.6 },
              mb: 2,
              maxWidth: 'fit-content',
              display: 'inline-block'
            }}
          >
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{
                fontWeight: 400,
                fontSize: { xs: '0.75rem', md: '0.85rem', lg: '0.95rem' },
                margin: 0,
                letterSpacing: '0.01em'
              }}
            >
              Khuyến mãi mùa hè
            </Typography>
          </Box>

          {/* CTA Button */}
          <Link href="/accessories/bags" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              size="small"
              sx={{ 
                bgcolor: 'white',
                color: 'black',
                px: { xs: 2, md: 2.5 },
                py: { xs: 0.5, md: 0.7 },
                fontSize: { xs: '0.7rem', md: '0.8rem' },
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 0,
                border: '2px solid black',
                minWidth: '100px',
                '&:hover': {
                  bgcolor: 'black',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Mua ngay
            </Button>
          </Link>
        </Box>
      </Box>
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
                color: theme === THEME.LIGHT ? '#000' : '#fff'
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
                fontWeight: 300
              }}
            >
              Khám phá bộ sưu tập phụ kiện đa dạng
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 3, md: 3 },
              mt: 4,
              maxWidth: '1200px',
              mx: 'auto'
            }}>
              {[
                { name: 'Bags', image: 'https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093478/Mini_Airliner_Bag_Blue_JC8302_01_00_standard_qv8iwo.avif', description: 'Túi xách và balo', href: '/accessories/bags' },
                { name: 'Eyewears', image: 'https://res.cloudinary.com/dqmb4e2et/image/upload/v1753094816/Sport_Sunglasses_adidas_DUNAMIS_Antique_Black_IV1298_01_hover_standard_whlnza.avif', description: 'Kính mắt thể thao', href: '/accessories/eyewears' },
                { name: 'Hats', image: 'https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093480/Golf_Performance_Crestable_Cap_Black_IM9184_01_standard_pjozkk.avif', description: 'Mũ và nón', href: '/accessories/hats' }
              ].map((category) => (
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
                      bgcolor: theme === THEME.LIGHT ? '#fff' : '#1a1a1a',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme === THEME.LIGHT ? '0 12px 24px rgba(0,0,0,0.15)' : '0 12px 24px rgba(255,255,255,0.1)'
                      }
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
                            filter: 'brightness(1)'
                          }
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
                          textAlign: 'center'
                        }}
                      >
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 'bold', 
                            mb: 1,
                            fontSize: { xs: '1.5rem', md: '1.75rem' },
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            opacity: 0.95,
                            fontSize: { xs: '0.9rem', md: '1rem' },
                            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', md: 'center' }, 
              mb: 6,
              gap: { xs: 3, md: 0 }
            }}>
              <Box>
                <Typography 
                  variant="h3" 
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    mb: 1
                  }}
                >
                  SẢN PHẨM NỔI BẬT
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{
                    color: theme === THEME.LIGHT ? '#666' : '#ccc',
                    fontWeight: 300
                  }}
                >
                  Những phụ kiện được yêu thích nhất
                </Typography>
              </Box>
            </Box>
            {loading && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '300px'
              }}>
                <CircularProgress size={60} sx={{ color: theme === THEME.LIGHT ? '#000' : '#fff' }}/>
              </Box>
            )}
            {error && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '300px',
                justifyContent: 'center'
              }}>
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
                      color: theme === THEME.LIGHT ? '#fff' : '#000'
                    }
                  }}
                >
                  Thử lại
                </Button>
              </Box>
            )}
            {!loading && !error && displayedProducts.length === 0 && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '300px',
                justifyContent: 'center'
              }}>
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
                      color: theme === THEME.LIGHT ? '#fff' : '#000'
                    }
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
                    bgcolor: theme === THEME.LIGHT ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    boxShadow: theme === THEME.LIGHT ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(255,255,255,0.2)',
                    '&:hover': { 
                      bgcolor: theme === THEME.LIGHT ? 'white' : 'black'
                    },
                    '&.Mui-disabled': { opacity: 0 }
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
                    bgcolor: theme === THEME.LIGHT ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    boxShadow: theme === THEME.LIGHT ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(255,255,255,0.2)',
                    '&:hover': { 
                      bgcolor: theme === THEME.LIGHT ? 'white' : 'black'
                    },
                    '&.Mui-disabled': { opacity: 0 }
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
                  {products.map((product) => (
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
                        image={product.images?.[0] || '/assets/images/placeholder.jpg'}
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
                <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'center',
                  gap: 2, 
                  mt: 4 
                }}>
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
                          bgcolor: carouselIndex === index ? (theme === THEME.LIGHT ? '#000' : '#fff') : (theme === THEME.LIGHT ? '#999' : '#999'),
                          transform: 'scale(1.2)'
                        }
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