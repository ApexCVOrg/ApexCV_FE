"use client";
import React, { useEffect, useState, useRef } from "react";
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, CircularProgress, IconButton } from "@mui/material";
import Image from "next/image";
import ProductCard from "@/components/card";
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const productsPerPage = 8;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Debug environment variables
  console.log('[KidsPage] API URL:', process.env.NEXT_PUBLIC_API_URL);

  // Function to get team name from product categories
  const getTeamNameFromProduct = (product: Product): string => {
    // Find team category (usually has a parent category that is gender)
    for (const category of product.categories) {
      // Check if category name matches known teams
      const teamNames = ['arsenal', 'juventus', 'bayern munich', 'real madrid', 'manchester united'];
      const categoryNameLower = category.name.toLowerCase();
      
      for (const team of teamNames) {
        if (categoryNameLower.includes(team) || categoryNameLower === team) {
          return team;
        }
      }
      
      // Check parent category with optional chaining
      const parentCategory = (category as any).parentCategory;
      if (parentCategory) {
        const parentNameLower = parentCategory.name.toLowerCase();
        for (const team of teamNames) {
          if (parentNameLower.includes(team) || parentNameLower === team) {
            return team;
          }
        }
      }
    }
    
    // Default fallback
    return 'arsenal';
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[KidsPage] Fetching from:', `${process.env.NEXT_PUBLIC_API_URL}/products?gender=kids`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=kids`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('[KidsPage] API Response:', result);
        
        if (result.success) {
          console.log('[KidsPage] Total products:', result.data?.length);
          console.log('[KidsPage] Sample product data:', result.data?.[0]);
          console.log('[KidsPage] Sample image path:', result.data?.[0]?.images?.[0]);
          setProducts(result.data || []);
          setDisplayedProducts((result.data || []).slice(0, productsPerPage));
        } else {
          throw new Error(result.message || 'API returned unsuccessful response');
        }
      } catch (err) {
        console.error('[KidsPage] Error:', err);
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
        setCurrentPage(1);
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

  const handlePageChange = (newPage: number) => {
    const startIndex = (newPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    setDisplayedProducts(products.slice(startIndex, endIndex));
    setCurrentPage(newPage);
  };

  const handleAddToCart = (productName: string) => {
    console.log('Add to cart:', productName);
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
          src="/assets/images/kids/arsenal/Arsenal_Shirt.avif"
          alt="Kids' Football Collection"
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
            background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: { xs: 4, md: 8, lg: 12 },
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: { xs: '3rem', md: '5rem', lg: '6.5rem' },
              lineHeight: 0.9,
              textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
              mb: 3,
              maxWidth: '800px',
              letterSpacing: '-0.02em'
            }}
          >
            KIDS' FOOTBALL
          </Typography>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{
              color: 'white',
              fontWeight: 300,
              fontSize: { xs: '1.4rem', md: '2rem', lg: '2.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              mb: 5,
              maxWidth: '600px',
              opacity: 0.95
            }}
          >
            Chính thức và đẳng cấp
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              bgcolor: 'white',
              color: 'black',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              borderRadius: 0,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Khám phá ngay
          </Button>
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
              Khám phá bộ sưu tập đa dạng dành cho trẻ em
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
                { name: 'Áo đấu', image: '/assets/images/kids/arsenal/Arsenal_Shirt.avif', description: 'Chính thức và đẳng cấp' },
                { name: 'Tracksuit', image: '/assets/images/kids/arsenal/Arsenal_Tracksuit.png', description: 'Thoải mái vận động' }
              ].map((category) => (
                <Card 
                  key={category.name} 
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
                <Box
                  ref={carouselRef}
                  sx={{
                    display: 'flex',
                    gap: { xs: 2, sm: 3, md: 4 },
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${carouselIndex * (100 / 4)}%)`,
                    width: `${Math.max(products.length, 4) * 25}%`
                  }}
                >
                  {products.map((product) => (
                    <Box 
                      key={product._id}
                      sx={{
                        minWidth: { xs: '240px', sm: '260px', md: '280px' },
                        maxWidth: { xs: '260px', sm: '280px', md: '300px' },
                        flex: '0 0 auto',
                        display: 'flex',
                        justifyContent: 'center',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          transition: 'all 0.3s ease',
                          zIndex: 1
                        }
                      }}
                    >
                      <Box sx={{ 
                        width: '100%',
                        maxWidth: 280,
                        margin: '0 auto'
                      }}>
                        <ProductCard
                          name={product.name || 'Unnamed Product'}
                          image={
                            product.images?.[0] 
                              ? `/assets/images/kids/${getTeamNameFromProduct(product)}/${product.images[0]}` 
                              : '/assets/images/placeholder.jpg'
                          }
                          price={product.price || 0}
                          discountPrice={product.discountPrice}
                          tags={product.tags || []}
                          brand={product.brand || { _id: '', name: 'Unknown Brand' }}
                          categories={product.categories || []}
                          onAddToCart={() => handleAddToCart(product.name)}
                        />
                      </Box>
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
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCarouselIndex(Math.min(index * Math.floor((products.length - 4) / 4), products.length - 4))}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: Math.floor(carouselIndex / Math.floor((products.length - 4) / 4)) === index ? 'black' : 'grey.300',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: Math.floor(carouselIndex / Math.floor((products.length - 4) / 4)) === index ? 'black' : 'grey.500',
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