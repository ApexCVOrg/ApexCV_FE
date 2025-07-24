'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Pagination,
  CircularProgress,
  Container,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ProductCard from '@/components/card';
import { useTranslations } from 'next-intl';
import api from '@/services/api';
import { useTheme as useCustomTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

import '@/styles/components/_outlet.scss';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  sizes?: { size: string; stock: number }[];
  colors?: string[];
}

const OUTLET_CATEGORY_ID = '68446a93bc749d5ad8fb80f2';
const PRODUCTS_PER_PAGE = 9;

export default function OutletPage() {
  const t = useTranslations('outletPage');
  const router = useRouter();
  const theme = useTheme();
  const { theme: customTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    {
      name: t('categories.men'),
      image: '/assets/images/aothun.jpg',
      href: 'men',
    },
    {
      name: t('categories.women'),
      image: '/assets/images/MU_Hoodie.avif',
      href: 'women',
    },
    {
      name: t('categories.kids'),
      image: '/assets/images/MU_Shirt.avif',
      href: 'kids',
    },
    {
      name: t('categories.lastSize'),
      image: '/assets/images/outlet-sale.png',
      href: 'last-size',
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          category: OUTLET_CATEGORY_ID,
          sortBy: sortBy,
        });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?${queryParams}`);
        const data = await res.json();

        let productData: Product[] = [];
        if (data.success && data.data) {
          productData = Array.isArray(data.data) ? data.data : [];
        } else if (Array.isArray(data)) {
          productData = data;
        }

        setProducts(productData);
        setTotalPages(Math.ceil(productData.length / PRODUCTS_PER_PAGE));
        setCurrentPage(1); // Reset to first page when sorting changes
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy]);

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

  // Calculate paginated products
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: customTheme === THEME.LIGHT ? '#fff' : '#000',
      color: customTheme === THEME.LIGHT ? '#000' : '#fff',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      <Container maxWidth="xl" sx={{ py: 4, pt: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 900, 
              textAlign: 'center', 
              mb: 2,
              background: customTheme === THEME.LIGHT 
                ? 'linear-gradient(45deg,rgb(0, 0, 0),rgb(19, 22, 24))'
                : 'linear-gradient(45deg,rgb(255, 255, 255),rgb(200, 200, 200))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('title')}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center', 
              mb: 6, 
              color: customTheme === THEME.LIGHT ? '#666' : '#ccc',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            {t('subtitle')}
          </Typography>
        </motion.div>

      {/* Categories Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 4, 
              textAlign: 'center',
              color: customTheme === THEME.LIGHT ? '#1a1a1a' : '#fff'
            }}
          >
            Chọn Danh Mục
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
              maxWidth: 1200,
              mx: 'auto'
            }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.3 + index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Box
                  onClick={() => router.push(`/outlet/${category.href}`)}
                  sx={{
                    position: 'relative',
                    height: 280,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%), url(${category.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                      transform: 'translateY(-8px)',
                      '& .category-overlay': {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                      },
                      '& .category-title': {
                        transform: 'translateY(-5px)',
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                      zIndex: 1,
                    }
                  }}
                >
                  {/* Overlay for better text readability */}
                  <Box 
                    className="category-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.3)',
                      transition: 'background-color 0.3s ease',
                      zIndex: 2,
                    }}
                  />
                  
                  {/* Category Title */}
                  <Box
                    className="category-title"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 3,
                      zIndex: 3,
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'white',
                        fontWeight: 800,
                        textAlign: 'center',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        letterSpacing: '0.5px',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", "Noto Sans", "Noto Sans Vietnamese", sans-serif',
                      }}
                    >
                      {category.name}
                    </Typography>
                    
                    {/* Arrow indicator */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 1,
                        opacity: 0.8,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <Box
                        sx={{
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: '8px solid white',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Special badge for last-size */}
                  {category.href === 'last-size' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 4,
                        background: 'linear-gradient(45deg, #ff4757, #ff3742)',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: '0 4px 12px rgba(255, 71, 87, 0.4)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': {
                            transform: 'scale(1)',
                          },
                          '50%': {
                            transform: 'scale(1.05)',
                          },
                          '100%': {
                            transform: 'scale(1)',
                          },
                        },
                      }}
                    >
                      Sale 40%
                    </Box>
                  )}
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </motion.div>

      {/* Products Section */}
      <Box className="outlet-products-section">
        {/* Header with Sort and Results Count */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: customTheme === THEME.LIGHT ? '#000' : '#fff',
            }}>
              {products.length} sản phẩm • Trang {currentPage} / {totalPages}
            </Typography>
            <FormControl sx={{ 
              minWidth: 200,
              '& .MuiInputLabel-root': {
                color: customTheme === THEME.LIGHT ? '#666' : '#ccc',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: customTheme === THEME.LIGHT ? '#ddd' : '#444',
                },
                '&:hover fieldset': {
                  borderColor: customTheme === THEME.LIGHT ? '#999' : '#666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: customTheme === THEME.LIGHT ? '#1976d2' : '#90caf9',
                },
              },
              '& .MuiSelect-select': {
                color: customTheme === THEME.LIGHT ? '#000' : '#fff',
              },
            }}>
              <InputLabel>Sort By</InputLabel>
              <Select 
                value={sortBy} 
                label="Sort By" 
                onChange={e => setSortBy(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: customTheme === THEME.LIGHT ? '#fff' : '#1a1a1a',
                      color: customTheme === THEME.LIGHT ? '#000' : '#fff',
                      '& .MuiMenuItem-root': {
                        '&:hover': {
                          bgcolor: customTheme === THEME.LIGHT ? '#f5f5f5' : '#333',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 400 
          }}>
            <CircularProgress size={60} sx={{ color: customTheme === THEME.LIGHT ? '#1976d2' : '#90caf9' }} />
          </Box>
        )}

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPage}-${sortBy}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mb: 4
              }}
            >
              {currentProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ProductCard
                    _id={product._id}
                    productId={product._id}
                    name={product.name}
                    image={product.images[0]}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    tags={product.tags}
                    brand={product.brand}
                    categories={product.categories}
                    averageRating={averageRatings[product._id] ?? 0}
                  />
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 2,
              mt: 6
            }}>
              {/* Previous Button */}
              <IconButton
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                sx={{
                  border: `2px solid ${customTheme === THEME.LIGHT ? '#e0e0e0' : '#444'}`,
                  color: customTheme === THEME.LIGHT ? '#000' : '#fff',
                  '&:hover': {
                    borderColor: customTheme === THEME.LIGHT ? '#1976d2' : '#90caf9',
                    backgroundColor: customTheme === THEME.LIGHT ? 'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.1)',
                  },
                  '&.Mui-disabled': {
                    borderColor: customTheme === THEME.LIGHT ? '#f0f0f0' : '#333',
                  }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              {/* Pagination Numbers */}
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                variant="outlined"
                shape="rounded"
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiPaginationItem-root': {
                    border: `2px solid ${customTheme === THEME.LIGHT ? '#e0e0e0' : '#444'}`,
                    fontWeight: 600,
                    color: customTheme === THEME.LIGHT ? '#000' : '#fff',
                    '&:hover': {
                      borderColor: customTheme === THEME.LIGHT ? '#1976d2' : '#90caf9',
                      backgroundColor: customTheme === THEME.LIGHT ? 'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.1)',
                    },
                  },
                  '& .Mui-selected': {
                    backgroundColor: customTheme === THEME.LIGHT ? '#1976d2 !important' : '#90caf9 !important',
                    color: customTheme === THEME.LIGHT ? 'white !important' : '#000 !important',
                    borderColor: customTheme === THEME.LIGHT ? '#1976d2 !important' : '#90caf9 !important',
                    '&:hover': {
                      backgroundColor: customTheme === THEME.LIGHT ? '#1565c0 !important' : '#64b5f6 !important',
                    },
                  },
                }}
              />

              {/* Next Button */}
              <IconButton
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                sx={{
                  border: `2px solid ${customTheme === THEME.LIGHT ? '#e0e0e0' : '#444'}`,
                  color: customTheme === THEME.LIGHT ? '#000' : '#fff',
                  '&:hover': {
                    borderColor: customTheme === THEME.LIGHT ? '#1976d2' : '#90caf9',
                    backgroundColor: customTheme === THEME.LIGHT ? 'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.1)',
                  },
                  '&.Mui-disabled': {
                    borderColor: customTheme === THEME.LIGHT ? '#f0f0f0' : '#333',
                  }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Page Info */}
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: 'center', 
                mt: 2, 
                color: customTheme === THEME.LIGHT ? '#666' : '#ccc',
                fontWeight: 500
              }}
            >
              Hiển thị {startIndex + 1}-{Math.min(endIndex, products.length)} trong tổng số {products.length} sản phẩm
            </Typography>
          </motion.div>
        )}
      </Container>
    </Box>
  );
}
