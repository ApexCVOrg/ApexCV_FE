'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Fade,
  Slide,
  Badge,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import { useHomeCartContext } from '@/context/HomeCartContext';
import { useCartContext } from '@/context/CartContext';
import { useTheme } from '@mui/material/styles';

interface CartItem {
  _id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  brand?: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface ProductInfo {
  _id: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  brand?: string;
  sizes?: { size: string; stock: number }[];
  colors?: string[];
}

const HomeCartSidebar: React.FC = () => {
  const router = useRouter();
  const { 
    homeCartItems, 
    homeCartItemCount,
    updateHomeCartItem, 
    removeFromHomeCart, 
    confirmHomeCart,
    addToHomeCart
  } = useHomeCartContext();
  const { loading: cartLoading } = useCartContext();
  const theme = useTheme();
  
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);

  // Tính tổng giá trị giỏ hàng
  const totalPrice = homeCartItems.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  // Cập nhật quantities khi cartItems thay đổi
  useEffect(() => {
    const newQuantities: { [key: string]: number } = {};
    homeCartItems.forEach(item => {
      newQuantities[item._id] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [homeCartItems]);

  // Reset form khi chọn sản phẩm mới
  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize('');
      setSelectedColor('');
      setProductQuantity(1);
    }
  }, [selectedProduct]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    updateHomeCartItem(itemId, newQuantity);
  };

  const handleConfirmCart = async () => {
    try {
      await confirmHomeCart();
      router.push('/cart');
    } catch (error) {
      console.error('Error confirming home cart:', error);
    }
  };

  const handleAddProductToCart = () => {
    if (selectedProduct) {
      addToHomeCart({
        productId: selectedProduct._id,
        name: selectedProduct.name,
        image: selectedProduct.image,
        price: selectedProduct.price,
        discountPrice: selectedProduct.discountPrice,
        brand: selectedProduct.brand,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        quantity: productQuantity,
      });
      setSelectedProduct(null);
    }
  };

