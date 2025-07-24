'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  useMediaQuery,
  Breadcrumbs,
  Link
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import ProductCard from '@/components/card/index';
import { useTheme as useCustomTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
}

const OUTLET_CATEGORY_ID = '68446a93bc749d5ad8fb80f2'; // OUTLET
const PRODUCTS_PER_PAGE = 9;

const CATEGORY_NAME_TO_ID: Record<string, string> = {
  men: '6845a435f588c9b6fd8235fa',
  women: '6845a435f588c9b6fd8235fb',
  kids: '6845a435f588c9b6fd8235fc',
  'last-size': '6845a435f588c9b6fd8235fd',
};

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  men: 'Men',
  women: 'Women',
  kids: 'Kids',
  'last-size': 'Last Size',
};

export default function OutletSubCategoryPage() {
  const { sub } = useParams();
  const router = useRouter();
  const theme = useTheme();
  const { theme: customTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const subId = CATEGORY_NAME_TO_ID[sub as string];
    if (!subId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          category: `${OUTLET_CATEGORY_ID},${subId}`,
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
  }, [sub, sortBy]);

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

  const categoryDisplayName = CATEGORY_DISPLAY_NAMES[sub as string] || (sub as string) || 'Unknown';

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: customTheme === THEME.LIGHT ? '#fff' : '#000',
      color: customTheme === THEME.LIGHT ? '#000' : '#fff',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      <Container maxWidth="xl" sx={{ py: 4, pt: 10 }}>
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumbs 
            aria-label="breadcrumb" 
            sx={{ 
              mb: 4, 
              '& .MuiBreadcrumbs-separator': { mx: 1 },
              '& .MuiBreadcrumbs-ol': {
                color: customTheme === THEME.LIGHT ? '#666' : '#ccc',
              }
            }}
          >
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              router.push('/');
            }}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Link
            color="inherit"
            href="/outlet"
            onClick={(e) => {
              e.preventDefault();
              router.push('/outlet');
            }}
            sx={{ 
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Outlet
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {categoryDisplayName}
          </Typography>
        </Breadcrumbs>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 900, 
            mb: 2,
            background: customTheme === THEME.LIGHT 
              ? 'linear-gradient(45deg, #1976d2, #42a5f5)'
              : 'linear-gradient(45deg, #90caf9, #64b5f6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          OUTLET - {categoryDisplayName.toUpperCase()}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 6, 
            color: customTheme === THEME.LIGHT ? '#666' : '#ccc',
            maxWidth: 600
          }}
        >
          Khám phá bộ sưu tập {categoryDisplayName.toLowerCase()} với giá tốt nhất tại Outlet
        </Typography>
      </motion.div>

      {/* Header with Sort and Results Count */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
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
          key={`${currentPage}-${sortBy}-${sub}`}
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
                />
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: customTheme === THEME.LIGHT ? '#f8f9fa' : '#1a1a1a',
            borderRadius: 2,
            border: `2px dashed ${customTheme === THEME.LIGHT ? '#e0e0e0' : '#444'}`
          }}>
            <Typography variant="h5" sx={{ 
              color: customTheme === THEME.LIGHT ? '#666' : '#ccc', 
              mb: 2 
            }}>
              Không tìm thấy sản phẩm
            </Typography>
            <Typography variant="body1" sx={{ 
              color: customTheme === THEME.LIGHT ? '#666' : '#ccc', 
              mb: 3 
            }}>
              Hiện tại không có sản phẩm {categoryDisplayName.toLowerCase()} trong Outlet
            </Typography>
            <Link
              href="/outlet"
              onClick={(e) => {
                e.preventDefault();
                router.push('/outlet');
              }}
              sx={{ 
                textDecoration: 'none',
                color: customTheme === THEME.LIGHT ? '#1976d2' : '#90caf9',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              ← Quay lại Outlet
            </Link>
          </Box>
        </motion.div>
      )}
      </Container>
    </Box>
  );
}
