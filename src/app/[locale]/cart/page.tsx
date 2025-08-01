/* eslint-disable */
"use client";
import { useState, useEffect } from "react";
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
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCartContext } from "@/context/CartContext";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createVnpayPayment } from "@/services/api";
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile';
import React from 'react';
import SizeRecommender from '@/components/SizeRecommender';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

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

// Reusable styles
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

const commonAlertStyles = {
  borderRadius: 0,
  border: '2px solid',
  bgcolor: '#ffebee',
  color: 'black',
  fontWeight: 600,
};

// Component con cho chọn size/màu
interface CartItemOptionsProps {
  cartItem: CartItemWithId;
  isUpdating: boolean;
  handleUpdateItemOptions: (cartItemId: string, newSize?: string, newColor?: string) => void;
  t: (key: string) => string;
}

function CartItemOptions({ cartItem, isUpdating, handleUpdateItemOptions, t }: CartItemOptionsProps) {
  const [localSize, setLocalSize] = useState(cartItem.size);
  const [localColor, setLocalColor] = useState(cartItem.color);
  const [pending, setPending] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === THEME.DARK;

  // Update local state when cartItem props change (e.g., after successful update from context)
  useEffect(() => {
    setLocalSize(cartItem.size);
    setLocalColor(cartItem.color);
  }, [cartItem.size, cartItem.color]);

  const handleSizeChange = async (newSize: string) => {
    setLocalSize(newSize); // UI phản hồi ngay
    setPending(true);
    try {
      await handleUpdateItemOptions(cartItem._id, newSize, localColor);
    } catch {
      setLocalSize(cartItem.size); // rollback nếu lỗi
    } finally {
      setPending(false);
    }
  };

  const handleColorChange = async (newColor: string) => {
    setLocalColor(newColor);
    setPending(true);
    try {
      await handleUpdateItemOptions(cartItem._id, localSize, newColor);
    } catch {
      setLocalColor(cartItem.color);
    } finally {
      setPending(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
      {/* Size */}
      {cartItem.product?.sizes && cartItem.product?.sizes.length > 0 ? (
        <FormControl size="small" sx={{ minWidth: 80, mr: 1 }}>
          <InputLabel sx={{ fontSize: 13 }}>{t('size')}</InputLabel>
          <Select
            value={localSize || ''}
            label={t('size')}
            onChange={e => handleSizeChange(e.target.value)}
            sx={{ fontSize: 13 }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
            disabled={isUpdating || pending}
          >
            {(cartItem.product?.sizes as ProductSize[])
              ?.filter((sz: ProductSize) => !localColor || ('color' in sz && sz.color === localColor))
              .map((sz: ProductSize) => (
                <MenuItem
                  key={sz.size + ('color' in sz && sz.color ? sz.color : '')}
                  value={sz.size}
                  disabled={sz.stock === 0}
                  sx={{ fontSize: 13 }}
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
              borderRadius: 0, 
              border: `1px solid ${isDarkMode ? '#fff' : 'black'}`, 
              bgcolor: isDarkMode ? '#333' : 'white', 
              color: isDarkMode ? '#fff' : 'black', 
              fontWeight: 700, 
              textTransform: 'uppercase' 
            }}
          />
        )
      )}
      {/* Color */}
      {cartItem.product?.sizes && cartItem.product?.sizes.some((sz: ProductSize) => 'color' in sz && sz.color) && (
        <FormControl size="small" sx={{ minWidth: 80, mr: 1 }}>
          <InputLabel sx={{ fontSize: 13 }}>{t('color')}</InputLabel>
          <Select
            value={localColor || ''}
            label={t('color')}
            onChange={e => handleColorChange(e.target.value)}
            sx={{ fontSize: 13 }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
            disabled={isUpdating || pending}
          >
            {Array.from(new Set((cartItem.product?.sizes as ProductSize[]).map((sz: ProductSize) => 'color' in sz ? sz.color : undefined)))
              .filter((color): color is string => !!color)
              .map((color: string) => (
                <MenuItem
                  key={color}
                  value={color}
                  sx={{ fontSize: 13 }}
                >
                  {color}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}

export default function CartPage() {
  // Add CSS animation for pulse effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const { cart, loading, error, updateCartItem, removeFromCart, clearCart, refreshCart } = useCartContext();
  const { token } = useAuthContext();
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [couponInputs, setCouponInputs] = useState<{ [cartItemId: string]: string }>({});
  const [appliedCoupons, setAppliedCoupons] = useState<{
    [cartItemId: string]:
      | { code: string; newPrice: number; discountAmount: number; message: string; originalPrice?: number }
      | undefined;
  }>({});
  const [couponErrors, setCouponErrors] = useState<{ [cartItemId: string]: string }>({});
  const [applyingCouponId, setApplyingCouponId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [promoCodeExpanded, setPromoCodeExpanded] = useState(false);
  const t = useTranslations('cartPage');
  const { isAuthenticated } = useAuth();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { theme } = useTheme();

  const [localCartItems, setLocalCartItems] = useState<CartItemWithId[]>(cart?.cartItems as CartItemWithId[] || []);
  useEffect(() => {
    if (cart?.cartItems) setLocalCartItems(cart.cartItems as CartItemWithId[]);
  }, [cart?.cartItems]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("appliedCoupons", JSON.stringify(appliedCoupons));
    }
  }, [appliedCoupons]);

  useEffect(() => {
    if (cart?.cartItems && selectedItems.size === 0) {
      setSelectedItems(new Set(cart.cartItems.map((item: any) => item._id)));
    }
     
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

    // Theme-aware styles
  const isDarkMode = theme === THEME.DARK;
  
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

  const blackBorderStyle = {
    borderRadius: 0,
    border: `2px solid ${isDarkMode ? '#fff' : 'black'}`,
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      '& fieldset': { borderColor: isDarkMode ? '#fff' : 'black', borderWidth: 2 },
      '&:hover fieldset': { borderColor: isDarkMode ? '#fff' : 'black' },
      '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#fff' : 'black' },
    },
    '& .MuiInputLabel-root': {
      color: isDarkMode ? '#fff' : 'black',
      '&.Mui-focused': { color: isDarkMode ? '#fff' : 'black' },
    },
  };

  const commonPaperStyles = {
    p: 4,
    bgcolor: isDarkMode ? '#1e1e1e' : 'white',
    borderRadius: 0,
    border: `2px solid ${isDarkMode ? '#333' : 'black'}`,
    color: isDarkMode ? '#fff' : 'black',
  };

  const commonAlertStyles = {
    borderRadius: 0,
    border: '2px solid',
    bgcolor: isDarkMode ? '#2a1a1a' : '#ffebee',
    color: isDarkMode ? '#ffcdd2' : 'black',
    fontWeight: 600,
  };

  if (!token) {
    return (
      <Box sx={{ py: 4, width: '100%' }}>
        <Paper sx={{ ...commonPaperStyles, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: isDarkMode ? '#fff' : 'black', mb: 2 }} />
          <Typography
            variant="h4"
            sx={{
              ...nikeTypography,
              color: isDarkMode ? '#fff' : 'black',
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
              bgcolor: isDarkMode ? '#fff' : 'black',
              color: isDarkMode ? 'black' : 'white',
              '&:hover': { bgcolor: isDarkMode ? '#e0e0e0' : 'gray.800' },
              mt: 2,
            }}
          >
            {t('login')}
          </Button>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, width: '100%' }}>
        <Paper sx={{ ...commonPaperStyles, textAlign: 'center' }}>
          <CircularProgress sx={{ color: isDarkMode ? '#fff' : 'black' }} />
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, width: '100%' }}>
        <Paper sx={commonPaperStyles}>
          <Alert
            severity="error"
            sx={{ ...commonAlertStyles, borderColor: '#d32f2f', bgcolor: isDarkMode ? '#2d1b1b' : '#ffebee' }}
          >
            {error}
                      </Alert>
          </Paper>
        </Box>
      );
    }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <Box sx={{ 
        py: 8, 
        px: 0,
        bgcolor: isDarkMode ? '#121212' : 'transparent',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}>
        <Paper sx={{ 
          ...commonPaperStyles, 
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          p: 6,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decorative element */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Shopping cart icon with better styling */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4
            }}>
              <Box sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `3px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                mb: 3
              }}>
                <ShoppingCartIcon sx={{ 
                  fontSize: 60, 
                  color: isDarkMode ? '#fff' : 'black',
                  opacity: 0.7
                }} />
              </Box>
            </Box>

            {/* Main title with Vietnamese-friendly font */}
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 800,
                color: isDarkMode ? '#fff' : 'black',
                mb: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                lineHeight: 1.2,
                textShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {t('cartEmpty')}
            </Typography>

            {/* Subtitle with better typography */}
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 400,
                color: isDarkMode ? '#aaa' : '#666',
                textTransform: 'none',
                letterSpacing: '0.02em',
                fontSize: { xs: '1rem', sm: '1.125rem' },
                mb: 4,
                lineHeight: 1.5,
                maxWidth: 400,
                mx: 'auto'
              }}
            >
              {t('noProductsInCart')}
            </Typography>

            {/* Continue shopping button with enhanced styling */}
            <Button
              variant="contained"
              onClick={(e) => {
                e.preventDefault();
                router.push('/');
              }}
              sx={{
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                py: 2,
                px: 4,
                borderRadius: '8px',
                bgcolor: isDarkMode ? '#fff' : 'black',
                color: isDarkMode ? 'black' : 'white',
                border: `2px solid ${isDarkMode ? '#fff' : 'black'}`,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: isDarkMode ? '#e0e0e0' : 'gray.800',
                  transform: 'translateY(-2px)',
                  boxShadow: isDarkMode 
                    ? '0 8px 25px rgba(255,255,255,0.2)' 
                    : '0 8px 25px rgba(0,0,0,0.15)'
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: 'none'
                }
              }}
            >
              {t('continueShopping')}
            </Button>

            {/* Additional decorative elements */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mt: 4,
              opacity: 0.3
            }}>
              {[1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isDarkMode ? '#fff' : 'black',
                    animation: `pulse 2s infinite ${i * 0.3}s`
                  }}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    // Optimistically update the UI
    setLocalCartItems(prevItems =>
      prevItems.map(item =>
        item._id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Có lỗi khi cập nhật số lượng. Vui lòng thử lại.');
      // Revert UI on error
      setLocalCartItems(cart?.cartItems as CartItemWithId[] || []);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleUpdateItemOptions = async (cartItemId: string, newSize?: string, newColor?: string) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    const prevItems = [...localCartItems]; // Store current state for rollback
    setLocalCartItems(items => items.map(item =>
      item._id === cartItemId ? { ...item, size: newSize, color: newColor } : item
    ));
    try {
      await updateCartItem(cartItemId, undefined, newSize, newColor);
    } catch (error) {
      setLocalCartItems(prevItems); // rollback if error
      console.error('Error updating item options:', error);
      alert('Có lỗi khi cập nhật tùy chọn. Vui lòng thử lại.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleApplyCoupon = async (cartItem: CartItemWithId) => {
    const code = couponInputs[cartItem._id];
    if (!code) return;
    setApplyingCouponId(cartItem._id);
    setCouponErrors(v => ({ ...v, [cartItem._id]: '' }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com'}/coupon/apply`, {
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
            originalPrice: data.originalPrice, // Add originalPrice to appliedCoupons
          },
        }));
        setCouponInputs(v => {
          const newV = { ...v };
          delete newV[cartItem._id];
          return newV;
        });
        setCouponErrors(v => {
          const newV = { ...v };
          delete newV[cartItem._id];
          return newV;
        });
      } else {
        setCouponErrors(v => ({ ...v, [cartItem._id]: data.message || 'Coupon không hợp lệ' }));
        console.log('Coupon error details:', data);
      }
    } catch (err) {
      setCouponErrors(v => ({ ...v, [cartItem._id]: 'Có lỗi khi áp dụng coupon' }));
      console.error('Coupon application error:', err);
    } finally {
      setApplyingCouponId(null);
    }
  };

  const handleSelectItem = (cartItemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cartItemId)) {
        newSet.delete(cartItemId);
      } else {
        newSet.add(cartItemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === localCartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(localCartItems.map((item: any) => item._id)));
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await removeFromCart(cartItemId);
      if (typeof refreshCart === 'function') await refreshCart();
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
      setLocalCartItems(prevItems => prevItems.filter(item => item._id !== cartItemId));
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
      if (typeof refreshCart === 'function') await refreshCart();
      setSelectedItems(new Set());
      setLocalCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.cartItems.length === 0) return;
    const selectedCartItems = localCartItems.filter((item: any) => selectedItems.has(item._id));
    if (selectedCartItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
      return;
    }
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán');
      return;
    }
    const itemsWithoutSizeOrColor = selectedCartItems.filter(item => {
      const cartItem = item as CartItemWithId;
      return (cartItem.product?.sizes && cartItem.product?.sizes.length > 0 && !cartItem.size) ||
             (cartItem.product?.sizes && cartItem.product?.sizes.some(s => s.color) && !cartItem.color);
    });
    if (itemsWithoutSizeOrColor.length > 0) {
      const itemNames = itemsWithoutSizeOrColor.map(item => item.product.name).join(', ');
      alert(`Vui lòng chọn size và màu cho các sản phẩm sau: ${itemNames}`);
      return;
    }

    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Token không tồn tại, vui lòng đăng nhập lại');
        return;
      }
      document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Lax`;
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
      } catch (error) {
        alert('Token không hợp lệ, vui lòng đăng nhập lại');
        return;
      }
      if (!currentUser || !currentUser.id) {
        alert('Không thể lấy thông tin người dùng từ token');
        return;
      }
      let userProfile;
      try {
        userProfile = await profileService.getProfile();
      } catch (error) {
        alert('Không thể lấy thông tin profile');
        return;
      }
      const defaultAddress =
        userProfile.addresses?.find(addr => addr.isDefault) || userProfile.addresses?.[0];
      if (!defaultAddress) {
        alert('Vui lòng thêm địa chỉ giao hàng trong profile');
        return;
      }
      const vnpayData = {
        vnp_Amount: selectedCartItems.reduce((sum, item) => sum + getDiscountedPrice(item as CartItemWithId) * item.quantity, 0),
        vnp_IpAddr: '127.0.0.1',
        vnp_ReturnUrl: `${window.location.origin}/payment/vnpay-return`,
        vnp_TxnRef: `ORDER_${Date.now()}`,
        vnp_OrderInfo: `Thanh toan don hang ${Date.now()}`,
        vnp_ExpireDate: Math.floor((Date.now() + 15 * 60 * 1000) / 1000),
        vnp_CreateDate: Math.floor(Date.now() / 1000),
        orderItems: selectedCartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          size: [
            {
              size: item.size || 'M', // Default to 'M' if size not selected (should be caught by validation)
              color: item.color || 'Default', // Default to 'Default' if color not selected (should be caught by validation)
              quantity: item.quantity,
            },
          ],
          price: getDiscountedPrice(item as CartItemWithId),
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
        totalPrice: selectedCartItems.reduce((sum, item) => sum + getDiscountedPrice(item as CartItemWithId) * item.quantity, 0),
        taxPrice: 0,
        shippingPrice: 50000,
        user: currentUser.id,
      };
      const paymentUrl = await createVnpayPayment(vnpayData);
      window.location.href = paymentUrl;
    } catch (error) {
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

  const productSubtotal = localCartItems
    .filter(item => selectedItems.has((item as CartItemWithId)._id))
    .reduce((total, item) => {
      const cartItem = item as CartItemWithId;
      const price = cartItem.product?.discountPrice || cartItem.product?.price || 0;
      return total + price * cartItem.quantity;
    }, 0);

  const productCouponDiscount = localCartItems
    .filter(item => selectedItems.has((item as CartItemWithId)._id))
    .reduce((total, item) => {
      const cartItem = item as CartItemWithId;
      const applied = appliedCoupons[cartItem._id];
      if (applied && applied.newPrice) {
        const price = cartItem.product?.discountPrice || cartItem.product?.price || 0;
        return total + (price - applied.newPrice) * cartItem.quantity;
      }
      return total;
    }, 0);

  const shippingVoucher = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('shippingDiscount') || 'null') : null;
  const shippingFee = 30000;
  const shippingDiscount = shippingVoucher?.amount || 0;

  const total = productSubtotal + shippingFee - shippingDiscount - productCouponDiscount;

  const selectedCartItems = localCartItems.filter((item: any) => selectedItems.has(item._id));
  const hasIncompleteSelectedItems = selectedCartItems.some(item => {
    const cartItem = item as CartItemWithId;
    return (cartItem.product?.sizes && cartItem.product?.sizes.length > 0 && !cartItem.size) ||
           (cartItem.product?.sizes && cartItem.product?.sizes.some(s => s.color) && !cartItem.color);
  });


  return (
    <Box sx={{ 
      py: 4, 
      px: 0,
      bgcolor: isDarkMode ? '#121212' : 'transparent',
      minHeight: '100vh',
      width: '100%'
    }} onSubmit={handleFormSubmit}>
      {/* Nike-style Header */}
      <Box sx={{ mb: 4, px: 0, mt: 10 }}>
        <Typography
          variant="h3"
          sx={{
            ...nikeTypography,
            color: isDarkMode ? '#fff' : 'black',
            mb: 1,
            textTransform: 'uppercase',
            fontSize: '2.5rem',
          }}
        >
          {t('cart')} ({cart.cartItems.length})
        </Typography>
      </Box>

      {/* Continue Shopping Link */}
      <Box sx={{ mb: 3, px: 0 }}>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            router.push('/');
          }}
          sx={{
            color: isDarkMode ? '#fff' : 'black',
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: '0.875rem',
            p: 0,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          {t('productCount', { count: localCartItems.length })}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, px: 0 }}>
        {/* Danh sách sản phẩm */}
        <Box sx={{ flex: { lg: 2.5 } }}>
          <Stack spacing={3}>
            {/* Chọn tất cả */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, cursor: 'pointer' }} onClick={handleSelectAll}>
              <Checkbox
                checked={selectedItems.size === localCartItems.length}
                indeterminate={selectedItems.size > 0 && selectedItems.size < localCartItems.length}
                onChange={handleSelectAll}
                sx={{ p: 0, mr: 1 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 700, color: isDarkMode ? "#fff" : "black", userSelect: 'none' }}>
                Chọn tất cả
              </Typography>
            </Box>
            {localCartItems.map((item) => {
              const cartItem = item as CartItemWithId;
              const isUpdating = updatingItems.has(cartItem._id);
              const originalPrice = cartItem.product?.price || 0;
              const discountedPrice = getDiscountedPrice(cartItem);
              const appliedCoupon = appliedCoupons[cartItem._id];
              const maxQuantity = cartItem.product?.sizes?.find(sz => sz.size === cartItem.size && sz.color === cartItem.color)?.stock ?? 1;

              return (
                <Paper
                  key={cartItem._id}
                  elevation={0}
                  sx={{
                    position: 'relative',
                    bgcolor: isDarkMode ? '#1e1e1e' : 'white',
                    border: `2px solid ${isDarkMode ? '#333' : 'black'}`,
                    borderRadius: '8px',
                    p: 4,
                    display: 'flex',
                    alignItems: 'flex-start',
                    minHeight: 280,
                    opacity: isUpdating ? 0.7 : 1,
                    color: isDarkMode ? '#fff' : 'black',
                    boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Checkbox chọn sản phẩm */}
                  <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>
                    <Checkbox
                      checked={selectedItems.has(cartItem._id)}
                      onChange={() => handleSelectItem(cartItem._id)}
                      sx={{ p: 0 }}
                    />
                  </Box>
                  {isUpdating && (
                                          <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: isDarkMode ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1,
                        }}
                      >
                      <CircularProgress size={24} sx={{ color: isDarkMode ? '#fff' : 'black' }} />
                    </Box>
                  )}
                  {/* Product Image */}
                  <Box sx={{ flex: '0 0 140px', mr: 4 }}>
                    <Box
                      sx={{
                        border: `2px solid ${isDarkMode ? '#fff' : 'black'}`,
                        borderRadius: '4px',
                        p: 2,
                        bgcolor: isDarkMode ? '#333' : '#f6f6f6',
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        width="120"
                        image={cartItem.product?.images?.[0] || '/assets/images/placeholder.jpg'}
                        alt={cartItem.product?.name || 'Product'}
                        sx={{ objectFit: 'contain', borderRadius: 0 }}
                      />
                    </Box>
                  </Box>
                  {/* Vùng thông tin sản phẩm, click để chọn/bỏ chọn */}
                  <Box
                    sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
                    onClick={() => handleSelectItem(cartItem._id)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h5"
                          component="h3"
                          sx={{
                            fontWeight: 900,
                            color: isDarkMode ? '#fff' : 'black',
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            fontSize: '1.25rem',
                          }}
                        >
                          {cartItem.product?.name || 'Product Name Unavailable'}
                        </Typography>
                        {cartItem.product?.brand && (
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              color: isDarkMode ? '#ccc' : 'gray',
                              mb: 2,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              fontSize: '0.875rem',
                            }}
                          >
                            {cartItem.product?.brand?.name || 'Unknown Brand'}
                          </Typography>
                        )}
                        {/* Size Recommendation */}
                        {cartItem.product?.sizes && cartItem.product.sizes.length > 0 && (
                          <Box sx={{ mb: 2, width: '100%' }}>
                            <SizeRecommender
                              productId={cartItem.product._id}
                              sizes={cartItem.product.sizes.map(s => s.size)}
                              categories={cartItem.product.brand ? [cartItem.product.brand.name] : []}
                              onSizeSelect={(recommendedSize) => {
                                if (typeof recommendedSize === 'string') {
                                  handleUpdateItemOptions(
                                    cartItem._id,
                                    recommendedSize,
                                    cartItem.color
                                  );
                                }
                              }}
                            />
                          </Box>
                        )}

                        {/* Size and Color Selection */}
                        <CartItemOptions cartItem={cartItem} isUpdating={isUpdating} handleUpdateItemOptions={handleUpdateItemOptions} t={t} />
                        {/* Hiển thị tồn kho */}
                        {cartItem.size && cartItem.color && cartItem.product?.sizes && (
                          <Typography
                            variant="body1"
                            sx={{ color: isDarkMode ? '#ccc' : 'gray', fontWeight: 600, mb: 2, fontSize: '0.875rem' }}
                          >
                            {(() => {
                              const stock = cartItem.product.sizes.find(
                                sz => sz.size === cartItem.size && sz.color === cartItem.color
                              )?.stock;
                              return stock !== undefined ? `Còn lại: ${stock} sản phẩm` : '';
                            })()}
                          </Typography>
                        )}

                        {/* Coupon input */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }} onClick={e => e.stopPropagation()}>
                          <TextField
                            size="small"
                            label="Coupon"
                            value={couponInputs[cartItem._id] || ''}
                            onChange={e => setCouponInputs(v => ({ ...v, [cartItem._id]: e.target.value.toUpperCase() }))}
                            sx={{ 
                              width: 180, 
                              fontSize: 14,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
                                '& fieldset': { borderColor: isDarkMode ? '#555' : '#e0e0e0', borderWidth: 2 },
                                '& input': { color: isDarkMode ? '#fff' : 'black' },
                              },
                              '& .MuiInputLabel-root': {
                                color: isDarkMode ? '#ccc' : 'black',
                                fontSize: 14,
                              },
                            }}
                            inputProps={{ style: { textTransform: 'uppercase', fontSize: 14 } }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ 
                              minWidth: 80, 
                              fontSize: 14, 
                              p: '8px 16px',
                              borderRadius: '4px',
                              borderColor: isDarkMode ? '#555' : '#e0e0e0',
                              color: isDarkMode ? '#fff' : 'black',
                              borderWidth: 2,
                              fontWeight: 600,
                            }}
                            onClick={() => handleApplyCoupon(cartItem)}
                            disabled={applyingCouponId === cartItem._id}
                          >
                            {applyingCouponId === cartItem._id ? <CircularProgress size={16} /> : 'ÁP DỤNG'}
                          </Button>
                        </Box>
                        {couponErrors[cartItem._id] && (
                          <Alert
                            severity="error"
                            sx={{
                              mt: 1, mb: 1,
                              borderRadius: 0,
                              border: '1px solid #d32f2f',
                              bgcolor: isDarkMode ? '#2a1a1a' : '#ffebee',
                              color: isDarkMode ? '#ffcdd2' : 'black',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            {couponErrors[cartItem._id]}
                          </Alert>
                        )}
                        {appliedCoupon && (
                          <Alert
                            severity="success"
                            sx={{
                              mt: 1, mb: 1,
                              borderRadius: 0,
                              border: '1px solid #2e7d32',
                              bgcolor: isDarkMode ? '#1a2a1a' : '#edf7ed',
                              color: isDarkMode ? '#c8e6c9' : 'black',
                              fontWeight: 400,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            action={
                              <IconButton
                                size="small"
                                aria-label="Bỏ voucher"
                                onClick={() => {
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
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            }
                          >
                            {appliedCoupon.message}
                            {appliedCoupon.discountAmount > 0 && (
                              <>
                                {' '}
                                <span style={{ fontWeight: 700 }}>
                                  (-{appliedCoupon.discountAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })})
                                </span>
                              </>
                            )}
                            {appliedCoupon.code && appliedCoupon.newPrice && appliedCoupon.discountAmount > 0 && appliedCoupon.originalPrice ? (
                              <>
                                {' '}
                                (Tiết kiệm <span style={{ fontWeight: 700 }}>{Math.round(100 - (appliedCoupon.newPrice / appliedCoupon.originalPrice) * 100)}%</span>)
                              </>
                            ) : null}
                          </Alert>
                        )}

                        {/* Quantity controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} onClick={e => e.stopPropagation()}>
                          <IconButton
                            onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity - 1)}
                            disabled={isUpdating || cartItem.quantity <= 1}
                            sx={{ 
                              border: `2px solid ${isDarkMode ? '#555' : '#e0e0e0'}`, 
                              color: isDarkMode ? '#fff' : 'black', 
                              p: '4px', 
                              borderRadius: '4px',
                              '&:hover': {
                                bgcolor: isDarkMode ? '#444' : '#f5f5f5',
                              }
                            }}
                            size="small"
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <TextField
                            value={cartItem.quantity}
                            onChange={e => {
                              let newQuantity = Number.parseInt(e.target.value) || 1;
                              if (newQuantity > maxQuantity) newQuantity = maxQuantity;
                              handleQuantityChange(cartItem._id, newQuantity);
                            }}
                            size="small"
                            sx={{ 
                              width: 60, 
                              mx: 1, 
                              fontSize: 14,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
                                '& fieldset': { borderColor: isDarkMode ? '#555' : '#e0e0e0', borderWidth: 2 },
                                '& input': { color: isDarkMode ? '#fff' : 'black' },
                              },
                            }}
                            inputProps={{
                              min: 1,
                              max: maxQuantity,
                              style: { textAlign: 'center', fontWeight: 700, fontSize: 14 },
                            }}
                            disabled={isUpdating}
                          />
                          <IconButton
                            onClick={() => {
                              if (cartItem.quantity < maxQuantity) {
                                handleQuantityChange(cartItem._id, cartItem.quantity + 1);
                              }
                            }}
                            disabled={isUpdating || cartItem.quantity >= maxQuantity}
                            sx={{ 
                              border: `2px solid ${isDarkMode ? '#555' : '#e0e0e0'}`, 
                              color: isDarkMode ? '#fff' : 'black', 
                              p: '4px', 
                              borderRadius: '4px',
                              '&:hover': {
                                bgcolor: isDarkMode ? '#444' : '#f5f5f5',
                              }
                            }}
                            size="small"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Giá sản phẩm sau coupon */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          {discountedPrice !== originalPrice ? (
                            <>
                              <Typography
                                variant="h4"
                                sx={{ color: isDarkMode ? '#fff' : 'black', fontWeight: 900, letterSpacing: '0.02em', fontSize: '1.5rem' }}
                              >
                                {discountedPrice.toLocaleString('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                })}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ color: isDarkMode ? '#ccc' : 'gray', textDecoration: 'line-through', fontWeight: 600, fontSize: '1rem' }}
                              >
                                {originalPrice.toLocaleString('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                })}
                              </Typography>
                              <Chip
                                label={`- ${Math.round(100 - (discountedPrice / originalPrice) * 100)}%`}
                                sx={{
                                  bgcolor: isDarkMode ? '#333' : 'black',
                                  color: isDarkMode ? '#fff' : 'white',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  ml: 1,
                                  fontSize: '0.75rem',
                                  height: '24px',
                                }}
                              />
                            </>
                          ) : (
                            <Typography
                              variant="h4"
                              sx={{ color: isDarkMode ? '#fff' : 'black', fontWeight: 900, letterSpacing: '0.02em', fontSize: '1.5rem' }}
                            >
                              {originalPrice.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              })}
                            </Typography>
                          )}
                        </Box>

                        {/* Warning message khi chưa chọn size hoặc màu */}
                        {((cartItem.product?.sizes && cartItem.product?.sizes.length > 0 && !cartItem.size) ||
                          (cartItem.product?.sizes && cartItem.product?.sizes.some(s => s.color) && !cartItem.color)) && (
                            <Alert
                              severity="warning"
                              sx={{
                                mb: 1,
                                borderRadius: 0,
                                border: '1px solid #ed6c02',
                                bgcolor: isDarkMode ? '#2a1f0b' : '#fff4e5',
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

                      </Box>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering parent's onClick
                      handleRemoveItem(cartItem._id);
                    }}
                    disabled={isUpdating}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: isDarkMode ? '#fff' : 'black',
                      '&:hover': { color: 'red' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
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
              bgcolor: isDarkMode ? '#1e1e1e' : 'white',
              border: `2px solid ${isDarkMode ? '#333' : 'black'}`,
              borderRadius: '8px',
              p: 4,
              height: 'fit-content',
              color: isDarkMode ? '#fff' : 'black',
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: 20,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                ...nikeTypography,
                color: isDarkMode ? '#fff' : 'black',
                mb: 4,
                textTransform: 'uppercase',
                textAlign: 'center',
                fontSize: '1.5rem',
              }}
            >
              {t('orderSummary')}
            </Typography>

            {/* Warning về items chưa hoàn thành */}
            {hasIncompleteSelectedItems && selectedItems.size > 0 && (
              <Alert
                severity="warning"
                sx={{
                  mb: 2,
                  borderRadius: 0,
                  border: "1px solid #ed6c02",
                  bgcolor: isDarkMode ? "#2a1f0b" : "#fff4e5",
                  color: "#ed6c02",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {(() => {
                  const incompleteCount = selectedCartItems.filter(item => {
                    const cartItem = item as CartItemWithId;
                    return (cartItem.product?.sizes && cartItem.product?.sizes.length > 0 && !cartItem.size) ||
                           (cartItem.product?.sizes && cartItem.product?.sizes.some(s => s.color) && !cartItem.color);
                  }).length;
                  return `${incompleteCount} sản phẩm được chọn chưa chọn size hoặc màu. Vui lòng hoàn thành trước khi thanh toán.`;
                })()}
              </Alert>
            )}

            <Box sx={{ position: 'relative', my: 3 }}>
              <Divider sx={{ borderColor: isDarkMode ? '#fff' : 'black', borderWidth: 2 }} />
            </Box>

            <Stack spacing={2}>
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
                  bgcolor: 'transparent',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: isDarkMode ? '#fff' : 'black' }} />}
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
                      color: isDarkMode ? '#fff' : 'black',
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
                        '& fieldset': { borderColor: isDarkMode ? '#555' : '#e0e0e0' },
                        '& input': { color: isDarkMode ? '#fff' : 'black' },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? '#ccc' : 'black',
                      },
                    }}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Summary Details */}
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ ...nikeTypography, color: isDarkMode ? '#fff' : 'black', textTransform: 'uppercase', fontSize: '1rem' }}>
                    {t('subtotal')}:
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: isDarkMode ? '#fff' : 'black', fontSize: '1rem' }}>
                    {productSubtotal.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ ...nikeTypography, color: isDarkMode ? '#fff' : 'black', textTransform: 'uppercase', fontSize: '1rem' }}>
                    {t('shippingFee')}:
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: isDarkMode ? '#fff' : 'black', fontSize: '1rem' }}>
                    {shippingFee.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </Typography>
                </Box>
                {productCouponDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700, color: isDarkMode ? '#fff' : 'black', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                      Giảm giá sản phẩm (coupon):
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.875rem' }}>
                      -{productCouponDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ position: 'relative', my: 3 }}>
                  <Divider sx={{ borderColor: isDarkMode ? '#fff' : 'black', borderWidth: 2 }} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      ...nikeTypography,
                      color: isDarkMode ? '#fff' : 'black',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      fontSize: '1.25rem',
                    }}
                  >
                    {t('total')}:
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      ...nikeTypography,
                      color: isDarkMode ? '#fff' : 'black',
                      letterSpacing: '0.02em',
                      fontSize: '1.25rem',
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
              <Stack spacing={3} sx={{ mt: 4 }}>
                <Tooltip
                  title={hasIncompleteSelectedItems ? "Vui lòng chọn size và màu cho các sản phẩm được chọn trước khi thanh toán" : selectedItems.size === 0 ? "Vui lòng chọn ít nhất 1 sản phẩm để thanh toán" : ""}
                  placement="top"
                >
                  <span>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => {
                        localStorage.setItem('selectedCartItemIds', JSON.stringify(Array.from(selectedItems)));
                        router.push('/checkout');
                      }}
                      disabled={isProcessingPayment || hasIncompleteSelectedItems || selectedItems.size === 0}
                      sx={{
                        ...nikeButtonStyle,
                        bgcolor: isDarkMode ? '#fff' : 'black',
                        color: isDarkMode ? 'black' : 'white',
                        borderRadius: '4px',
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 700,
                        '&:hover': { bgcolor: isDarkMode ? '#e0e0e0' : 'gray.800' },
                        '&.Mui-disabled': {
                          bgcolor: isDarkMode ? '#555' : 'gray.400',
                          color: isDarkMode ? '#999' : 'gray.600',
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
                    color: isDarkMode ? '#ccc' : '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('or')}
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => router.push('/')}
                  sx={{
                    ...nikeButtonStyle,
                    borderColor: '#0070ba',
                    color: '#0070ba',
                    borderWidth: 2,
                    borderRadius: '4px',
                    py: 2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    '&:hover': {
                      borderColor: '#0070ba',
                      bgcolor: '#0070ba',
                      color: 'white',
                      borderWidth: 2,
                    },
                  }}
                >
                  {t('continueShopping')}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={handleClearCart}
                  sx={{
                    ...nikeButtonStyle,
                    color: isDarkMode ? '#fff' : 'black',
                    border: '2px solid transparent',
                    mt: 2,
                    borderRadius: '4px',
                    py: 2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    '&:hover': {
                      bgcolor: isDarkMode ? '#fff' : 'black',
                      color: isDarkMode ? 'black' : 'white',
                    },
                  }}
                >
                  {t('clearCart')}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}