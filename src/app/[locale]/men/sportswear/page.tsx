"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, CircularProgress, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Image from "next/image";
import ProductCard from "@/components/card";
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function SportswearPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const productsPerPage = 8;
  const [sortBy, setSortBy] = useState('newest');

  const sortProducts = (products: Product[], sortType: string) => {
    const sortedProducts = [...products];
    switch (sortType) {
      case 'price-low':
        return sortedProducts.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      case 'price-high':
        return sortedProducts.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      case 'newest':
        return sortedProducts;
      case 'popular':
        return sortedProducts;
      default:
        return sortedProducts;
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=men&category=sportswear`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          const sorted = sortProducts(result.data || [], sortBy);
          setProducts(sorted);
          setDisplayedProducts(sorted.slice(0, productsPerPage));
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
  }, [sortBy]);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=men&category=sportswear`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
        setCurrentPage(1);
        setDisplayedProducts(result.data.slice(0, productsPerPage));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('[SportswearPage] Error:', err);
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

  const { locale } = useParams();
  const productCount = products.length;

  return (
    <>
      {/* Breadcrumb và Heading */}
      <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Link href="/men" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', fontWeight: 700, marginRight: 2 }}>
            <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5 }} />
            BACK
          </Link>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: 'grey.400', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
          </Link>
          <Typography component="span" sx={{ color: 'grey.400', mx: 0.5 }}>/</Typography>
          <Link href="/men" style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: 'grey.400', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Men</Typography>
          </Link>
          <Typography component="span" sx={{ color: 'grey.400', mx: 0.5 }}>/</Typography>
          <Typography component="span" sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Sportswear</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
            MEN'S SPORTSWEAR
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 400, ml: 1 }}>
            {productCount > 0 ? `[${productCount}]` : ''}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, maxWidth: 900, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.1rem' } }}>
          Shop men's sportswear for every activity – from training to running, football to gym. Engineered for performance, comfort, and style, our collection keeps you moving at your best.
        </Typography>
      </Box>
      <Container maxWidth="xl" disableGutters>
        {/* Sort Bar */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
        <Box>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <CircularProgress size={60} sx={{ color: 'black' }}/>
            </Box>
          )}
          {error && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '300px', justifyContent: 'center' }}>
              <Typography color="error" align="center" variant="h6" sx={{ mb: 2 }}>
                Đã xảy ra lỗi: {error}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={refreshProducts}
                sx={{ borderColor: 'black', color: 'black', '&:hover': { borderColor: 'black', bgcolor: 'black', color: 'white' } }}
              >
                Thử lại
              </Button>
            </Box>
          )}
          {!loading && !error && products.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '300px', justifyContent: 'center' }}>
              <Typography variant="h5" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
                Không tìm thấy sản phẩm nào
              </Typography>
              <Button 
                variant="outlined" 
                onClick={refreshProducts}
                sx={{ borderColor: 'black', color: 'black', '&:hover': { borderColor: 'black', bgcolor: 'black', color: 'white' } }}
              >
                Tải lại
              </Button>
            </Box>
          )}
          {!loading && !error && products.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)'
                },
                gap: 3,
                mt: 2
              }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  productId={product._id}
                  name={product.name || 'Unnamed Product'}
                  image={
                    product.images?.[0]
                      ? `/assets/images/men/${product.categories?.[1]?.name.toLowerCase()}/${product.images[0]}`
                      : '/assets/images/placeholder.jpg'
                  }
                  price={product.price || 0}
                  discountPrice={product.discountPrice}
                  tags={product.tags || []}
                  brand={product.brand || { _id: '', name: 'Unknown Brand' }}
                  categories={product.categories || []}
                  onAddToCart={() => handleAddToCart(product.name)}
                />
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
} 