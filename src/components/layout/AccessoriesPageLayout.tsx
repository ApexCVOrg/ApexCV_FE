"use client";
import React, { useEffect, useState } from "react";
import { Box, Container, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Link } from "@mui/material";
import ProductCard from "@/components/card";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useLocale } from 'next-intl';

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
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", mt: 10, position: 'relative' }}>
      {/* Banner ở phía sau */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 400, 
        zIndex: 1 
      }}>
        <img 
          src={bannerImage} 
          alt={bannerAlt} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
      </Box>
      
      {/* Breadcrumb và navigation ở phía trên banner */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Breadcrumb */}
        <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Link href="/accessories" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white', fontWeight: 700, marginRight: 2 }}>
              <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5 }} /> BACK
            </Link>
            <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={{ color: 'white', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
            </Link>
            <Typography component="span" sx={{ color: 'white', mx: 0.5 }}>/</Typography>
            <Link href="/accessories" style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={{ color: 'white', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Accessories</Typography>
            </Link>
            <Typography component="span" sx={{ color: 'white', mx: 0.5 }}>/</Typography>
            <Typography component="span" sx={{ color: 'white', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>{category}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0, color: 'white' }}>
              {pageTitle}
            </Typography>
            {productCount > 0 && (
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 400, ml: 1 }}>
                [{productCount}]
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Tab Card Navigation */}
        {tabs.length > 0 && (
          <Container maxWidth="xl" sx={{ mb: 4 }}>
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
                    borderBottom: tab.value === currentTab ? '4px solid #000' : 'none',
                    bgcolor: tab.value === currentTab ? '#000' : '#fff',
                    color: tab.value === currentTab ? '#fff' : '#111',
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
                      borderBottom: '4px solid #000',
                      bgcolor: tab.value === currentTab ? '#000' : '#f5f5f5',
                      color: '#000',
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
                      bgcolor: tab.value === currentTab ? '#000' : '#fff', 
                      color: tab.value === currentTab ? '#fff' : '#111', 
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
      </Box>
      
      {/* Sort Bar */}
      <Container maxWidth="xl" sx={{ mb: 3, position: 'relative', zIndex: 2, mt: 6, px: { xs: 2, md: 6 } }}>
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: 2,
          pr: { xs: 0, sm: 0, md: 0 }
        }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Gender</InputLabel>
            <Select 
              value={gender} 
              label="Gender" 
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="men">Men</MenuItem>
              <MenuItem value="women">Women</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select 
              value={sortBy} 
              label="Sort By" 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Products Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={60} sx={{ color: 'black' }} />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Typography color="error" variant="h6">{error}</Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Typography variant="h5" color="text.secondary">{emptyMessage}</Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
            width: '100%'
          }}>
            {products.map((product) => (
              <Box key={product._id} sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(25% - 18px)' }
              }}>
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
        )}
      </Container>
    </Box>
  );
} 