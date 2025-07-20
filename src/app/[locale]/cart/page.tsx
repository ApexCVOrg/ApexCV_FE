
/* eslint-disable */
"use client";
import { useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useCartContext } from "@/context/CartContext";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createVnpayPayment } from "@/services/api";
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
  const [voucherInputs, setVoucherInputs] = useState<{ [cartItemId: string]: string }>({});
  const [appliedVouchers, setAppliedVouchers] = useState<{ [cartItemId: string]: { code: string; newPrice: number; discountAmount: number; message: string } | undefined }>({});
  const [voucherError, setVoucherError] = useState<{ [cartItemId: string]: string }>({});
  const [applyingVoucherId, setApplyingVoucherId] = useState<string | null>(null);
  const t = useTranslations("cartPage")
  // State để lưu trạng thái miễn phí ship
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { isAuthenticated, getCurrentUser } = useAuth();

  // Common styles matching login form
  const blackBorderStyle = {
    borderRadius: 0,
    border: "2px solid black",
    "& .MuiOutlinedInput-root": {
      borderRadius: 0,
      "& fieldset": { borderColor: "black", borderWidth: 2 },
      "&:hover fieldset": { borderColor: "black" },
      "&.Mui-focused fieldset": { borderColor: "black" },
    },
    "& .MuiInputLabel-root": {
      color: "black",
      "&.Mui-focused": { color: "black" },
    },
  };

  const buttonStyle = {
    borderRadius: 0,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    py: 1.5,
  };

  if (!token) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: "white",
            borderRadius: 0,
            border: "2px solid black",
            textAlign: "center",
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 64, color: "black", mb: 2 }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "black",
              mb: 2,
              textTransform: "uppercase",
            }}
          >
            {t("loginToViewCart")}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/auth/login")}
            sx={{
              ...buttonStyle,
              bgcolor: "black",
              color: "white",
              "&:hover": { bgcolor: "gray.800" },
              mt: 2,
            }}
          >
            {t("login")}
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
            bgcolor: "white",
            borderRadius: 0,
            border: "2px solid black",
            textAlign: "center",
          }}
        >
          <CircularProgress sx={{ color: "black" }} />
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
            bgcolor: "white",
            borderRadius: 0,
            border: "2px solid black",
          }}
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: 0,
              border: "2px solid #d32f2f",
              bgcolor: "#ffebee",
              color: "black",
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
            bgcolor: "white",
            borderRadius: 0,
            border: "2px solid black",
            textAlign: "center",
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 64, color: "black", mb: 2 }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "black",
              mb: 1,
              textTransform: "uppercase",
            }}
          >
            {t("cartEmpty")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "gray",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.875rem",
              mb: 3,
            }}
          >
            {t("noProductsInCart")}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/")}
            sx={{
              ...buttonStyle,
              bgcolor: "black",
              color: "white",
              "&:hover": { bgcolor: "gray.800" },
            }}
          >
            {t("continueShopping")}
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdatingItems((prev) => {
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
      console.error("Error clearing cart:", error);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.cartItems.length === 0) return;
    
    // Kiểm tra user đã đăng nhập chưa
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thanh toán");
      return;
    }
    
    // Kiểm tra tất cả items đã chọn size và màu chưa
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
      // Lấy token từ localStorage
      const token = localStorage.getItem('auth_token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');
      
      if (!token) {
        alert("Token không tồn tại, vui lòng đăng nhập lại");
        return;
      }

      // Lưu token vào cookies để VNPAY return có thể truy cập
      document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Lax`;
      console.log('Token saved to cookies for VNPAY return');

      // Lấy thông tin user hiện tại từ token
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
          role: payload.role
        };
        console.log('Current user from token:', currentUser);
        console.log('Token payload:', payload);
      } catch (error) {
        console.error('Error decoding token:', error);
        alert("Token không hợp lệ, vui lòng đăng nhập lại");
        return;
      }

      if (!currentUser || !currentUser.id) {
        alert("Không thể lấy thông tin người dùng từ token");
        return;
      }

      // Lấy thông tin profile đầy đủ bao gồm địa chỉ
      let userProfile;
      try {
        console.log('Calling profile service...');
        userProfile = await profileService.getProfile();
        console.log('User profile:', userProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        console.error("Error details:", error);
        alert("Không thể lấy thông tin profile");
        return;
      }

      // Lấy địa chỉ mặc định hoặc địa chỉ đầu tiên
      const defaultAddress = userProfile.addresses?.find(addr => addr.isDefault) || userProfile.addresses?.[0];
      
      if (!defaultAddress) {
        alert("Vui lòng thêm địa chỉ giao hàng trong profile");
        return;
      }

      console.log('Default address:', defaultAddress);

      // Tạo dữ liệu VNPAY theo đúng format
      const vnpayData = {
        vnp_Amount: total, // VNPAY yêu cầu số tiền nhân 100
        vnp_IpAddr: '127.0.0.1', // IP của client
        vnp_ReturnUrl: `${window.location.origin}/payment/vnpay-return`,
        vnp_TxnRef: `ORDER_${Date.now()}`, // Mã giao dịch duy nhất
        vnp_OrderInfo: `Thanh toan don hang ${Date.now()}`, // Thông tin đơn hàng
        vnp_ExpireDate: Math.floor((Date.now() + 15 * 60 * 1000) / 1000), // Hết hạn sau 15 phút (timestamp)
        vnp_CreateDate: Math.floor(Date.now() / 1000), // Ngày tạo (timestamp)
        // Dữ liệu đơn hàng để lưu vào session
        orderItems: cart.cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          size: [{
            size: item.size || 'M',
            color: item.color || 'Default',
            quantity: item.quantity,
          }],
          price: item.product.discountPrice || item.product.price,
        })),
        shippingAddress: {
          fullName: defaultAddress.recipientName || userProfile.fullName,
          phone: userProfile.phone,
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.addressNumber, // Map addressNumber to postalCode
          country: defaultAddress.country,
        },
        paymentMethod: 'VNPAY',
        totalPrice: total,
        taxPrice: 0,
        shippingPrice: 0,
        user: currentUser.id, // Thêm user ID để backend có thể lấy thông tin
      };

      console.log('VNPAY data:', vnpayData);

      const paymentUrl = await createVnpayPayment(vnpayData);
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Hàm tính giá sau voucher (ưu tiên giá từ API)
  const getDiscountedPrice = (cartItem: CartItemWithId) => {
    const applied = appliedVouchers[cartItem._id];
    if (applied && applied.newPrice) return applied.newPrice;
    return cartItem.product.discountPrice || cartItem.product.price;
  };

  const calculateSubtotal = () => {
    return cart.cartItems.reduce((total, item) => {
      const cartItem = item as CartItemWithId;
      const price = getDiscountedPrice(cartItem);
      return total + price * cartItem.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal()
  const shipping = isFreeShipping ? 0 : 25000
  const total = subtotal + shipping

  // Kiểm tra xem có items nào chưa chọn size hoặc màu không
  const hasIncompleteItems = cart.cartItems.some(item => {
    const cartItem = item as CartItemWithId;
    return !cartItem.size || !cartItem.color;
  });

  const handleUpdateItemOptions = async (cartItemId: string, newSize?: string, newColor?: string) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      await updateCartItem(cartItemId, undefined, newSize, newColor);
    } catch (error) {
      console.error("Error updating item options:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  // Hàm gọi API áp dụng voucher
  const handleApplyVoucher = async (cartItem: CartItemWithId) => {
    const code = voucherInputs[cartItem._id];
    if (!code) return;
    // Reset free shipping nếu áp voucher mới không phải FREESHIP
    if (code !== 'FREESHIP') setIsFreeShipping(false);
    setApplyingVoucherId(cartItem._id);
    setVoucherError(prev => ({ ...prev, [cartItem._id]: "" }));
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch("http://localhost:5000/api/voucher/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          voucherCode: code,
          productId: cartItem.product._id,
          price: cartItem.product.discountPrice || cartItem.product.price,
          quantity: cartItem.quantity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedVouchers(v => ({
          ...v,
          [cartItem._id]: {
            code,
            newPrice: data.newPrice,
            discountAmount: data.discountAmount,
            message: data.message,
          },
        }));
        if (data.freeShipping) setIsFreeShipping(true);
        else setIsFreeShipping(false);
        setVoucherError(prev => ({ ...prev, [cartItem._id]: "" }));
      } else {
        setVoucherError(prev => ({ ...prev, [cartItem._id]: data.message || "Voucher không hợp lệ" }));
      }
    } catch (err) {
      setVoucherError(prev => ({ ...prev, [cartItem._id]: "Có lỗi khi áp dụng voucher" }));
    } finally {
      setApplyingVoucherId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "black",
            mb: 1,
            textTransform: "uppercase",
          }}
        >
          {t("cart")}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "gray",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontSize: "0.875rem",
          }}
        >
          {t("productCount", { count: cart.cartItems.length })}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
        {/* Danh sách sản phẩm */}
        <Box sx={{ flex: { md: 2 } }}>
          <Stack spacing={3}>
            {cart.cartItems.map((item) => {
              const cartItem = item as CartItemWithId;
              const isUpdating = updatingItems.has(cartItem._id);
              const price = cartItem.product.discountPrice || cartItem.product.price;
              const originalPrice = cartItem.product.price;
              const discountedPrice = getDiscountedPrice(cartItem);
              const appliedVoucher = appliedVouchers[cartItem._id];
              return (
                <Paper
                  key={cartItem._id}
                  elevation={3}
                  sx={{
                    position: "relative",
                    bgcolor: "white",
                    borderRadius: 0,
                    border: "2px solid black",
                    p: 3,
                    display: "flex",
                    alignItems: "center",
                    minHeight: 240,
                  }}
                >
                  {isUpdating && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(255,255,255,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                        borderRadius: 0,
                      }}
                    >
                      <CircularProgress size={24} sx={{ color: "black" }} />
                    </Box>
                  )}

                  <Box sx={{ flex: "0 0 120px", mr: 3 }}>
                    <Box
                      sx={{
                        border: "2px solid black",
                        borderRadius: 0,
                        p: 1,
                        bgcolor: "#f6f6f6",
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={cartItem.product.images[0] || "/assets/images/placeholder.jpg"}
                        alt={cartItem.product.name}
                        sx={{ objectFit: "contain", borderRadius: 0 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 900,
                            color: "black",
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {cartItem.product.name}
                        </Typography>
                        {cartItem.product.brand && (
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "gray",
                              mb: 1,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              fontSize: "0.75rem",
                            }}
                          >
                            {cartItem.product.brand.name}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          {/* Size */}
                          {cartItem.product.sizes && cartItem.product.sizes.length > 0 ? (
                            <FormControl size="small" sx={{ minWidth: 90, ...blackBorderStyle }} disabled={isUpdating}>
                              <InputLabel sx={{ color: "black", fontWeight: 600 }}>{t("size")}</InputLabel>
                              <Select
                                value={cartItem.size || ""}
                                label={t("size")}
                                onChange={(e) => handleUpdateItemOptions(cartItem._id, e.target.value, cartItem.color)}
                                sx={{ fontWeight: 600, textTransform: "uppercase" }}
                                error={!cartItem.size}
                              >
                                {cartItem.product.sizes
                                  ?.filter((sz) => !cartItem.color || ("color" in sz && sz.color === cartItem.color))
                                  .map((sz: ProductSize) => (
                                    <MenuItem
                                      key={sz.size + ("color" in sz && sz.color ? sz.color : "")}
                                      value={sz.size}
                                      disabled={sz.stock === 0}
                                      sx={{ fontWeight: 600, textTransform: "uppercase" }}
                                    >
                                      {sz.size}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          ) : (
                            cartItem.size && (
                              <Chip
                                label={`${t("size")}: ${cartItem.size}`}
                                size="small"
                                sx={{
                                  borderRadius: 0,
                                  border: "1px solid black",
                                  bgcolor: "white",
                                  color: "black",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              />
                            )
                          )}

                          {/* Color */}
                          {cartItem.product.sizes && cartItem.product.sizes.some((sz) => "color" in sz && sz.color) ? (
                            <FormControl size="small" sx={{ minWidth: 90, ...blackBorderStyle }} disabled={isUpdating}>
                              <InputLabel sx={{ color: "black", fontWeight: 600 }}>{t("color")}</InputLabel>
                              <Select
                                value={cartItem.color || ""}
                                label={t("color")}
                                onChange={(e) => handleUpdateItemOptions(cartItem._id, cartItem.size, e.target.value)}
                                sx={{ fontWeight: 600, textTransform: "uppercase" }}
                                error={!cartItem.color}
                              >
                                {[
                                  ...new Set(
                                    cartItem.product.sizes?.map((sz: ProductSize) =>
                                      "color" in sz ? sz.color : undefined
                                    )
                                  ),
                                ].map(
                                  (color: string | undefined) =>
                                    color && (
                                      <MenuItem
                                        key={color}
                                        value={color}
                                        sx={{ fontWeight: 600, textTransform: "uppercase" }}
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
                                label={`${t("color")}: ${cartItem.color}`}
                                size="small"
                                sx={{
                                  borderRadius: 0,
                                  border: "1px solid black",
                                  bgcolor: "white",
                                  color: "black",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              />
                            )
                          )}
                        </Stack>
                        
                        {/* Warning message khi chưa chọn size hoặc màu */}
                        {(!cartItem.size || !cartItem.color) && (
                          <Alert 
                            severity="warning" 
                            sx={{ 
                              mb: 1, 
                              borderRadius: 0, 
                              border: "1px solid #ed6c02",
                              bgcolor: "#fff4e5",
                              color: "#ed6c02",
                              fontWeight: 600,
                              fontSize: "0.75rem"
                            }}
                          >
                            {!cartItem.size && !cartItem.color 
                              ? "Vui lòng chọn size và màu để thanh toán"
                              : !cartItem.size 
                                ? "Vui lòng chọn size để thanh toán"
                                : "Vui lòng chọn màu để thanh toán"
                            }
                          </Alert>
                        )}
                        {/* Hiển thị tồn kho ngoài dropdown */}
                        {cartItem.size && cartItem.color && cartItem.product.sizes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                            {t("stockLeft", {
                              stock:
                                cartItem.product.sizes.find(
                                  (sz: ProductSize) =>
                                    sz.size === cartItem.size &&
                                    ("color" in sz && sz.color === cartItem.color)
                                )?.stock ?? "N/A"
                            })}
                          </Typography>
                        )}
                      </Box>

                      <IconButton
                        onClick={() => handleRemoveItem(cartItem._id)}
                        disabled={isUpdating}
                        sx={{
                          ml: 1,
                          border: "2px solid black",
                          borderRadius: 0,
                          color: "black",
                          "&:hover": { bgcolor: "black", color: "white" },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    {/* Voucher input */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        label="Voucher"
                        value={voucherInputs[cartItem._id] || ""}
                        onChange={e => setVoucherInputs(v => ({ ...v, [cartItem._id]: e.target.value.toUpperCase() }))}
                        sx={{ width: 140, ...blackBorderStyle }}
                        inputProps={{ style: { textTransform: "uppercase" } }}
                        disabled={isUpdating || applyingVoucherId === cartItem._id}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 80, borderRadius: 0, fontWeight: 700, ml: 1, borderColor: "black", color: "black" }}
                        disabled={isUpdating || !voucherInputs[cartItem._id] || applyingVoucherId === cartItem._id || !!appliedVouchers[cartItem._id]}
                        onClick={() => handleApplyVoucher(cartItem)}
                      >
                        {applyingVoucherId === cartItem._id ? "Đang áp dụng..." : "Áp dụng"}
                      </Button>
                      {appliedVoucher && (
                        <>
                          <Chip
                            label={`Đã áp dụng: ${appliedVoucher.code}`}
                            color="success"
                            size="small"
                            sx={{ ml: 1, fontWeight: 700, borderRadius: 0 }}
                            onDelete={() => {
                              setAppliedVouchers(v => {
                                const newV = { ...v };
                                // Nếu xóa voucher FREESHIP thì reset free shipping
                                if (appliedVoucher.code === 'FREESHIP') setIsFreeShipping(false);
                                delete newV[cartItem._id];
                                return newV;
                              });
                              setVoucherError(prev => {
                                const newErr = { ...prev };
                                delete newErr[cartItem._id];
                                return newErr;
                              });
                              setVoucherInputs(prev => {
                                const newInputs = { ...prev };
                                delete newInputs[cartItem._id];
                                return newInputs;
                              });
                            }}
                          />
                          {appliedVoucher.message && (
                            <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                              {appliedVoucher.message}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                    {/* Hiển thị lỗi voucher */}
                    {voucherError[cartItem._id] && (
                      <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                        {voucherError[cartItem._id]}
                      </Typography>
                    )}
                    {/* Giá sản phẩm sau voucher */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      {discountedPrice !== originalPrice ? (
                        <>
                          <Typography
                            variant="h6"
                            sx={{ color: "black", fontWeight: 900, letterSpacing: "0.02em" }}
                          >
                            {discountedPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "gray", textDecoration: "line-through", fontWeight: 600 }}
                          >
                            {originalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                          </Typography>
                          <Chip
                            label={`- ${appliedVoucher?.discountAmount ? Math.round(100 * appliedVoucher.discountAmount / originalPrice) : Math.round(100 - (discountedPrice / originalPrice) * 100)}%`}
                            sx={{ bgcolor: "black", color: "white", fontWeight: 700, borderRadius: 0, ml: 1 }}
                          />
                        </>
                      ) : (
                        <Typography
                          variant="h6"
                          sx={{ color: "black", fontWeight: 900, letterSpacing: "0.02em" }}
                        >
                          {discountedPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </Typography>
                      )}
                    </Box>
                    {/* Controls số lượng */}
                    {(() => {
                      const maxQuantity = cartItem.product.sizes?.find(
                        (sz: ProductSize) => sz.size === cartItem.size && ("color" in sz && sz.color === cartItem.color)
                      )?.stock ?? 1;
                      return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <IconButton
                            onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity - 1)}
                            disabled={isUpdating || cartItem.quantity <= 1}
                            sx={{
                              border: "2px solid black",
                              borderRadius: 0,
                              color: "black",
                              "&:hover": { bgcolor: "black", color: "white" },
                              "&.Mui-disabled": { borderColor: "gray", color: "gray" },
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            value={cartItem.quantity}
                            onChange={(e) => {
                              let newQuantity = Number.parseInt(e.target.value) || 1;
                              if (newQuantity > maxQuantity) newQuantity = maxQuantity;
                              handleQuantityChange(cartItem._id, newQuantity);
                            }}
                            size="small"
                            sx={{
                              width: 80,
                              mx: 1,
                              ...blackBorderStyle,
                            }}
                            inputProps={{
                              min: 1,
                              max: maxQuantity,
                              style: {
                                textAlign: "center",
                                fontWeight: 700,
                                fontSize: "1rem",
                              },
                            }}
                            disabled={isUpdating}
                          />
                          <IconButton
                            onClick={() => handleQuantityChange(cartItem._id, cartItem.quantity + 1)}
                            disabled={isUpdating || cartItem.quantity >= maxQuantity}
                            sx={{
                              border: "2px solid black",
                              borderRadius: 0,
                              color: "black",
                              "&:hover": { bgcolor: "black", color: "white" },
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      );
                    })()}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Box>

        {/* Tổng quan giỏ hàng */}
        <Box sx={{ flex: { md: 1 } }}>
          <Paper
            elevation={3}
            sx={{
              bgcolor: "white",
              borderRadius: 0,
              border: "2px solid black",
              p: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: "black",
                mb: 2,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                textAlign: "center",
              }}
            >
              {t("orderSummary")}
            </Typography>

            {/* Warning về items chưa hoàn thành */}
            {hasIncompleteItems && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 2, 
                  borderRadius: 0, 
                  border: "1px solid #ed6c02",
                  bgcolor: "#fff4e5",
                  color: "#ed6c02",
                  fontWeight: 600,
                  fontSize: "0.875rem"
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

            <Box sx={{ position: "relative", my: 3 }}>
              <Divider sx={{ borderColor: "black", borderWidth: 2 }} />
            </Box>

            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 700, color: "black", textTransform: "uppercase" }}>{t("subtotal")}:</Typography>
                <Typography sx={{ fontWeight: 700, color: "black" }}>
                  {subtotal.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 700, color: "black", textTransform: "uppercase" }}>
                  {t("shippingFee")}:
                </Typography>
                <Typography sx={{ fontWeight: 700, color: "black" }}>
                  {shipping.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </Typography>
              </Box>

              <Box sx={{ position: "relative", my: 2 }}>
                <Divider sx={{ borderColor: "black", borderWidth: 2 }} />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: "black",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  {t("total")}:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: "black",
                    letterSpacing: "0.02em",
                  }}
                >
                  {total.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2} sx={{ mt: 4 }}>
              <Tooltip 
                title={hasIncompleteItems ? "Vui lòng chọn size và màu cho tất cả sản phẩm trước khi thanh toán" : ""}
                placement="top"
              >
                <span>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleCheckout}
                    disabled={isProcessingPayment || hasIncompleteItems}
                    sx={{
                      ...buttonStyle,
                      bgcolor: "black",
                      color: "white",
                      "&:hover": { bgcolor: "gray.800" },
                      "&.Mui-disabled": {
                        bgcolor: "gray.400",
                        color: "gray.600"
                      }
                    }}
                  >
                    {isProcessingPayment ? "Đang xử lý..." : t("checkout")}
                  </Button>
                </span>
              </Tooltip>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push("/")}
                sx={{
                  ...buttonStyle,
                  borderColor: "black",
                  color: "black",
                  borderWidth: 2,
                  "&:hover": {
                    borderColor: "black",
                    bgcolor: "black",
                    color: "white",
                    borderWidth: 2,
                  },
                }}
              >
                {t("continueShopping")}
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={handleClearCart}
                sx={{
                  ...buttonStyle,
                  color: "black",
                  border: "2px solid transparent",
                  "&:hover": {
                    bgcolor: "black",
                    color: "white",
                  },
                }}
              >
                {t("clearCart")}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
