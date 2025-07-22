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
import Image from 'next/image';
import ProductCard from '@/components/card';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Link from 'next/link';

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
  sizes?: { size: string; stock: number }[];
  colors?: string[];
}

export default function WomenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const productsPerPage = 8;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Function to get team name from product categories
  // const getTeamNameFromProduct = (product: Product): string => {
  //   // Find team category (usually has a parent category that is gender)
  //   for (const category of product.categories) {
  //     // Check if category name matches known teams
  //     const teamNames = [
  //       'arsenal',
  //       'juventus',
  //       'bayern munich',
  //       'real madrid',
  //       'manchester united',
  //     ];
  //     const categoryNameLower = category.name.toLowerCase();

  //     for (const team of teamNames) {
  //       if (categoryNameLower.includes(team) || categoryNameLower === team) {
  //         return team;
  //       }
  //     }

  //     // Check parent category with optional chaining
  //     const parentCategory = (category as any).parentCategory;
  //     if (parentCategory) {
  //       const parentNameLower = parentCategory.name.toLowerCase();
  //       for (const team of teamNames) {
  //         if (parentNameLower.includes(team) || parentNameLower === team) {
  //           return team;
  //       }
  //     }
  //   }

  //   // Default fallback
  //   return 'arsenal';
  // };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?gender=women`);
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
          // Lọc sản phẩm thuộc 5 team lớn cho women
          const teamProducts = (result.data || []).filter(
            (p: Product) => p.categories?.[1] && teamNames.includes(p.categories[1].name.toLowerCase())
          );
          setProducts(teamProducts);
          setDisplayedProducts(teamProducts.slice(0, productsPerPage));
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?gender=women`);
      const result = await response.json();
      if (result.success) {
        const teamNames = [
          'arsenal',
          'real madrid',
          'manchester united',
          'bayern munich',
          'juventus',
        ];
        // Lọc sản phẩm thuộc 5 team lớn cho women
        const teamProducts = (result.data || []).filter(
          (p: Product) => p.categories?.[1] && teamNames.includes(p.categories[1].name.toLowerCase())
        );
        setProducts(teamProducts);
        setDisplayedProducts(teamProducts.slice(0, productsPerPage));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };



  const handleCarouselPrev = () => {
    setCarouselIndex(prev => Math.max(0, prev - 1));
  };

  const handleCarouselNext = () => {
    setCarouselIndex(prev => Math.min(Math.ceil(products.length / 4) - 1, prev + 1));
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Hero Banner */}
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          minHeight: { xs: '60vh', md: '80vh', lg: '90vh' },
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          src="/assets/images/banner/COLLECTIO-BANNER-HOME-KIT-25-26-CHICAS.webp"
          alt="Women's Football Collection"
          fill
          style={{ objectFit: 'cover' }}
          priority
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
                margin: 0,
              }}
            >
              HOME KIT 25/26 CHICAS
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
                letterSpacing: '0.01em',
              }}
            >
              Bộ sưu tập chính thức của các nữ cầu thủ
            </Typography>
          </Box>

          {/* CTA Button */}
          <Link href="/women/real-madrid" style={{ textDecoration: 'none' }}>
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
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Mua ngay
            </Button>
          </Link>
        </Box>
      </Box>
      <Container maxWidth="xl" disableGutters>
        {/* Categories Section */}
        <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: 'white' }}>
          <Container maxWidth="lg">
            <Typography 
              variant="h3" 
              component="h2" 
              align="center" 
              sx={{
                fontWeight: 'bold',
                mb: 2,
                color: 'text.primary'
              }}
            >
              MUA SẮM THEO DANH MỤC
            </Typography>
            <Typography 
              variant="h6" 
              align="center" 
              sx={{
                color: 'text.secondary',
                mb: 6,
                fontWeight: 300
              }}
            >
              Khám phá bộ sưu tập đa dạng dành cho nữ giới
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
                { name: 'Giày sneaker', image: '/assets/images/women/arsenal/Gazelle_Arsenal_Terrace_Icons_Shoes_White.avif', description: 'Phong cách và thoải mái', href: '/women/team-sneaker' },
                { name: 'Áo đấu', image: '/assets/images/women/arsenal/Arsenal_2425_Jersey.jpg', description: 'Chính thức và đẳng cấp', href: '/women/Jersey-women' },
                { name: 'Quần short', image: '/assets/images/women/arsenal/Arsenal_Women_Short.avif', description: 'Thoải mái vận động', href: '/women/shorttrouser-women' }
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
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
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
        <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#f8f9fa' }}>
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
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  SẢN PHẨM NỔI BẬT
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 300
                  }}
                >
                  Những sản phẩm được yêu thích nhất
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
                <CircularProgress size={60} sx={{ color: 'black' }}/>
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
                    borderColor: 'black',
                    color: 'black',
                    '&:hover': {
                      borderColor: 'black',
                      bgcolor: 'black',
                      color: 'white'
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
                <Typography variant="h5" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
                  Không tìm thấy sản phẩm nào
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={refreshProducts}
                  sx={{
                    borderColor: 'black',
                    color: 'black',
                    '&:hover': {
                      borderColor: 'black',
                      bgcolor: 'black',
                      color: 'white'
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
                    bgcolor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: 'white' },
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
                  bgcolor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: 'white' },
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
                        image={
                          product.images && product.images.length > 0
                            ? `/assets/images/women/${product.categories?.[1]?.name.toLowerCase()}/${product.images[0]}`
                            : '/assets/images/placeholder.jpg'
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
                        bgcolor: carouselIndex === index ? 'black' : 'grey.300',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: carouselIndex === index ? 'black' : 'grey.500',
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
    </>
  );
}
