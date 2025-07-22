/* eslint-disable */
'use client';
import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CardMedia,
  Button,
  IconButton,
  Stack,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCartContext } from '@/context/CartContext';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createVnpayPayment } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile';

// Extend CartItem interface to include _id
interface ProductSize {
  size: string;
  stock: number;
  color?: string;
}

interface CartItemWithId {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    brand?: { _id: string; name: string };
    sizes?: ProductSize[];
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
  const [couponInputs, setCouponInputs] = useState<{ [cartItemId: string]: string }>({});
  const [appliedCoupons, setAppliedCoupons] = useState<{
    [cartItemId: string]:
      | { code: string; newPrice: number; discountAmount: number; message: string }
      | undefined;
  }>({});
  const [couponError, setCouponError] = useState<string>('');
  const [applyingCouponId, setApplyingCouponId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [promoCodeExpanded, setPromoCodeExpanded] = useState(false);
  const t = useTranslations('cartPage');
  const { isAuthenticated, getCurrentUser } = useAuth();
  const blackBorderStyle = {
    borderRadius: 0,
    border: '2px solid black',
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      '& fieldset': { borderColor: 'black', borderWidth: 2 },
      '&:hover fieldset': { borderColor: 'black' },
      '&.Mui-focused fieldset': { borderColor: 'black' },
    },
    '& .MuiInputLabel-root': {
      color: 'black',
      '&.Mui-focused': { color: 'black' },
    },
  };

  // Prevent form submission that could cause page reload
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Nike-style typography
  const nikeTypography = {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontWeight: 700,
    letterSpacing: '0.02em',
  };

  const nikeButtonStyle = {
    borderRadius: 0,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    py: 1.5,
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  };

