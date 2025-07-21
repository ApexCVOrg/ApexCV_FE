'use client';

import React from "react";
import { Box, Typography, Card, Container, Button } from "@mui/material";
import Link from "next/link";
import { Star, TrendingUp, LocalShipping } from "@mui/icons-material";
import ProductCard from "@/components/card";
import { useState, useEffect } from "react";
import api from "@/services/api";

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



export default function ShoesPage() {
  const [trendingShoes, setTrendingShoes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingShoes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        const allProducts = (response.data as { data: Product[] }).data;
        
        // Filter shoes products
        const shoesProducts = allProducts.filter(product => {
          const categoryName = product.categories[0]?.name?.toLowerCase() || '';
          const productName = product.name.toLowerCase();
          const categoryPath = product.categoryPath?.join(' ').toLowerCase() || '';
          
          return categoryName.includes('giày') || 
                 categoryName.includes('dép') || 
                 categoryName.includes('sneaker') ||
                 categoryName.includes('shoes') ||
                 productName.includes('giày') ||
                 productName.includes('dép') ||
                 productName.includes('sneaker') ||
                 categoryPath.includes('shoes') ||
                 categoryPath.includes('giày');
        });

        // Get first 6 trending shoes
        setTrendingShoes(shoesProducts.slice(0, 6));
      } catch {
        // Error handling without console.log
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingShoes();
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <Box
        sx={{
          width: '100vw',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 0,
          mt: 10, // tăng margin top để tránh bị che bởi header
          mx: 'calc(-50vw + 50%)',
          background: '#fff',
        }}
      >
        <Link href="/shoes/adizero" style={{ width: '100vw', display: 'block' }}>
          <img
            src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1752339174/s3_mca0rk.webp"
            alt="Banner"
            style={{
              width: '100vw',
              height: 'auto',
              display: 'block',
              border: 'none',
              borderRadius: 0,
              boxShadow: 'none',
              margin: 0,
              padding: 0,
            }}
          />
        </Link>
      </Box>

      {/* Categories Section */}
      {/* Đã xoá mục Shop by Category theo yêu cầu */}

      {/* Featured Collection - Adidas Style */}
      <Box sx={{ bgcolor: '#fff', py: 8, mt: 6 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 6,
              textAlign: 'center',
              color: '#111',
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontFamily: 'Arial Black, Arial, sans-serif',
            }}
          >
            Featured Collection
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
            {[
              {
                name: 'Samba',
                image:
                  'https://res.cloudinary.com/dqmb4e2et/video/upload/v1752341091/Samba_OG_Shoes_Beige_IG6170_video_yfw3p0.webm',
                desc: 'Classic street style. Timeless comfort.',
                isVideo: true,
                href: '/shoes/samba',
              },
              {
                name: 'Gazelle',
                image:
                  'https://res.cloudinary.com/dqmb4e2et/video/upload/v1752341016/Gazelle_Indoor_Shoes_Red_JS1411_video_svlucy.webm',
                desc: 'Retro vibes. Modern edge.',
                isVideo: true,
                href: '/shoes/gazelle',
              },
              {
                name: 'Spezial',
                image:
                  'https://res.cloudinary.com/dqmb4e2et/video/upload/v1752340906/Handball_Spezial_Shoes_Green_IG6192_video_skpsxq.webm',
                desc: 'Heritage look. Everyday wear.',
                isVideo: true,
                href: '/shoes/spezial',
              },
              {
                name: 'Superstar',
                image:
                  'https://res.cloudinary.com/dqmb4e2et/video/upload/v1752340693/Giay_Superstar_Vintage_trang_JQ3254_video_ltzy3m.webm',
                desc: 'Iconic shell toe. Bold attitude.',
                isVideo: true,
                href: '/shoes/superstar',
              },
            ].map(item => (
              <Box key={item.name} flex="1 1 260px" maxWidth={320} minWidth={200}>
                <Card
                  sx={{
                    bgcolor: '#fff',
                    border: '2px solid #111',
                    borderRadius: 4,
                    boxShadow: 'none',
                    transition: '0.3s',
                    '&:hover': {
                      bgcolor: '#111',
                      color: '#fff',
                      borderColor: '#fff',
                    },
                    textAlign: 'center',
                    p: 2,
                    minHeight: 420,
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      bgcolor: '#EBEDEE', // dùng màu nền mới
                      borderRadius: 4, // giống Card
                    }}
                  >
                    {item.isVideo ? (
                      <video
                        src={item.image}
                        style={{
                          maxWidth: '98%',
                          maxHeight: 190,
                          objectFit: 'contain',
                          borderRadius: 4,
                          background: '#EBEDEE',
                        }}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          maxWidth: '98%',
                          maxHeight: 190,
                          filter: 'grayscale(100%)',
                          objectFit: 'contain',
                          transition: 'filter 0.3s',
                          borderRadius: 4,
                          background: '#EBEDEE',
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      letterSpacing: 1,
                      fontFamily: 'Arial Black, Arial, sans-serif',
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.8, mb: 2 }}>
                    {item.desc}
                  </Typography>
                  <Button
                    component={Link}
                    href={item.href}
                    variant="outlined"
                    sx={{
                      borderColor: '#111',
                      color: '#111',
                      fontWeight: 600,
                      letterSpacing: 1,
                      bgcolor: '#fff',
                      '&:hover': {
                        bgcolor: '#111',
                        color: '#fff',
                        borderColor: '#fff',
                      },
                    }}
                  >
                    Shop Now
                  </Button>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Trending Shoes - Using ProductCard Component */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: "bold", 
              mb: 2,
              color: 'text.primary',
              textTransform: 'uppercase',
              letterSpacing: 2
            }}>
              Trending Shoes
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'text.secondary', 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: '1.1rem'
            }}>
              Discover the most popular styles that everyone&apos;s talking about
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
            mb: 6
          }}>
            {loading ? (
              <Typography variant="h6" sx={{ textAlign: 'center', py: 4 }}>Loading trending shoes...</Typography>
            ) : trendingShoes.length === 0 ? (
              <Typography variant="h6" sx={{ textAlign: 'center', py: 4 }}>No trending shoes found.</Typography>
            ) : (
              trendingShoes.map((product) => (
                <Box key={product._id} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ProductCard
                    _id={product._id}
                    productId={product._id}
                    name={product.name}
                    image={product.images[0]} // Assuming the first image is the main one
                    price={product.price}
                    discountPrice={product.discountPrice}
                    tags={product.tags}
                    brand={product.brand}
                    categories={product.categories}
                    categoryPath={product.categoryPath}
                    backgroundColor="#f8f9fa"
                    colors={3}
                  />
                </Box>
              ))
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
            <Box flex="1 1 300px" maxWidth={400} minWidth={220}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <LocalShipping sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Free Shipping
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Free shipping on orders over $50
                </Typography>
              </Box>
            </Box>
            <Box flex="1 1 300px" maxWidth={400} minWidth={220}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Best Quality
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Premium materials and craftsmanship
                </Typography>
              </Box>
            </Box>
            <Box flex="1 1 300px" maxWidth={400} minWidth={220}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Star sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Customer Reviews
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Trusted by thousands of customers
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
