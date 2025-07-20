"use client";
import React, { useEffect, useState, useRef } from "react";
import { Container, Typography, Box, Card, CardMedia, Button, CircularProgress, IconButton } from "@mui/material";
import Image from "next/image";
import ProductCard from "@/components/card";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useCartContext } from '@/context/CartContext';

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

export default function MenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const productsPerPage = 8;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Debug environment variables
  console.log('[MenPage] API URL:', process.env.NEXT_PUBLIC_API_URL);

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
      const parentCategory = category.parentCategory;
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
        console.log('[MenPage] Fetching from:', `${process.env.NEXT_PUBLIC_API_URL}/products?gender=men`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=men`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('[MenPage] API Response:', result);
        
        if (result.success) {
          console.log('[MenPage] Total products:', result.data?.length);
          console.log('[MenPage] Sample product data:', result.data?.[0]);
          console.log('[MenPage] Sample image path:', result.data?.[0]?.images?.[0]);
          setProducts(result.data || []);
          setDisplayedProducts((result.data || []).slice(0, productsPerPage));
        } else {
          throw new Error(result.message || 'API returned unsuccessful response');
        }
      } catch (err) {
        console.error('[MenPage] Error:', err);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=men`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
        setDisplayedProducts(result.data.slice(0, productsPerPage));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('[MenPage] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const { addToCart } = useCartContext();

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
      });
      // Có thể thêm snackbar thông báo thành công ở đây
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Có thể thêm snackbar thông báo lỗi ở đây
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
          src="/assets/images/men/banner/global_aclubs_home_realmadrid_football_ss25_launch_home_catlp_mh_d_7771d8dffb.avif"
          alt="Men's Football Collection"
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
                margin: 0
              }}
            >
              REAL MADRID 24/25 HOME KIT
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
              Bộ sưu tập chính thức của Los Blancos
            </Typography>
          </Box>

          {/* CTA Button */}
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
              Khám phá bộ sưu tập đa dạng dành cho nam giới
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
                { name: 'Giày thể thao', image: '/assets/images/men/arsenal/Arsenal_Men\'s_Training_Shoes.avif', description: 'Phong cách và thoải mái' },
                { name: 'Áo đấu', image: '/assets/images/men/arsenal/Arsenal_Home_2425.avif', description: 'Chính thức và đẳng cấp' },
                { name: 'Quần short', image: '/assets/images/men/arsenal/Arsenal_24-25_Home_Shorts.avif', description: 'Thoải mái vận động' }
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
                        _id={product._id}
                        productId={product._id}
                        name={product.name || 'Unnamed Product'}
                        image={
                          product.images?.[0] 
                            ? `/assets/images/men/${getTeamNameFromProduct(product)}/${product.images[0]}` 
                            : '/assets/images/placeholder.jpg'
                        }
                        price={product.price || 0}
                        discountPrice={product.discountPrice}
                        tags={product.tags || []}
                        brand={product.brand || { _id: '', name: 'Unknown Brand' }}
                        categories={product.categories || []}
                        onAddToCart={() => handleAddToCart(product)}
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