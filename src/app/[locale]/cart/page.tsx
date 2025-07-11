'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Stack,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCartContext } from '@/context/CartContext';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Extend CartItem interface to include _id
interface CartItemWithId {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    brand?: { _id: string; name: string };
    sizes?: { size: string; stock: number }[];
    colors?: string[];
  };
  size?: string;
  color?: string;
  quantity: number;
}

export default function CartPage() {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart } = useCartContext();
  const { token } = useAuthContext();
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  if (!token) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Vui lòng đăng nhập để xem giỏ hàng
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/auth/login')}
            sx={{ mt: 2 }}
          >
            Đăng nhập
          </Button>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Giỏ hàng trống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
            sx={{ mt: 2 }}
          >
            Tiếp tục mua sắm
          </Button>
        </Box>
      </Container>
    );
  }

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const calculateSubtotal = () => {
    return cart.cartItems.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 0; // Có thể tính phí ship dựa trên địa chỉ
  const total = subtotal + shipping;

  const handleUpdateItemOptions = async (cartItemId: string, newSize?: string, newColor?: string) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await updateCartItem(cartItemId, undefined, newSize, newColor);
    } catch (error) {
      console.error('Error updating item options:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Giỏ hàng ({cart.cartItems.length} sản phẩm)
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Danh sách sản phẩm */}
        <Box sx={{ flex: { md: 2 } }}>
          <Stack spacing={2}>
            {cart.cartItems.map((item) => {
              const cartItem = item as CartItemWithId;
              const isUpdating = updatingItems.has(cartItem._id);
              const price = cartItem.product.discountPrice || cartItem.product.price;
              const originalPrice = cartItem.product.price;
              const isDiscounted = cartItem.product.discountPrice && cartItem.product.discountPrice < cartItem.product.price;

              return (
                <Card key={cartItem._id} sx={{ position: 'relative' }}>
                  {isUpdating && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: '0 0 80px' }}>
                        <CardMedia
                          component="img"
                          height="100"
                          image={cartItem.product.images[0] || '/assets/images/placeholder.jpg'}
                          alt={cartItem.product.name}
                          sx={{ objectFit: 'cover', borderRadius: 1 }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="h3" gutterBottom>
                              {cartItem.product.name}
                            </Typography>
                            {cartItem.product.brand && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {cartItem.product.brand.name}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              {/* Size */}
                              {cartItem.product.sizes && cartItem.product.sizes.length > 0 ? (
                                <FormControl size="small" sx={{ minWidth: 90 }} disabled={isUpdating}>
                                  <InputLabel>Size</InputLabel>
                                  <Select
                                    value={cartItem.size || ''}
                                    label="Size"
                                    onChange={e => handleUpdateItemOptions(cartItem._id, e.target.value, cartItem.color)}
                                  >
                                    {cartItem.product.sizes.map((sz: any) => (
                                      <MenuItem key={sz.size} value={sz.size} disabled={sz.stock === 0}>
                                        {sz.size} {sz.stock === 0 ? '(Hết hàng)' : `(Còn ${sz.stock})`}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              ) : (
                                cartItem.size && <Chip label={`Size: ${cartItem.size}`} size="small" variant="outlined" />
                              )}
                              {/* Color */}
                              {cartItem.product.colors && cartItem.product.colors.length > 0 ? (
                                <FormControl size="small" sx={{ minWidth: 90 }} disabled={isUpdating}>
                                  <InputLabel>Màu</InputLabel>
                                  <Select
                                    value={cartItem.color || ''}
                                    label="Màu"
                                    onChange={e => handleUpdateItemOptions(cartItem._id, cartItem.size, e.target.value)}
                                  >
                                    {cartItem.product.colors.map((color: string) => (
                                      <MenuItem key={color} value={color}>{color}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              ) : (
                                cartItem.color && <Chip label={`Màu: ${cartItem.color}`} size="small" variant="outlined" />
                              )}
                            </Stack>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isDiscounted ? (
                                <>
                                  <Typography variant="h6" color="error" fontWeight="bold">
                                    {price.toLocaleString('vi-VN', {
                                      style: 'currency',
                                      currency: 'VND',
                                    })}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textDecoration: 'line-through' }}
                                  >
                                    {originalPrice.toLocaleString('vi-VN', {
                                      style: 'currency',
                                      currency: 'VND',
                                    })}
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                  {price.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  })}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => handleRemoveItem(cartItem._id)}
                            disabled={isUpdating}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                          <IconButton
                            onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity - 1)}
                            disabled={isUpdating || cartItem.quantity <= 1}
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            value={cartItem.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              handleQuantityChange(cartItem._id, newQuantity);
                            }}
                            size="small"
                            sx={{ width: 60 }}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                            disabled={isUpdating}
                          />
                          <IconButton
                            onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity + 1)}
                            disabled={isUpdating}
                            size="small"
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>

        {/* Tổng quan giỏ hàng */}
        <Box sx={{ flex: { md: 1 } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng quan đơn hàng
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Tạm tính:</Typography>
                  <Typography>
                    {subtotal.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Phí vận chuyển:</Typography>
                  <Typography>
                    {shipping.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">
                    Tổng cộng:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {total.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => router.push('/profile')}
                >
                  Tiến hành thanh toán
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => router.push('/')}
                >
                  Tiếp tục mua sắm
                </Button>
                <Button
                  variant="text"
                  color="error"
                  fullWidth
                  onClick={handleClearCart}
                >
                  Xóa giỏ hàng
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
} 