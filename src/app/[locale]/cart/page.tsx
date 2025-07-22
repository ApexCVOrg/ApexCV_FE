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

// Component con cho chọn size/màu
interface CartItemOptionsProps {
  cartItem: CartItemWithId;
  isUpdating: boolean;
  handleUpdateItemOptions: (cartItemId: string, newSize?: string, newColor?: string) => void;
  t: (key: string) => string;
  blackBorderStyle: any;
}
function CartItemOptions({ cartItem, isUpdating, handleUpdateItemOptions, t, blackBorderStyle }: CartItemOptionsProps) {
  const [localSize, setLocalSize] = useState(cartItem.size);
  const [localColor, setLocalColor] = useState(cartItem.color);
  const [pending, setPending] = useState(false);

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
        <FormControl
          size="small"
          sx={{ minWidth: 90, ...blackBorderStyle }}
          disabled={isUpdating || pending}
          onClick={e => e.stopPropagation()}
        >
          <InputLabel sx={{ color: 'black', fontWeight: 600 }}>{t('size')}</InputLabel>
          <Select
            value={localSize || ''}
            label={t('size')}
            onChange={e => handleSizeChange(e.target.value)}
            sx={{ fontWeight: 600, textTransform: 'uppercase' }}
            error={!localSize}
            onClick={e => e.stopPropagation()}
          >
            {(cartItem.product?.sizes as ProductSize[])
              ?.filter((sz: ProductSize) => !localColor || ('color' in sz && sz.color === localColor))
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
            sx={{ borderRadius: 0, border: '1px solid black', bgcolor: 'white', color: 'black', fontWeight: 700, textTransform: 'uppercase' }}
          />
        )
      )}
      {/* Color */}
      {cartItem.product?.sizes && cartItem.product?.sizes.some((sz: ProductSize) => 'color' in sz && sz.color) ? (
        <FormControl
          size="small"
          sx={{ minWidth: 90, ...blackBorderStyle }}
          disabled={isUpdating || pending}
          onClick={e => e.stopPropagation()}
        >
          <InputLabel sx={{ color: 'black', fontWeight: 600 }}>{t('color')}</InputLabel>
          <Select
            value={localColor || ''}
            label={t('color')}
            onChange={e => handleColorChange(e.target.value)}
            sx={{ fontWeight: 600, textTransform: 'uppercase' }}
            error={!localColor}
            onClick={e => e.stopPropagation()}
          >
            {Array.from(new Set((cartItem.product?.sizes as ProductSize[]).map((sz: ProductSize) => 'color' in sz ? sz.color : undefined)))
              .filter((color): color is string => !!color)
              .map((color: string) => (
                <MenuItem
                  key={color}
                  value={color}
                  sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                >
                  {color}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      ) : (
        cartItem.color && (
          <Chip
            label={`${t('color')}: ${cartItem.color}`}
            size="small"
            sx={{ borderRadius: 0, border: '1px solid black', bgcolor: 'white', color: 'black', fontWeight: 700, textTransform: 'uppercase' }}
          />
        )
      )}
    </Stack>
  );
}

export default function CartPage() {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart, refreshCart } = useCartContext();
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // 1. Tách state localCartItems khỏi context
  const [localCartItems, setLocalCartItems] = useState<CartItemWithId[]>(cart?.cartItems as CartItemWithId[] || []);
  useEffect(() => {
    if (cart?.cartItems) setLocalCartItems(cart.cartItems as CartItemWithId[]);
  }, [cart?.cartItems]);

  // Lưu appliedCoupons vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("appliedCoupons", JSON.stringify(appliedCoupons));
    }
  }, [appliedCoupons]);

  // useEffect chỉ set selectedItems mặc định khi lần đầu vào trang
  useEffect(() => {
    if (cart?.cartItems && selectedItems.size === 0) {
      setSelectedItems(new Set(cart.cartItems.map((item: any) => item._id)));
    }
    // eslint-disable-next-line
  }, []); // chỉ chạy 1 lần khi mount

  // Common styles matching login form
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

  // 2. Render UI theo localCartItems (thay cart.cartItems -> localCartItems ở tất cả chỗ render)
  // 3. Optimistic update khi chọn size/màu
  const handleUpdateItemOptions = async (cartItemId: string, newSize?: string, newColor?: string) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    // Lưu lại bản cũ để rollback nếu lỗi
    const prevItems = [...localCartItems];
    setLocalCartItems(items => items.map(item =>
      item._id === cartItemId ? { ...item, size: newSize, color: newColor } : item
    ));
    try {
      await updateCartItem(cartItemId, undefined, newSize, newColor);
    } catch (error) {
      setLocalCartItems(prevItems); // rollback nếu lỗi
      console.error('Error updating item options:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  // Hàm gọi API áp dụng coupon
  const handleApplyCoupon = async (cartItem: CartItemWithId) => {
    const code = couponInputs[cartItem._id];
    if (!code) return;
    setApplyingCouponId(cartItem._id);
    setCouponError('');
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
          },
        }));
} else {
        setCouponError(data.message || 'Coupon không hợp lệ');
        console.log('Coupon error details:', data);
      }
    } catch (err) {
      setCouponError('Có lỗi khi áp dụng coupon');
    } finally {
      setApplyingCouponId(null);
    }
  };

  // Hàm chọn/bỏ chọn 1 sản phẩm
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

  // Hàm chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectedItems.size === localCartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(localCartItems.map((item: any) => item._id)));
    }
  };

  // 4. Khi thao tác lớn (xóa sản phẩm, clear cart, checkout thành công) -> gọi refreshCart và sync lại localCartItems
  const handleRemoveItem = async (cartItemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await removeFromCart(cartItemId);
      if (typeof refreshCart === 'function') await refreshCart();
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
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.cartItems.length === 0) return;

    // Lọc ra các sản phẩm được chọn
    const selectedCartItems = localCartItems.filter((item: any) => selectedItems.has(item._id));
    if (selectedCartItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
      return;
    }

    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán');
      return;
    }

    // Kiểm tra tất cả items đã chọn size và màu chưa
    const itemsWithoutSizeOrColor = selectedCartItems.filter(item => {
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
              size: item.size || 'M',
              color: item.color || 'Default',
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
        shippingPrice: 50000, // Luôn là 50.000 VND
        user: currentUser.id, // Thêm user ID để backend có thể lấy thông tin
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

  // --- TÍNH TOÁN GIÁ ---
  // Tổng tiền sản phẩm (giá gốc, chưa trừ voucher)
  const productSubtotal = localCartItems
    .filter(item => selectedItems.has((item as CartItemWithId)._id))
    .reduce((total, item) => {
      const cartItem = item as CartItemWithId;
      const price = cartItem.product?.discountPrice || cartItem.product?.price || 0;
      return total + price * cartItem.quantity;
    }, 0);

  // Tính tổng giảm giá từ coupon sản phẩm
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

  // Lấy voucher giảm giá phí vận chuyển từ localStorage (nếu có)
  const shippingVoucher = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('shippingDiscount') || 'null') : null;
  const shippingFee = 30000; // Phí vận chuyển mặc định
  const shippingDiscount = shippingVoucher?.amount || 0;

  // Tổng thanh toán = tổng tiền sản phẩm + phí vận chuyển - giảm giá phí vận chuyển - tổng giảm giá coupon
  const total = productSubtotal + shippingFee - shippingDiscount - productCouponDiscount;

  // Kiểm tra xem có items nào chưa chọn size hoặc màu không
  const hasIncompleteItems = localCartItems.some(item => {
    const cartItem = item as CartItemWithId;
    return !cartItem.size || !cartItem.color;
  });

  // Thay vì kiểm tra toàn bộ cart, chỉ kiểm tra các sản phẩm được chọn
  const selectedCartItems = localCartItems.filter((item: any) => selectedItems.has(item._id));
  const hasIncompleteSelectedItems = selectedCartItems.some(item => {
    const cartItem = item as CartItemWithId;
    return !cartItem.size || !cartItem.color;
  });

  // Thêm hàm mẫu áp mã giảm giá phí vận chuyển
  const handleApplyShippingVoucher = (code: string, amount: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem('shippingDiscount', JSON.stringify({ code, amount }));
    }
    // ... các logic khác khi áp dụng voucher phí ship
  };

  // Thêm hàm mẫu xóa mã giảm giá phí vận chuyển
  const handleRemoveShippingVoucher = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('shippingDiscount');
    }
    // ... các logic khác khi xóa voucher phí ship
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
          {t('productCount', { count: localCartItems.length })}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Danh sách sản phẩm */}
        <Box sx={{ flex: { md: 2 } }}>
          <Stack spacing={3}>
            {/* Chọn tất cả */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, cursor: 'pointer' }} onClick={handleSelectAll}>
              <Checkbox
                checked={selectedItems.size === localCartItems.length}
                indeterminate={selectedItems.size > 0 && selectedItems.size < localCartItems.length}
                onChange={handleSelectAll}
                sx={{ p: 0, mr: 1 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 700, color: "black", userSelect: 'none' }}>
                Chọn tất cả
              </Typography>
            </Box>
            {localCartItems.map((item) => {
              const cartItem = item as CartItemWithId;
              const isUpdating = updatingItems.has(cartItem._id);
              const price = cartItem.product ? cartItem.product?.discountPrice || cartItem.product?.price : 0;
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
                    alignItems: 'center',
                    minHeight: 240,
                    opacity: isUpdating ? 0.7 : 1,
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
                  <Box sx={{ flex: '0 0 120px', mr: 3 }}>
                    <Box
                      sx={{
                        border: '2px solid black',
                        borderRadius: 0,
                        p: 1,
                        bgcolor: '#f6f6f6',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={cartItem.product?.images?.[0] || '/assets/images/placeholder.jpg'}
                        alt={cartItem.product?.name || 'Product'}
                        sx={{ objectFit: 'contain', borderRadius: 0 }}
                      />
                    </Box>
                  </Box>
                  {/* Vùng thông tin sản phẩm, click để chọn/bỏ chọn */}
                  <Box
                    sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer' }}
                    onClick={() => handleSelectItem(cartItem._id)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 900,
                            color: 'black',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {cartItem.product?.name || 'Product Name Unavailable'}
                        </Typography>
                        {cartItem.product?.brand && (
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: 'gray',
                              mb: 1,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              fontSize: '0.75rem',
                            }}
                          >
                            {cartItem.product?.brand?.name || 'Unknown Brand'}
                          </Typography>
                        )}
                        <CartItemOptions cartItem={cartItem} isUpdating={isUpdating} handleUpdateItemOptions={handleUpdateItemOptions} t={t} blackBorderStyle={blackBorderStyle} />
                        {/* Hiển thị tồn kho */}
                        {cartItem.size && cartItem.color && cartItem.product?.sizes && (
                          <Typography
                            variant="body2"
                            sx={{ color: 'gray', fontWeight: 600, mb: 1 }}
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
                        {/* Số lượng: nút - số lượng + */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <IconButton
                            onClick={e => {
                              e.stopPropagation();
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
                          <TextField
                            value={cartItem.quantity}
                            onChange={e => {
                              let newQuantity = Number.parseInt(e.target.value) || 1;
                              // Lấy stock hiện tại
                              const maxQuantity = cartItem.product?.sizes?.find(sz => sz.size === cartItem.size && sz.color === cartItem.color)?.stock ?? 1;
                              if (newQuantity > maxQuantity) newQuantity = maxQuantity;
                              handleQuantityChange(cartItem._id, newQuantity);
                            }}
                            size="small"
                            sx={{ width: 60, mx: 1, ...blackBorderStyle }}
                            inputProps={{
                              min: 1,
                              max: cartItem.product?.sizes?.find(sz => sz.size === cartItem.size && sz.color === cartItem.color)?.stock ?? 1,
                              style: { textAlign: 'center', fontWeight: 700, fontSize: '1rem' },
                            }}
                            disabled={isUpdating}
                            onClick={e => e.stopPropagation()}
                          />
                          <IconButton
                            onClick={e => {
                              e.stopPropagation();
                              const maxQuantity = cartItem.product?.sizes?.find(sz => sz.size === cartItem.size && sz.color === cartItem.color)?.stock ?? 1;
                              if (cartItem.quantity < maxQuantity) {
                                handleQuantityChange(cartItem._id, cartItem.quantity + 1);
                              }
                            }}
                            disabled={isUpdating || cartItem.quantity >= (cartItem.product?.sizes?.find(sz => sz.size === cartItem.size && sz.color === cartItem.color)?.stock ?? 1)}
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
                        {/* Warning message khi chưa chọn size hoặc màu */}
                        {(!cartItem.size || !cartItem.color) && (
                          <Alert
                            severity="warning"
                            sx={{
                              mb: 1,
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
                        {/* Stock info, quantity, coupon, price, action buttons... giữ nguyên logic */}
                        {/* ... */}
                      </Box>
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
            {hasIncompleteSelectedItems && selectedItems.size > 0 && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 2, 
                  borderRadius: 0, 
                  border: "1px solid #ed6c02",
                  bgcolor: "#fff4e5",
                  color: "#ed6c02",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {(() => {
                  const incompleteCount = selectedCartItems.filter(item => {
                    const cartItem = item as CartItemWithId;
                    return !cartItem.size || !cartItem.color;
                  }).length;
                  return `${incompleteCount} sản phẩm được chọn chưa chọn size hoặc màu. Vui lòng hoàn thành trước khi thanh toán.`;
                })()}
              </Alert>
            )}

            <Box sx={{ position: 'relative', my: 3 }}>
              <Divider sx={{ borderColor: 'black', borderWidth: 2 }} />
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
                <Typography sx={{ fontWeight: 700, color: 'black' }}>
                  {productSubtotal.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    })}
                  </Typography>
                </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ ...nikeTypography, color: 'black', textTransform: 'uppercase' }}>
                  {t('shippingFee')}:
                </Typography>
                <Typography sx={{ fontWeight: 700, color: 'black' }}>
                  {shippingFee.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Typography>
              </Box>
              {productCouponDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700, color: 'black', textTransform: 'uppercase' }}>
                    Giảm giá sản phẩm (coupon):
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: 'error.main' }}>
                    -{productCouponDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                </Box>
              )}

              <Box sx={{ position: 'relative', my: 2 }}>
                <Divider sx={{ borderColor: 'black', borderWidth: 2 }} />
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
                title={hasIncompleteSelectedItems ? "Vui lòng chọn size và màu cho các sản phẩm được chọn trước khi thanh toán" : ""}
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
                onClick={() => router.push('/')}
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
                {t('continueShopping')}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={handleClearCart}
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
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
    }