  const isProductSelectionValid = () => {
    if (!selectedProduct) return false;
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) return false;
    return true;
  };

  const handleCloseProductSelection = () => {
    setSelectedProduct(null);
  };

  return (
    <Paper
      elevation={3}
      sx={theme => ({
        width: { xs: '100%', md: 340 },
        height: 'calc(100vh - 72px)',
        borderLeft: `1px solid ${theme.palette.divider}`,
        position: 'fixed',
        right: 0,
        top: '72px',
        background: theme.palette.background.paper,
        overflowY: 'auto',
        zIndex: 100,
        display: { xs: 'none', md: 'block' },
        boxShadow: theme.shadows[4],
        borderRadius: '0 16px 16px 0',
        transition: 'box-shadow 0.2s',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.action.hover,
          borderRadius: '3px',
        },
      })}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: theme => theme.palette.background.default,
          color: theme => theme.palette.text.primary,
          border: theme => `1px solid ${theme.palette.divider}`,
          boxShadow: theme => theme.shadows[1],
          fontWeight: 600,
          letterSpacing: 0.2,
        }}>
          <Badge badgeContent={homeCartItemCount} color="error" sx={{ mr: 1 }}>
            <ShoppingCartIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          </Badge>
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 700, fontSize: 16 }}>
            Giỏ hàng của bạn
          </Typography>
        </Box>

        {/* Product Selection Section */}
        <Slide direction="down" in={!!selectedProduct} mountOnEnter unmountOnExit>
          <Paper
            elevation={4}
            sx={{ 
              mb: 3, 
              p: 3, 
              border: '2px solid #e3f2fd',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: '#2c3e50' }}>
                <CheckCircleIcon sx={{ mr: 1, color: '#27ae60', fontSize: 20 }} />
                Chọn thông tin sản phẩm
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleCloseProductSelection}
                sx={{ 
                  color: '#7f8c8d',
                  '&:hover': { 
                    background: 'rgba(127, 140, 141, 0.1)',
                    color: '#2c3e50'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box sx={{ 
                position: 'relative',
                width: 80, 
                height: 80, 
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <img
                  src={selectedProduct?.image}
                  alt={selectedProduct?.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, color: '#2c3e50' }}>
                  {selectedProduct?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedProduct?.brand}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {selectedProduct?.discountPrice
                    ? selectedProduct.discountPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                    : selectedProduct?.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2.5}>
              {selectedProduct?.sizes && selectedProduct.sizes.length > 0 && (
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#7f8c8d' }}>Kích thước</InputLabel>
                  <Select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    label="Kích thước"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }}
                  >
                    {selectedProduct.sizes.map((size) => (
                      <MenuItem key={size.size} value={size.size} disabled={size.stock === 0}>
                        {size.size} {size.stock === 0 ? '(Hết hàng)' : `(Còn ${size.stock})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {selectedProduct?.colors && selectedProduct.colors.length > 0 && (
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#7f8c8d' }}>Màu sắc</InputLabel>
                  <Select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    label="Màu sắc"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }}
                  >
                    {selectedProduct.colors.map((color) => (
                      <MenuItem key={color} value={color}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <TextField
                label="Số lượng"
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddProductToCart}
                disabled={!isProductSelectionValid()}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.6)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                    boxShadow: 'none',
                  }
                }}
              >
                <ShoppingCartIcon sx={{ mr: 1 }} />
                Thêm vào giỏ hàng
              </Button>
            </Stack>
          </Paper>
        </Slide>

        {/* Cart Items */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {homeCartItems.length === 0 ? (
            <Fade in={true}>
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                px: 3,
                color: theme => theme.palette.text.disabled,
                opacity: 0.85,
              }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: theme => theme.palette.action.hover,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}>
                  <ShoppingCartIcon sx={{ fontSize: 32, color: 'inherit' }} />
                </Box>
                <Typography variant="subtitle2" color="inherit" gutterBottom sx={{ fontWeight: 600 }}>
                  Giỏ hàng trống
                </Typography>
                <Typography variant="caption" color="inherit" sx={{ maxWidth: 180, mx: 'auto' }}>
                  Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
                </Typography>
              </Box>
            </Fade>
          ) : (
            <List sx={{ p: 0 }}>
              {homeCartItems.map((item, index) => (
                <Slide direction="up" in={true} timeout={300 + index * 100} key={item._id}>
                  <Paper
                    elevation={1}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: theme => `1px solid ${theme.palette.divider}`,
                      boxShadow: theme => theme.shadows[1],
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': {
                        boxShadow: theme => theme.shadows[4],
                        borderColor: theme => theme.palette.primary.light,
                      },
                    }}
                  >
                    <ListItem sx={{ p: 1 }}>
                      <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                        {/* Product Image */}
                        <Box sx={{
                          position: 'relative',
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          flexShrink: 0,
                          border: theme => `1px solid ${theme.palette.divider}`,
                        }}>
                          <img
                            src={item.image ? `/assets/images/${item.image}` : '/assets/images/placeholder.jpg'}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        {/* Product Details */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.primary', mb: 0.2 }}
                          >
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.2, fontSize: 11 }}>
                            {item.brand}
                          </Typography>
                          <Stack direction="row" spacing={0.3} sx={{ mb: 0.2 }}>
                            {item.size && (
                              <Chip label={`Size: ${item.size}`} size="small" variant="outlined" sx={{ borderColor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: 10, height: 18, px: 0.5, transition: 'border-color 0.2s, color 0.2s', '&:hover': { borderColor: 'primary.main', color: 'primary.dark' } }} />
                            )}
                            {item.color && (
                              <Chip label={`Màu: ${item.color}`} size="small" variant="outlined" sx={{ borderColor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: 10, height: 18, px: 0.5, transition: 'border-color 0.2s, color 0.2s', '&:hover': { borderColor: 'primary.main', color: 'primary.dark' } }} />
                            )}
                          </Stack>
                          <Typography variant="body2" color="primary" fontWeight={700} sx={{ mb: 0.5, fontSize: 13 }}>
                            {item.discountPrice
                              ? item.discountPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                              : item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                          </Typography>
                          {/* Quantity Control */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            background: '#f8f9fa',
                            borderRadius: 2,
                            p: 0.5,
                            width: 'fit-content'
                          }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item._id, quantities[item._id] - 1)}
                              disabled={quantities[item._id] <= 1}
                              sx={{ 
                                color: quantities[item._id] <= 1 ? '#bdc3c7' : '#667eea',
                                '&:hover': {
                                  background: quantities[item._id] <= 1 ? 'transparent' : 'rgba(102, 126, 234, 0.1)',
                                }
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              size="small"
                              value={quantities[item._id] || 1}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                handleQuantityChange(item._id, value);
                              }}
                              inputProps={{ 
                                min: 1, 
                                style: { 
                                  textAlign: 'center', 
                                  width: 40,
                                  fontWeight: 600,
                                  color: '#2c3e50'
                                } 
                              }}
                              sx={{ 
                                width: 60,
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': { border: 'none' },
                                  background: 'white',
                                  borderRadius: 1,
                                }
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item._id, quantities[item._id] + 1)}
                              sx={{ 
                                color: '#667eea',
                                '&:hover': {
                                  background: 'rgba(102, 126, 234, 0.1)',
                                }
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {/* Remove Button */}
                        <IconButton
                          size="small"
                          onClick={() => removeFromHomeCart(item._id)}
                          sx={{
                            color: '#e74c3c',
                            background: 'rgba(231, 76, 60, 0.1)',
                            '&:hover': {
                              background: 'rgba(231, 76, 60, 0.2)',
                            },
                            alignSelf: 'flex-start'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                  </Paper>
                </Slide>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {homeCartItems.length > 0 && (
          <Paper
            elevation={1}
            sx={{
              mt: 'auto',
              pt: 2,
              background: theme => theme.palette.background.paper,
              borderRadius: 2,
              border: theme => `1px solid ${theme.palette.divider}`,
              boxShadow: theme => theme.shadows[1],
            }}
          >
            <Divider sx={{ mb: 2 }} />
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              px: 2
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: 14 }}>
                Tổng cộng:
              </Typography>
              <Typography variant="body1" color="primary" fontWeight={700} sx={{ fontSize: 15 }}>
                {totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Typography>
            </Box>
            <Box sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleConfirmCart}
                disabled={cartLoading}
                startIcon={cartLoading ? <CircularProgress size={16} /> : <ShoppingCartIcon />}
                sx={{
                  background: theme => theme.palette.primary.main,
                  color: theme => theme.palette.primary.contrastText,
                  py: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  boxShadow: theme => theme.shadows[1],
                  letterSpacing: 0.2,
                  transition: 'background 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: theme => theme.palette.primary.dark,
                    boxShadow: theme => theme.shadows[2],
                  },
                  '&:disabled': {
                    background: theme => theme.palette.action.disabled,
                    color: theme => theme.palette.text.disabled,
                    boxShadow: 'none',
                  }
                }}
              >
                {cartLoading ? 'Đang xử lý...' : 'Xác nhận giỏ hàng'}
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Paper>
  );
};

export default HomeCartSidebar; 