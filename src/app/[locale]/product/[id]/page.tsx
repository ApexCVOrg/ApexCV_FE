'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Rating,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Breadcrumbs,
  Link,
  Modal,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  Share,
  Star,
  LocalShipping,
  Security,
  Refresh,
  ArrowBack,
  ArrowForward,
  Close,
  Check,
  Info,
  ZoomIn,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useAuthContext } from '@/context/AuthContext';
import { useCartContext } from '@/context/CartContext';
// import FavoriteButton from '@/components/ui/FavoriteButton';
import SizeGuideModal from '@/components/SizeGuideModal';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: { size: string; stock: number; color?: string }[];
  colors: string[];
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  ratingsAverage: number;
  ratingsQuantity: number;
  status: string;
  createdAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}

interface Review {
  _id: string;
  user: { _id: string; fullName?: string; avatar?: string } | string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const t = useTranslations('productDetail');
  const { token } = useAuthContext();
  const { refreshCart } = useCartContext();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [autoScroll] = useState(true);
  const autoScrollRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${productId}`);
        const productData = response.data as { data: Product };
        setProduct(productData.data);
        
        // Set default selections
        if (productData.data.colors?.length > 0) {
          setSelectedColor(productData.data.colors[0]);
        }
        if (productData.data.sizes?.length > 0) {
          setSelectedSize(productData.data.sizes[0].size);
        }
      } catch (err: unknown) {
        setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Auto scroll images
  useEffect(() => {
    if (autoScroll && product?.images && product.images.length > 1) {
      autoScrollRef.current = setInterval(() => {
        setSelectedImage((prev) => 
          prev < (product?.images?.length - 1) ? prev + 1 : 0
        );
      }, 3000);
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [autoScroll, product?.images]);

  // Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;
      try {
        const res = await api.get(`/reviews?product=${product._id}`);
        setReviews(res.data as Review[]);
      } catch {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [product?._id]);

  // Fetch average rating for this product
  useEffect(() => {
    const fetchAverage = async () => {
      if (!productId) return;
      try {
        const res = await api.get(`/reviews/average/${productId}`);
        const data = res.data as { average: number };
        setAverageRating(data.average || 0);
      } catch {
        setAverageRating(0);
      }
    };
    fetchAverage();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!token) {
      setSnackbar({
        open: true,
        message: t('loginToAddToCart'),
        severity: 'warning',
      });
      return;
    }

    if (!selectedSize) {
      setSnackbar({
        open: true,
        message: t('selectSize'),
        severity: 'warning',
      });
      return;
    }

    if (!selectedColor) {
      setSnackbar({
        open: true,
        message: t('selectColor'),
        severity: 'warning',
      });
      return;
    }

    try {
      await api.post('/carts/add', {
        productId: product?._id,
        size: selectedSize,
        color: selectedColor,
        quantity,
      });
      await refreshCart();
      setSnackbar({
        open: true,
        message: t('addToCartSuccess'),
        severity: 'success',
      });
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('addToCartError'),
        severity: 'error',
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStock = (color: string, size: string) => {
    return product?.sizes.find(s => s.size === size && s.color === color)?.stock || 0;
  };

  const getUniqueSizes = () => {
    if (!product) return [];
    return Array.from(new Set(product.sizes.map(s => s.size)));
  };

  const handleImageClick = () => {
    setShowZoomModal(true);
  };

  const handlePrevImage = () => {
    setSelectedImage(prev => prev > 0 ? prev - 1 : (product?.images.length || 1) - 1);
  };

  const handleNextImage = () => {
    setSelectedImage(prev => prev < (product?.images.length || 1) - 1 ? prev + 1 : 0);
  };

  const getProductType = () => {
    if (!product) return 'clothing';
    
    // Check category name
    const categoryName = product.categories?.[0]?.name?.toLowerCase() || '';
    const productName = product.name.toLowerCase();
    
    if (categoryName.includes('giày') || categoryName.includes('dép') || categoryName.includes('sneaker')) {
      return 'shoes';
    } else if (categoryName.includes('quần') || productName.includes('quần')) {
      return 'pants';
    } else {
      return 'clothing';
    }
  };

  // Lấy danh sách màu duy nhất từ mảng sizes
  const uniqueColors = product ? Array.from(new Set(product.sizes.map(sz => sz.color).filter(Boolean))) : [];
  // Lấy danh sách size duy nhất theo màu đã chọn
  const sizesForSelectedColor = product && selectedColor
    ? product.sizes.filter(sz => sz.color === selectedColor).map(sz => sz.size)
    : [];
  // Lấy danh sách màu duy nhất theo size đã chọn (nếu muốn UX tốt hơn)
  const colorsForSelectedSize = product && selectedSize
    ? Array.from(new Set(product.sizes.filter(sz => sz.size === selectedSize).map(sz => sz.color)))
    : uniqueColors;

  // Khi chọn màu, nếu size hiện tại không còn hợp lệ thì reset size
  useEffect(() => {
    if (selectedColor && product) {
      const validSizes = product.sizes.filter(sz => sz.color === selectedColor).map(sz => sz.size);
      if (!validSizes.includes(selectedSize)) {
        setSelectedSize(validSizes[0] || '');
      }
    }
  }, [selectedColor, product]);

  // Khi chọn size, nếu màu hiện tại không còn hợp lệ thì reset màu
  useEffect(() => {
    if (selectedSize && product) {
      const validColors = product.sizes.filter(sz => sz.size === selectedSize).map(sz => sz.color);
      if (!validColors.includes(selectedColor)) {
        setSelectedColor(validColors[0] || '');
      }
    }
  }, [selectedSize, product]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="400px">
          <Typography variant="h5" color="error" gutterBottom>
            {error || t('productNotFound')}
          </Typography>
          <Button variant="contained" onClick={() => window.history.back()}>
            <ArrowBack sx={{ mr: 1 }} />
            {t('backToHome')}
          </Button>
        </Box>
      </Container>
    );
  }

  const isDiscounted = product.discountPrice && product.discountPrice < product.price;
  const discountPercentage = isDiscounted 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 10 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/" color="inherit" underline="hover">
          Trang chủ
        </Link>
        <Link
          href={`/${product.categories?.[0]?.name?.toLowerCase() || 'products'}`}
          color="inherit"
          underline="hover"
        >
          {product.categories?.[0]?.name || 'Products'}
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Product Images */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            {/* Main Image with Carousel */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 500,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#f8f9fa',
                cursor: 'pointer',
              }}
              onClick={handleImageClick}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </AnimatePresence>

              {/* Navigation Buttons */}
              {product.images.length > 1 && (
                <>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    sx={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    sx={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </>
              )}

              {/* Pagination Dots */}
              {product.images.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  {product.images.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: selectedImage === index ? 12 : 8,
                        height: selectedImage === index ? 12 : 8,
                        borderRadius: '50%',
                        bgcolor: selectedImage === index ? 'white' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(index);
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Zoom Icon */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  bgcolor: 'rgba(0,0,0,0.3)',
                  borderRadius: '50%',
                  p: 1,
                }}
              >
                <ZoomIn sx={{ color: 'white', fontSize: 20 }} />
              </Box>
            </Box>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mt: 2, 
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: 4,
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: 2,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: 2,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#a8a8a8',
                },
              }}>
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      minWidth: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #1976d2' : '2px solid transparent',
                      bgcolor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        borderColor: selectedImage === index ? '#1976d2' : '#ddd',
                      },
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Product Info */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            {/* Product Title */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              {product.name}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={averageRating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {typeof averageRating === 'number' ? averageRating.toFixed(1) : '0.0'} ({product.ratingsQuantity} đánh giá)
              </Typography>
            </Box>

            {/* Price */}
            <Box sx={{ mb: 3 }}>
              {isDiscounted ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h3" color="error" sx={{ fontWeight: 700 }}>
                    {product.discountPrice!.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {product.price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </Typography>
                  <Chip
                    label={`-${discountPercentage}%`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
              ) : (
                <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                  {product.price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              )}
            </Box>

            {/* Brand & Categories */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('brand')}: <strong>{product.brand?.name || 'Unknown Brand'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('categories')}: {product.categories?.map(cat => cat.name).join(', ') || 'No categories'}
              </Typography>
            </Box>

            {/* Color Picker */}
            {uniqueColors.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('colors')}:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {uniqueColors.map((color) => (
                    colorsForSelectedSize.includes(color) && (
                      <Box
                        key={color}
                        sx={{
                          position: 'relative',
                          minWidth: 80,
                          height: 40,
                          borderRadius: 20,
                          border: selectedColor === color ? '2px solid #000' : '2px solid #ddd',
                          bgcolor: selectedColor === color ? '#000' : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          px: 2,
                          '&:hover': {
                            transform: 'scale(1.05)',
                            bgcolor: selectedColor === color ? '#333' : '#f5f5f5',
                          },
                        }}
                        onClick={() => color && setSelectedColor(color)}
                      >
                        <Typography
                          sx={{
                            color: selectedColor === color ? '#fff' : '#000',
                            fontWeight: 600,
                            fontSize: 14,
                            textTransform: 'capitalize',
                          }}
                        >
                          {color}
                        </Typography>
                        {selectedColor === color && (
                          <Check sx={{ color: 'white', fontSize: 16, ml: 1 }} />
                        )}
                      </Box>
                    )
                  ))}
                </Box>
              </Box>
            )}

            {/* Size Selection */}
            {sizesForSelectedColor.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {t('sizes')}:
                  </Typography>
                  <Button
                    startIcon={<Info />}
                    onClick={() => setShowSizeGuide(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('sizeGuide')}
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {sizesForSelectedColor.map((size) => (
                    <motion.div
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          border: selectedSize === size ? '2px solid #000' : '2px solid #ddd',
                          bgcolor: selectedSize === size ? '#000' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          opacity: selectedColor ? (getStock(selectedColor, size) === 0 ? 0.5 : 1) : 1,
                        }}
                        onClick={() => setSelectedSize(size)}
                      >
                        <Typography
                          sx={{
                            color: selectedSize === size ? '#fff' : '#000',
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          {size}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            )}

            {/* Stock Information */}
            {selectedColor && selectedSize && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('colorSizeStock', { 
                    color: selectedColor,
                    size: selectedSize, 
                    stock: getStock(selectedColor, selectedSize)
                  })}
                </Typography>
              </Box>
            )}

            {/* Quantity */}
            {selectedColor && selectedSize && getStock(selectedColor, selectedSize) > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('quantity')}:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    sx={{ 
                      border: '1px solid #ddd',
                      width: 40,
                      height: 40,
                    }}
                  >
                    -
                  </IconButton>
                  <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => setQuantity(Math.min(getStock(selectedColor, selectedSize), quantity + 1))}
                    disabled={quantity >= getStock(selectedColor, selectedSize)}
                    sx={{ 
                      border: '1px solid #ddd',
                      width: 40,
                      height: 40,
                    }}
                  >
                    +
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{
                  flex: 1,
                  py: 1.5,
                  bgcolor: '#000',
                  borderRadius: 3,
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                {t('addToCart')}
              </Button>
              <IconButton
                sx={{
                  border: '1px solid #ddd',
                  color: isFavorite ? '#ff3b30' : '#000',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Favorite />
              </IconButton>
              <IconButton
                sx={{
                  border: '1px solid #ddd',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <Share />
              </IconButton>
            </Stack>

            {/* Product Status */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShipping sx={{ mr: 1, color: 'green' }} />
                  <Typography variant="body2">{t('freeShipping')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Security sx={{ mr: 1, color: 'green' }} />
                  <Typography variant="body2">{t('warranty')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Refresh sx={{ mr: 1, color: 'green' }} />
                  <Typography variant="body2">{t('returnPolicy')}</Typography>
                </Box>
              </Stack>
            </Box>

            {/* Tags */}
            {product.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('tags')}:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {product.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={t('description')} />
          <Tab label={t('specifications')} />
          <Tab label={t('reviews')} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {product.description || 'Chưa có mô tả cho sản phẩm này.'}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('basicInfo')}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('productName')}:</strong> {product.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('brand')}:</strong> {product.brand?.name || 'Unknown Brand'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('categories')}:</strong>{' '}
                      {product.categories?.map(cat => cat.name).join(', ') || 'No categories'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('status')}:</strong> {product.status}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('createdAt')}:</strong> {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('technicalInfo')}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('availableSizes')}:</strong> {getUniqueSizes().join(', ')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('colors')}:</strong> {uniqueColors.join(', ') || 'No colors'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('averageRating')}:</strong> {typeof product.ratingsAverage === 'number' ? product.ratingsAverage.toFixed(1) : '0.0'}/5
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('reviewCount')}:</strong> {product.ratingsQuantity}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {reviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Star sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {t('noReviews')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('beFirstToReview')}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 2 }}>
              {reviews.map((review) => (
                <Box key={review._id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                    {typeof review.user === 'object' ? review.user.fullName || 'Người dùng' : 'Người dùng'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={review.rating} readOnly size="small" precision={0.5} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#222' }}>{review.comment}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>
      </Box>

      {/* Zoom Modal */}
      <Modal
        open={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '90vw',
            height: '90vh',
            bgcolor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton
            onClick={() => setShowZoomModal(false)}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'white',
              zIndex: 1,
            }}
          >
            <Close />
          </IconButton>
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Modal>

      {/* Size Guide Modal */}
      <SizeGuideModal
        open={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        productType={getProductType()}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 