import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartContext } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface ProductDetailSidebarProps {
  productId: string | null;
  product?: Product | null;
  onClose: () => void;
  isOpen: boolean;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  sizes?: { size: string; stock: number }[];
  colors?: string[];
  rating?: number;
  reviewCount?: number;
  stock?: number;
}

const ProductDetailSidebar: React.FC<ProductDetailSidebarProps> = ({
  productId,
  product: initialProduct,
  onClose,
  isOpen,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    details: false,
    reviews: false,
    shipping: false,
    care: false,
  });

  const { addToCart } = useCartContext();
  const { getToken } = useAuth();
  const { isFavorite } = useFavorites();

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    setSelectedImage(0);

    // Nếu có product data sẵn, sử dụng luôn
    if (initialProduct) {
      setProduct(initialProduct);
      // Auto-select first size and color if available
      if (initialProduct.sizes && initialProduct.sizes.length > 0) {
        setSelectedSize(initialProduct.sizes[0].size);
      }
      if (initialProduct.colors && initialProduct.colors.length > 0) {
        setSelectedColor(initialProduct.colors[0]);
      }
      setLoading(false);
      return;
    }

    // Nếu không có product data, gọi API (fallback)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
        return res.json();
      })
      .then(data => {
        setProduct(data.data);
        // Auto-select first size and color if available
        if (data.data.sizes && data.data.sizes.length > 0) {
          setSelectedSize(data.data.sizes[0].size);
        }
        if (data.data.colors && data.data.colors.length > 0) {
          setSelectedColor(data.data.colors[0]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId, initialProduct]);

  const handleAddToCart = async () => {
    const token = getToken();
    if (!token) {
      setError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    if (!product) return;

    // Validate size selection if sizes are available
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError('Vui lòng chọn kích thước');
      return;
    }

    // Validate color selection if colors are available
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setError('Vui lòng chọn màu sắc');
      return;
    }

    try {
      setAddToCartLoading(true);
      setError(null);

      await addToCart({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });

      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 3000);
    } catch {
      setError('Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleToggleFavorite = (isFavorite: boolean) => {
    // FavoriteButton sẽ tự xử lý việc toggle favorite
    console.log('Favorite toggled:', isFavorite);
  };

  const isAddToCartDisabled = () => {
    if (!product) return true;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) return true;
    if (product.colors && product.colors.length > 0 && !selectedColor) return true;
    return false;
  };



  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100vh',
            zIndex: 1400,
            background: '#fff',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box
              sx={{
                p: 3,
                borderBottom: '1px solid #f0f0f0',
                background: '#fff',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography variant="h5" fontWeight={700} color="#1a1a1a">
                  Detail Product
                </Typography>
                <IconButton
                  onClick={onClose}
                  sx={{
                    color: '#666',
                    '&:hover': { color: '#1a1a1a' },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="#666" sx={{ fontStyle: 'italic' }}>
                Legendary Style, All-Day Comfort
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh',
                  }}
                >
                  <CircularProgress size={60} />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ m: 3 }}>
                  {error}
                </Alert>
              ) : product ? (
                <Box sx={{ p: 3 }}>
                  {/* Image Gallery */}
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 300,
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 2,
                        background: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={product.images?.[selectedImage] || '/assets/images/placeholder.jpg'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>

                    {/* Thumbnail Images */}
                    {product.images && product.images.length > 1 && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {product.images.map((img, idx) => (
                          <Box
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border:
                                selectedImage === idx ? '2px solid #1976d2' : '1px solid #e0e0e0',
                              opacity: selectedImage === idx ? 1 : 0.7,
                              transition: 'all 0.2s',
                              '&:hover': { opacity: 1 },
                            }}
                          >
                            <img
                              src={img}
                              alt={`${product.name} ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Product Info */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} color="#1a1a1a" gutterBottom>
                      {product.name}
                    </Typography>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1}>
                          {product.tags.slice(0, 2).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{
                                bgcolor: '#f5f5f5',
                                borderColor: '#e0e0e0',
                                color: '#666',
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Price */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3,
                      }}
                    >
                      <Typography variant="h4" fontWeight={700} color="#1976d2">
                        {product.discountPrice
                          ? product.discountPrice.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })
                          : product.price.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                      </Typography>
                      {product.discountPrice && (
                        <Typography
                          variant="h6"
                          sx={{
                            textDecoration: 'line-through',
                            color: '#999',
                          }}
                        >
                          {product.price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Color Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} color="#1a1a1a">
                          COLOR:
                        </Typography>
                        <Typography variant="body2" color="#666">
                          Available
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {product.colors.map(color => (
                          <Box
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              border:
                                selectedColor === color ? '2px solid #1976d2' : '2px solid #e0e0e0',
                              cursor: 'pointer',
                              bgcolor: color.toLowerCase(),
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} color="#1a1a1a">
                          SIZE: {selectedSize && `US ${selectedSize} (Only One Left)`}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#1976d2"
                          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Size Chart
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                        {product.sizes.map(size => (
                          <Button
                            key={size.size}
                            variant={selectedSize === size.size ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setSelectedSize(size.size)}
                            disabled={size.stock === 0}
                            sx={{
                              minWidth: 'auto',
                              py: 1,
                              px: 1,
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              borderColor: '#e0e0e0',
                              color: selectedSize === size.size ? '#fff' : '#1a1a1a',
                              bgcolor: selectedSize === size.size ? '#1976d2' : 'transparent',
                              '&:hover': {
                                bgcolor: selectedSize === size.size ? '#1565c0' : '#f5f5f5',
                              },
                            }}
                          >
                            US {size.size}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleAddToCart}
                      disabled={isAddToCartDisabled() || addToCartLoading}
                      startIcon={
                        addToCartLoading ? <CircularProgress size={20} /> : <ShoppingCartIcon />
                      }
                      sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        mb: 2,
                        '&:hover': {
                          bgcolor: '#1565c0',
                        },
                        '&:disabled': {
                          bgcolor: '#e0e0e0',
                          color: '#999',
                        },
                      }}
                    >
                      {addToCartSuccess ? 'Đã thêm vào giỏ!' : 'Add to chart'}
                    </Button>

                    <Box
                      onClick={async e => {
                        e.stopPropagation();
                        // Directly call the favorite toggle logic
                        if (!product) return;

                        const token = getToken();
                        if (!token) {
                          // Redirect to login or show login modal
                          console.log('Please login to add to wishlist');
                          return;
                        }

                        try {
                          // Import and use the favorites service directly
                          const { default: favoritesService } = await import(
                            '@/services/favorites'
                          );
                          await favoritesService.toggleFavorite(product._id);
                          handleToggleFavorite(!isFavorite(product._id));
                        } catch (error) {
                          console.error('Error toggling favorite:', error);
                        }
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        border: '2px solid #1976d2',
                        borderRadius: 2,
                        py: 1.5,
                        px: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: '#1976d2',
                        '&:hover': {
                          borderColor: '#1565c0',
                          bgcolor: 'rgba(25, 118, 210, 0.04)',
                        },
                      }}
                    >
                      <FavoriteButton
                        productId={product._id}
                        size="medium"
                        color="error"
                        showTooltip={false}
                        onToggle={handleToggleFavorite}
                        dataTestId="sidebar-favorite-button"
                      />
                      <Typography variant="body1" fontWeight={600}>
                        Add to wishlist
                      </Typography>
                    </Box>
                  </Box>

                  {/* Collapsible Sections */}
                  <Box>
                    {/* Details */}
                    <Box sx={{ mb: 2 }}>
                      <Button
                        fullWidth
                        onClick={() => toggleSection('details')}
                        sx={{
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          color: '#1a1a1a',
                          fontWeight: 600,
                          py: 1,
                          '&:hover': { bgcolor: 'transparent' },
                        }}
                        endIcon={expandedSections.details ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      >
                        DETAILS:
                      </Button>
                      {expandedSections.details && (
                        <Box sx={{ pl: 2, pb: 2 }}>
                          <Typography variant="body2" color="#666">
                            {product.description || 'Chi tiết sản phẩm sẽ được hiển thị ở đây.'}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Reviews */}
                    <Box sx={{ mb: 2 }}>
                      <Button
                        fullWidth
                        onClick={() => toggleSection('reviews')}
                        sx={{
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          color: '#1a1a1a',
                          fontWeight: 600,
                          py: 1,
                          '&:hover': { bgcolor: 'transparent' },
                        }}
                        endIcon={expandedSections.reviews ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      >
                        REVIEWS:
                      </Button>
                      {expandedSections.reviews && (
                        <Box sx={{ pl: 2, pb: 2 }}>
                          <Typography variant="body2" color="#666">
                            Chưa có đánh giá nào cho sản phẩm này.
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Shipping */}
                    <Box sx={{ mb: 2 }}>
                      <Button
                        fullWidth
                        onClick={() => toggleSection('shipping')}
                        sx={{
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          color: '#1a1a1a',
                          fontWeight: 600,
                          py: 1,
                          '&:hover': { bgcolor: 'transparent' },
                        }}
                        endIcon={
                          expandedSections.shipping ? <ExpandLessIcon /> : <ExpandMoreIcon />
                        }
                      >
                        SHIPPING & RETURN:
                      </Button>
                      {expandedSections.shipping && (
                        <Box sx={{ pl: 2, pb: 2 }}>
                          <Typography variant="body2" color="#666">
                            Miễn phí vận chuyển cho đơn hàng trên 500k. Chính sách đổi trả trong 30
                            ngày.
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Care Instructions */}
                    <Box sx={{ mb: 2 }}>
                      <Button
                        fullWidth
                        onClick={() => toggleSection('care')}
                        sx={{
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          color: '#1a1a1a',
                          fontWeight: 600,
                          py: 1,
                          '&:hover': { bgcolor: 'transparent' },
                        }}
                        endIcon={expandedSections.care ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      >
                        CARE INSTRUCTIONS:
                      </Button>
                      {expandedSections.care && (
                        <Box sx={{ pl: 2, pb: 2 }}>
                          <Typography variant="body2" color="#666">
                            Giặt bằng tay với nước lạnh. Không sử dụng chất tẩy rửa mạnh.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Success Message */}
                  <AnimatePresence>
                    {addToCartSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Sản phẩm đã được thêm vào giỏ hàng!
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              ) : null}
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailSidebar;