  if (!token) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 0,
            border: '2px solid black',
            textAlign: 'center',
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'black', mb: 2 }} />
          <Typography
            variant="h4"
            sx={{
              ...nikeTypography,
              color: 'black',
              mb: 2,
              textTransform: 'uppercase',
            }}
          >
            {t('loginToViewCart')}
          </Typography>
          <Button
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              const currentLocale = window.location.pathname.split('/')[1];
              const loginUrl =
                currentLocale === 'en' || currentLocale === 'vi'
                  ? `/${currentLocale}/auth/login`
                  : '/vi/auth/login';
              router.push(loginUrl);
            }}
            sx={{
              ...nikeButtonStyle,
              bgcolor: 'black',
              color: 'white',
              '&:hover': { bgcolor: 'gray.800' },
              mt: 2,
            }}
          >
            {t('login')}
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 0,
            border: '2px solid black',
            textAlign: 'center',
          }}
        >
          <CircularProgress sx={{ color: 'black' }} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 0,
            border: '2px solid black',
          }}
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: 0,
              border: '2px solid #d32f2f',
              bgcolor: '#ffebee',
              color: 'black',
              fontWeight: 600,
            }}
          >
            {error}
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 0,
            border: '2px solid black',
            textAlign: 'center',
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'black', mb: 2 }} />
          <Typography
            variant="h4"
            sx={{
              ...nikeTypography,
              color: 'black',
              mb: 1,
              textTransform: 'uppercase',
            }}
          >
            {t('cartEmpty')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'gray',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              mb: 3,
            }}
          >
            {t('noProductsInCart')}
          </Typography>
          <Button
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              router.push('/');
            }}
            sx={{
              ...nikeButtonStyle,
              bgcolor: 'black',
              color: 'white',
              '&:hover': { bgcolor: 'gray.800' },
            }}
          >
            {t('continueShopping')}
          </Button>
        </Paper>
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
      alert('Có lỗi khi cập nhật số lượng. Vui lòng thử lại.');
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
      alert('Có lỗi khi xóa sản phẩm. Vui lòng thử lại.');
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

  const handleUpdateItemOptions = async (
    cartItemId: string,
    newSize?: string,
    newColor?: string
  ) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await updateCartItem(cartItemId, undefined, newSize, newColor);
    } catch (error) {
      console.error('Error updating item options:', error);
      alert('Có lỗi khi cập nhật size/màu. Vui lòng thử lại.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.cartItems.length === 0) return;

    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán');
      return;
    }

    const itemsWithoutSizeOrColor = cart.cartItems.filter(item => {
      const cartItem = item as CartItemWithId;
      return !cartItem.size || !cartItem.color;
    });

    if (itemsWithoutSizeOrColor.length > 0) {
      const itemNames = itemsWithoutSizeOrColor.map(item => item.product.name).join(', ');
      alert(`Vui lòng chọn size và màu cho các sản phẩm sau: ${itemNames}`);
      return;
    }

    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');

      if (!token) {
        alert('Token không tồn tại, vui lòng đăng nhập lại');
        return;
      }

      document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Lax`;
      console.log('Token saved to cookies for VNPAY return');

      let currentUser;
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        currentUser = {
          id: payload.id || payload._id,
          email: payload.email,
          role: payload.role,
        };
        console.log('Current user from token:', currentUser);
        console.log('Token payload:', payload);
      } catch (error) {
        console.error('Error decoding token:', error);
        alert('Token không hợp lệ, vui lòng đăng nhập lại');
        return;
      }

      if (!currentUser || !currentUser.id) {
        alert('Không thể lấy thông tin người dùng từ token');
        return;
      }

      let userProfile;
      try {
        console.log('Calling profile service...');
        userProfile = await profileService.getProfile();
        console.log('User profile:', userProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        console.error('Error details:', error);
        alert('Không thể lấy thông tin profile');
        return;
      }

      const defaultAddress =
        userProfile.addresses?.find(addr => addr.isDefault) || userProfile.addresses?.[0];

      if (!defaultAddress) {
        alert('Vui lòng thêm địa chỉ giao hàng trong profile');
        return;
      }

      console.log('Default address:', defaultAddress);

      const vnpayData = {
        vnp_Amount: total,
        vnp_IpAddr: '127.0.0.1',
        vnp_ReturnUrl: `${window.location.origin}/payment/vnpay-return`,
        vnp_TxnRef: `ORDER_${Date.now()}`,
        vnp_OrderInfo: `Thanh toan don hang ${Date.now()}`,
        vnp_ExpireDate: Math.floor((Date.now() + 15 * 60 * 1000) / 1000),
        vnp_CreateDate: Math.floor(Date.now() / 1000),
        orderItems: cart.cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          size: [
            {
              size: item.size || 'M',
              color: item.color || 'Default',
              quantity: item.quantity,
            },
          ],
          price: item.product.discountPrice || item.product.price,
        })),
        shippingAddress: {
          fullName: defaultAddress.recipientName || userProfile.fullName,
          phone: userProfile.phone,
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.addressNumber,
          country: defaultAddress.country,
        },
        paymentMethod: 'VNPAY',
        totalPrice: total,
        taxPrice: 0,
        shippingPrice: 50000, // Luôn là 50.000 VND
        user: currentUser.id, // Thêm user ID để backend có thể lấy thông tin
      };

      console.log('VNPAY data:', vnpayData);

      const paymentUrl = await createVnpayPayment(vnpayData);
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getDiscountedPrice = (cartItem: CartItemWithId) => {
    const applied = appliedCoupons[cartItem._id];
    if (applied && applied.newPrice) return applied.newPrice;
    if (!cartItem.product) return 0;
    return cartItem.product?.discountPrice || cartItem.product?.price || 0;
  };

  const calculateSubtotal = () => {
    return cart.cartItems.reduce((total, item) => {
      const cartItem = item as CartItemWithId;
      const price = getDiscountedPrice(cartItem);
      return total + price * cartItem.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 50000;
  const total = subtotal + shipping;

  const hasIncompleteItems = cart.cartItems.some(item => {
    const cartItem = item as CartItemWithId;
    return !cartItem.size || !cartItem.color;
  });

  const handleApplyCoupon = async (cartItem: CartItemWithId) => {
    const code = couponInputs[cartItem._id];
    if (!code) return;
    setApplyingCouponId(cartItem._id);
    setCouponError('');
    try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/coupon/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: code,
          productId: cartItem.product?._id || '',
          price: cartItem.product ? cartItem.product?.discountPrice || cartItem.product?.price : 0,
          quantity: cartItem.quantity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupons(v => ({
          ...v,
          [cartItem._id]: {
            code,
            newPrice: data.newPrice,
            discountAmount: data.discountAmount,
            message: data.message,
          },
        }));
        setCouponInputs(v => {
          const newV = { ...v };
          delete newV[cartItem._id];
          return newV;
        });
      } else {
        setCouponError(data.message || 'Coupon không hợp lệ');
        console.log('Coupon error details:', data);
      }
    } catch (err) {
      setCouponError('Có lỗi khi áp dụng coupon');
      console.error('Coupon application error:', err);
    } finally {
      setApplyingCouponId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} onSubmit={handleFormSubmit}>
      {/* Nike-style Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            ...nikeTypography,
            color: 'black',
            mb: 1,
            textTransform: 'uppercase',
            fontSize: '2.5rem',
          }}
        >
          {t('cart')} ({cart.cartItems.length})
        </Typography>
      </Box>

      {/* Continue Shopping Link */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            router.push('/');
          }}
          sx={{
            color: 'black',
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: '0.875rem',
            p: 0,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          ‹ {t('continueShopping')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        {/* Main Cart Content - Left Side */}
        <Box sx={{ flex: { lg: 2 } }}>
          <Stack spacing={2}>
            {cart.cartItems.map(item => {
              const cartItem = item as CartItemWithId;
              const isUpdating = updatingItems.has(cartItem._id);
              const price = cartItem.product
                ? cartItem.product?.discountPrice || cartItem.product?.price
                : 0;
              const originalPrice = cartItem.product?.price || 0;
              const discountedPrice = getDiscountedPrice(cartItem);
              const appliedCoupon = appliedCoupons[cartItem._id];
              
              return (
                <Paper
                  key={cartItem._id}
                  elevation={0}
                  sx={{
                    position: 'relative',
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    p: 3,
                    display: 'flex',
                    gap: 3,
                  }}
                  component="form"
                  onSubmit={handleFormSubmit}
                >
                  {isUpdating && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <CircularProgress size={24} sx={{ color: 'black' }} />
                    </Box>
                  )}

                  {/* Product Image */}
                  <Box sx={{ flex: '0 0 120px' }}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={cartItem.product?.images?.[0] || '/assets/images/placeholder.jpg'}
                        alt={cartItem.product?.name || 'Product'}
                      sx={{ objectFit: 'contain' }}
                      />
                  </Box>

                  {/* Product Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                        ...nikeTypography,
                            color: 'black',
                        mb: 1,
                        fontSize: '1rem',
                          }}
                        >
                          {cartItem.product?.name || 'Product Name Unavailable'}
                        </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                        color: '#666',
                              mb: 1,
                        fontSize: '0.875rem',
                            }}
                          >
                      Style#: {cartItem.product?._id?.slice(-8) || 'N/A'}
                          </Typography>

                    {/* Size and Color Selection */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          {cartItem.product?.sizes && cartItem.product?.sizes.length > 0 ? (
                            <FormControl
                              size="small"
                          sx={{ minWidth: 120 }}
                              disabled={isUpdating}
                            >
                              <InputLabel sx={{ color: 'black', fontWeight: 600 }}>
                                {t('size')}
                              </InputLabel>
                              <Select
                                value={cartItem.size || ''}
                                label={t('size')}
                            onChange={(e) => {
                              e.preventDefault();
                                  handleUpdateItemOptions(
                                    cartItem._id,
                                    e.target.value,
                                    cartItem.color
                              );
                            }}
                            sx={{ 
                              fontWeight: 600, 
                              textTransform: 'uppercase',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0',
                              },
                            }}
                                error={!cartItem.size}
                              >
                                {cartItem.product?.sizes
                                  ?.filter(
                                    sz =>
                                      !cartItem.color ||
                                      ('color' in sz && sz.color === cartItem.color)
                                  )
                                  .map((sz: ProductSize) => (
                                    <MenuItem
                                      key={sz.size + ('color' in sz && sz.color ? sz.color : '')}
                                      value={sz.size}
                                      disabled={sz.stock === 0}
                                      sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                                    >
                                      {sz.size}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          ) : (
                            cartItem.size && (
                              <Chip
                                label={`${t('size')}: ${cartItem.size}`}
                                size="small"
                                sx={{
                              border: '1px solid #e0e0e0',
                                  bgcolor: 'white',
                                  color: 'black',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}
                              />
                            )
                          )}

                          {cartItem.product?.sizes &&
                          cartItem.product?.sizes.some(sz => 'color' in sz && sz.color) ? (
                            <FormControl
                              size="small"
                          sx={{ minWidth: 120 }}
                              disabled={isUpdating}
                            >
                              <InputLabel sx={{ color: 'black', fontWeight: 600 }}>
                                {t('color')}
                              </InputLabel>
                              <Select
                                value={cartItem.color || ''}
                                label={t('color')}
                            onChange={(e) => {
                              e.preventDefault();
                                  handleUpdateItemOptions(
                                    cartItem._id,
                                    cartItem.size,
                                    e.target.value
                              );
                            }}
                            sx={{ 
                              fontWeight: 600, 
                              textTransform: 'uppercase',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0',
                              },
                            }}
                                error={!cartItem.color}
                              >
                                {[
                                  ...new Set(
                                    cartItem.product?.sizes?.map((sz: ProductSize) =>
                                      'color' in sz ? sz.color : undefined
                                    )
                                  ),
                                ].map(
                                  (color: string | undefined) =>
                                    color && (
                                      <MenuItem
                                        key={color}
                                        value={color}
                                        sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                                      >
                                        {color}
                                      </MenuItem>
                                    )
                                )}
                              </Select>
                            </FormControl>
                          ) : (
                            cartItem.color && (
                              <Chip
                                label={`${t('color')}: ${cartItem.color}`}
                                size="small"
                                sx={{
                              border: '1px solid #e0e0e0',
                                  bgcolor: 'white',
                                  color: 'black',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}
                              />
                            )
                          )}
                    </Box>

                    {/* Warning message */}
                        {(!cartItem.size || !cartItem.color) && (
                          <Alert
                            severity="warning"
                            sx={{
                          mb: 2,
                              borderRadius: 0,
                              border: '1px solid #ed6c02',
                              bgcolor: '#fff4e5',
                              color: '#ed6c02',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            {!cartItem.size && !cartItem.color
                              ? 'Vui lòng chọn size và màu để thanh toán'
                              : !cartItem.size
                                ? 'Vui lòng chọn size để thanh toán'
                                : 'Vui lòng chọn màu để thanh toán'}
                          </Alert>
                        )}

                    {/* Stock info */}
                        {cartItem.size && cartItem.color && cartItem.product?.sizes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                        sx={{ mb: 2, fontWeight: 600 }}
                          >
                            {t('stockLeft', {
                              stock:
                                cartItem.product?.sizes?.find(
                                  (sz: ProductSize) =>
                                    sz.size === cartItem.size &&
                                    'color' in sz &&
                                    sz.color === cartItem.color
                                )?.stock ?? 'N/A',
                            })}
                          </Typography>
                        )}

                    {/* Quantity Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Qty:
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          handleQuantityChange(cartItem._id, cartItem.quantity - 1);
                        }}
                        disabled={isUpdating || cartItem.quantity <= 1}
                        sx={{
                          border: '1px solid #e0e0e0',
                          color: 'black',
                          '&:hover': { bgcolor: '#f5f5f5' },
                          '&.Mui-disabled': { borderColor: '#e0e0e0', color: '#ccc' },
                        }}
                        size="small"
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        sx={{
                          minWidth: 40,
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}
                      >
                        {cartItem.quantity}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          const maxQuantity =
                            cartItem.product?.sizes?.find(
                              (sz: ProductSize) =>
                                sz.size === cartItem.size &&
                                'color' in sz &&
                                sz.color === cartItem.color
                            )?.stock ?? 1;
                          if (cartItem.quantity < maxQuantity) {
                            handleQuantityChange(cartItem._id, cartItem.quantity + 1);
                          }
                        }}
                        disabled={
                          isUpdating || 
                          cartItem.quantity >= (
                            cartItem.product?.sizes?.find(
                              (sz: ProductSize) =>
                                sz.size === cartItem.size &&
                                'color' in sz &&
                                sz.color === cartItem.color
                            )?.stock ?? 1
                          )
                        }
                        sx={{
                          border: '1px solid #e0e0e0',
                          color: 'black',
                          '&:hover': { bgcolor: '#f5f5f5' },
                          '&.Mui-disabled': { borderColor: '#e0e0e0', color: '#ccc' },
                        }}
                        size="small"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Voucher input */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        label="Coupon"
                        value={couponInputs[cartItem._id] || ''}
                        onChange={e =>
                          setCouponInputs(v => ({
                            ...v,
                            [cartItem._id]: e.target.value.toUpperCase(),
                          }))
                        }
                        sx={{ width: 140, ...blackBorderStyle }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        disabled={isUpdating || applyingCouponId === cartItem._id || !!appliedCoupon}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: 80,
                          borderRadius: 0,
                          fontWeight: 700,
                          ml: 1,
                          borderColor: 'black',
                          color: 'black',
                        }}
                        disabled={
                          isUpdating ||
                          !couponInputs[cartItem._id] ||
                          applyingCouponId === cartItem._id ||
                          !!appliedCoupon
                        }
                        onClick={() => handleApplyCoupon(cartItem)}
                      >
                        {applyingCouponId === cartItem._id ? 'Đang áp dụng...' : 'Áp dụng'}
                      </Button>
                      {appliedCoupon && (
                        <>
                          <Chip
                            label={`Đã áp dụng: ${appliedCoupon.code}`}
                            color="success"
                            size="small"
                            sx={{ ml: 1, fontWeight: 700, borderRadius: 0 }}
                            onDelete={() => {
                              setAppliedCoupons(v => {
                                const newV = { ...v };
                                delete newV[cartItem._id];
                                return newV;
                              });
                              setCouponInputs(v => {
                                const newV = { ...v };
                                delete newV[cartItem._id];
                                return newV;
                              });
                            }}
                          />
                          {appliedCoupon.message && (
                            <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                              {appliedCoupon.message}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                    {/* Hiển thị lỗi coupon */}
                    {couponError && (
                      <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                        {couponError}
                      </Typography>
                    )}
                    {/* Giá sản phẩm sau coupon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {discountedPrice !== originalPrice ? (
                        <>
                          <Typography
                            variant="h6"
                            sx={{ color: 'black', fontWeight: 900, letterSpacing: '0.02em' }}
                          >
                            {discountedPrice.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'gray', textDecoration: 'line-through', fontWeight: 600 }}
                          >
                            {originalPrice.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </Typography>
                          <Chip
                            label={`- ${Math.round(100 - (discountedPrice / originalPrice) * 100)}%`}
                            sx={{
                              bgcolor: 'black',
                              color: 'white',
                              fontWeight: 700,
                              borderRadius: 0,
                              ml: 1,
                            }}
                          />
                        </>
                      ) : (
                        <Typography
                          variant="h6"
                          sx={{ color: 'black', fontWeight: 900, letterSpacing: '0.02em' }}
                        >
                          {discountedPrice.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}
                        </Typography>
                      )}
                    </Box>

                    {/* Coupon Input */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TextField
                        size="small"
                        label="Coupon"
                        value={couponInputs[cartItem._id] || ''}
                        onChange={(e) => {
                          e.preventDefault();
                          setCouponInputs(v => ({
                            ...v,
                            [cartItem._id]: e.target.value.toUpperCase(),
                          }));
                        }}
                        sx={{ 
                          width: 140,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            '& fieldset': { borderColor: '#e0e0e0' },
                          },
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        disabled={isUpdating || applyingCouponId === cartItem._id}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: 80,
                          borderRadius: 0,
                          fontWeight: 700,
                          borderColor: '#e0e0e0',
                          color: 'black',
                          '&:hover': {
                            borderColor: 'black',
                            bgcolor: 'black',
                            color: 'white',
                          },
                        }}
                        disabled={
                          isUpdating ||
                          !couponInputs[cartItem._id] ||
                          applyingCouponId === cartItem._id
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          handleApplyCoupon(cartItem);
                        }}
                      >
                        {applyingCouponId === cartItem._id ? 'Đang áp dụng...' : 'Áp dụng'}
                      </Button>
                      {appliedCoupon && (
                        <>
                          <Chip
                            label={`Đã áp dụng: ${appliedCoupon.code}`}
                            color="success"
                            size="small"
                            sx={{ ml: 1, fontWeight: 700, borderRadius: 0 }}
                            onDelete={() => {
                              setAppliedCoupons(v => {
                                const newV = { ...v };
                                delete newV[cartItem._id];
                                return newV;
                              });
                            }}
                          />
                          {appliedCoupon.message && (
                            <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                              {appliedCoupon.message}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                    
                    {/* Coupon Error */}
                    {couponError && (
                      <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                        {couponError}
                      </Typography>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="text"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveItem(cartItem._id);
                        }}
                        disabled={isUpdating}
                            sx={{
                              color: 'black',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          p: 0,
                          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                            }}
                          >
                        {t('remove')}
                      </Button>
                      <Typography sx={{ color: '#ccc' }}>|</Typography>
                      <Button
                        variant="text"
                        onClick={(e) => {
                          e.preventDefault();
                          // Edit functionality - could navigate to product page
                          router.push(`/product/${cartItem.product._id}`);
                            }}
                            sx={{
                          color: 'black',
                          textTransform: 'uppercase',
                                fontWeight: 700,
                          fontSize: '0.875rem',
                          p: 0,
                          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                            }}
                      >
                        {t('edit')}
                      </Button>
                    </Box>
                  </Box>

                  {/* Price on the right */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Typography
                      variant="h6"
                            sx={{
                              color: 'black',
                        fontWeight: 900,
                        letterSpacing: '0.02em',
                        textAlign: 'right',
                            }}
                          >
                      {discountedPrice.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Box>

        {/* Order Summary - Right Side */}
        <Box sx={{ flex: { lg: 1 } }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              p: 3,
              height: 'fit-content',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                ...nikeTypography,
                color: 'black',
                mb: 3,
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              {t('orderSummary')}
            </Typography>

            {/* Warning về items chưa hoàn thành */}
            {hasIncompleteItems && (
              <Alert
                severity="warning"
                sx={{
                  mb: 3,
                  borderRadius: 0,
                  border: '1px solid #ed6c02',
                  bgcolor: '#fff4e5',
                  color: '#ed6c02',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {(() => {
                  const incompleteCount = cart.cartItems.filter(item => {
                    const cartItem = item as CartItemWithId;
                    return !cartItem.size || !cartItem.color;
                  }).length;
                  return `${incompleteCount} sản phẩm chưa chọn size hoặc màu. Vui lòng hoàn thành trước khi thanh toán.`;
                })()}
              </Alert>
            )}

            {/* Promo Code Section */}
            <Accordion
              expanded={promoCodeExpanded}
              onChange={(e, expanded) => setPromoCodeExpanded(expanded)}
              sx={{
                mb: 3,
                '& .MuiAccordionSummary-root': {
                  minHeight: 'auto',
                  p: 0,
                },
                '& .MuiAccordionDetails-root': {
                  p: 0,
                  pt: 2,
                },
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  p: 0,
                  '& .MuiAccordionSummary-content': {
                    m: 0,
                  },
                }}
              >
                <Typography
                  sx={{
                    ...nikeTypography,
                    color: 'black',
                    textTransform: 'uppercase',
                    fontSize: '0.875rem',
                  }}
                >
                  {t('promoCode')}?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter promo code"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      '& fieldset': { borderColor: '#e0e0e0' },
                    },
                  }}
                />
              </AccordionDetails>
            </Accordion>

            {/* Summary Details */}
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ ...nikeTypography, color: 'black', textTransform: 'uppercase' }}>
                  {t('subtotal')}:
                </Typography>
                <Typography sx={{ ...nikeTypography, color: 'black' }}>
                  {subtotal.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ ...nikeTypography, color: 'black', textTransform: 'uppercase' }}>
                  {t('shippingFee')}:
                </Typography>
                <Typography sx={{ ...nikeTypography, color: 'black' }}>
                  {shipping.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ ...nikeTypography, color: 'black', textTransform: 'uppercase' }}>
                  {t('tax')}:
                </Typography>
                <Typography sx={{ ...nikeTypography, color: 'black' }}>
                  ₫0
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#e0e0e0', my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="h6"
                  sx={{
                    ...nikeTypography,
                    color: 'black',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  {t('total')}:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    ...nikeTypography,
                    color: 'black',
                    letterSpacing: '0.02em',
                  }}
                >
                  {total.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Box>
            </Stack>

            {/* Checkout Buttons */}
            <Stack spacing={2} sx={{ mt: 4 }}>
              <Tooltip
                title={
                  hasIncompleteItems
                    ? 'Vui lòng chọn size và màu cho tất cả sản phẩm trước khi thanh toán'
                    : ''
                }
                placement="top"
              >
                <span>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCheckout();
                    }}
                    disabled={isProcessingPayment || hasIncompleteItems}
                    sx={{
                      ...nikeButtonStyle,
                      bgcolor: 'black',
                      color: 'white',
                      '&:hover': { bgcolor: 'gray.800' },
                      '&.Mui-disabled': {
                        bgcolor: 'gray.400',
                        color: 'gray.600',
                      },
                    }}
                  >
                    {isProcessingPayment ? 'Đang xử lý...' : t('checkout')}
                  </Button>
                </span>
              </Tooltip>

              <Typography
                sx={{
                  textAlign: 'center',
                  color: '#666',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {t('or')}
              </Typography>

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  ...nikeButtonStyle,
                  borderColor: '#0070ba',
                  color: '#0070ba',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#0070ba',
                    bgcolor: '#0070ba',
                    color: 'white',
                    borderWidth: 2,
                  },
                }}
              >
                Check out with PayPal
              </Button>

              {/* Clear Cart Button */}
              <Button
                variant="text"
                fullWidth
                onClick={(e) => {
                  e.preventDefault();
                  handleClearCart();
                }}
                sx={{
                  ...nikeButtonStyle,
                  color: 'black',
                  border: '2px solid transparent',
                  mt: 2,
                  '&:hover': {
                    bgcolor: 'black',
                    color: 'white',
                  },
                }}
              >
                {t('clearCart')}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
