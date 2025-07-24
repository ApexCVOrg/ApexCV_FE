"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  Alert, 
  Divider, 
  Avatar,
  Container,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  LinearProgress
} from "@mui/material";
import { Inter, Roboto } from 'next/font/google';

// Khởi tạo font cho tiếng Việt
const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter'
});

const roboto = Roboto({ 
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto'
});
import { 
  ShoppingCart, 
  LocationOn, 
  Payment, 
  LocalShipping, 
  CheckCircle,
  Warning,
  Edit
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { THEME } from "@/lib/constants/constants";
import api from "@/services/api";
import { createVnpayPayment } from "@/services/api";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    brand?: { _id: string; name: string };
    sizes?: { size: string; stock: number; color?: string }[];
    colors?: string[];
  };
  size?: string;
  color?: string;
  quantity: number;
}
interface Address {
  _id: string;
  street: string;
  city: string;
  state?: string;
  country?: string;
  addressNumber?: string;
  isDefault?: boolean;
  phone?: string;
  recipientName?: string;
}
interface UserProfile {
  _id: string;
  fullName?: string;
  phone?: string;
  addresses?: Address[];
}

// Định nghĩa interface Order nếu chưa có
interface Order {
  _id: string;
  // ... các trường khác nếu cần
}

export default function CheckoutPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { theme: currentTheme } = useTheme();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [userPhone, setUserPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);

  const isDarkMode = currentTheme === THEME.DARK;

  // Lấy danh sách sản phẩm được chọn từ localStorage
  const selectedIds = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("selectedCartItemIds") || "[]");
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    // Lấy cart và user info
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        // Lấy cart
        const cartRes = await api.get("/carts/user", { headers: { Authorization: `Bearer ${token}` } });
        const cartData = cartRes.data as { cartItems: CartItem[] };
        // Lọc chỉ các sản phẩm được chọn
        const filtered = (cartData.cartItems || []).filter((item: CartItem) => selectedIds.includes(item._id));
        setCartItems(filtered);
        // Lấy địa chỉ user
        const userRes = await api.get("/users/profile", { headers: { Authorization: `Bearer ${token}` } });
        const userData = userRes.data as UserProfile;
        const addresses = userData.addresses || [];
        setUserPhone(userData.phone || "");
        const mainAddress = addresses.find((a: Address) => a.isDefault) || addresses[0] || null;
        if (mainAddress && !mainAddress.phone && userData.phone) mainAddress.phone = userData.phone;
        setAddress(mainAddress);
      } catch {
        setError("Lỗi khi lấy thông tin giỏ hàng hoặc địa chỉ.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken, selectedIds]);

  // Lấy appliedCoupons từ localStorage
  const appliedCoupons = useMemo(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("appliedCoupons") || "{}");
    } catch {
      return {};
    }
  }, []);

  // Helper: Lấy giá gốc đã discount (không coupon)
  const getProductDisplayPrice = (item: CartItem) => item.product?.discountPrice || item.product?.price || 0;

  // subtotal là tổng giá sản phẩm đã discount (nếu có), không áp coupon
  const subtotal = cartItems.reduce((sum, item) => {
    const price = getProductDisplayPrice(item);
    return sum + price * item.quantity;
  }, 0);

  // Lấy giảm giá phí vận chuyển từ localStorage
  const shippingDiscountObj = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("shippingDiscount") || "null");
    } catch {
      return null;
    }
  }, []);
  const shippingDiscount = shippingDiscountObj?.amount || 0;
  const shippingDiscountCode = shippingDiscountObj?.code || "";

  // Tính phí vận chuyển (đồng bộ với cart)
  const shippingFee = 30000;
  // Tính tổng giảm giá từ coupon sản phẩm
  const productCouponDiscount = cartItems.reduce((total, item) => {
    const coupon = appliedCoupons[item._id];
    if (coupon && coupon.newPrice) {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return total + (price - coupon.newPrice) * item.quantity;
    }
    return total;
  }, 0);

  // Tổng thanh toán = tổng tiền sản phẩm + phí vận chuyển - giảm giá phí vận chuyển - tổng giảm giá coupon
  const total = subtotal + shippingFee - shippingDiscount - productCouponDiscount;

  const handlePlaceOrder = async () => {
    // Clear dữ liệu cũ trước khi thanh toán
    localStorage.removeItem("appliedCoupons");
    localStorage.removeItem("selectedCartItemIds");
    localStorage.removeItem("shippingDiscount");
    if (!address) {
      setError("Bạn chưa có thông tin địa chỉ, hãy cập nhật!");
      router.push("/profile");
      return;
    }
    if (!address.phone && !userPhone) {
      setError("Địa chỉ giao hàng chưa có số điện thoại. Vui lòng cập nhật số điện thoại trong profile!");
      router.push("/profile");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const token = getToken();
      if (paymentMethod === "COD") {
        // Tạo order COD
        const res = await api.post("/orders", {
          orderItems: cartItems,
          shippingAddress: address,
          paymentMethod: "COD",
        }, { headers: { Authorization: `Bearer ${token}` } });
        const order = res.data as Order;
        if (order && order._id) {
          router.push(`/order-history`);
        } else {
          setError("Đặt hàng thất bại!");
        }
      } else {
        // Thanh toán qua VNPAY (gọi flow cũ)
        // Chuẩn bị dữ liệu order giống như cart/page.tsx
        const vnpayData = {
          vnp_Amount: total,
          vnp_IpAddr: '127.0.0.1',
          vnp_ReturnUrl: `${window.location.origin}/payment/vnpay-return`,
          vnp_TxnRef: `ORDER_${Date.now()}`,
          vnp_OrderInfo: `Thanh toan don hang ${Date.now()}`,
          vnp_ExpireDate: Math.floor((Date.now() + 15 * 60 * 1000) / 1000),
          vnp_CreateDate: Math.floor(Date.now() / 1000),
          orderItems: cartItems.map(item => ({
            product: item.product?._id,
            name: item.product?.name,
            quantity: item.quantity,
            size: [{
              size: item.size || 'M',
              color: item.color || 'Default',
              quantity: item.quantity,
            }],
            price: item.product?.discountPrice || item.product?.price || 0,
          })),
          shippingAddress: {
            fullName: address.recipientName,
            phone: address.phone || userPhone || "",
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.addressNumber,
            country: address.country,
          },
          paymentMethod: 'VNPAY',
          totalPrice: total,
          taxPrice: 0,
          shippingPrice: 0,
        };
        // Set token vào cookies trước khi redirect sang VNPAY
        if (token) {
          document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Lax`;
        }
        const paymentUrl = await createVnpayPayment(vnpayData);
        window.location.href = paymentUrl;
        return;
      }
    } catch {
      setError("Đặt hàng thất bại!");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Card sx={{ 
          maxWidth: 400, 
          width: '100%', 
          textAlign: 'center', 
          p: 3,
          bgcolor: isDarkMode ? '#1e1e2e' : '#ffffff',
          color: isDarkMode ? 'white' : '#1a1a1a',
          border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`
        }}>
          <LinearProgress sx={{ 
            mb: 2, 
            bgcolor: isDarkMode ? '#2d2d44' : '#e0e0e0', 
            '& .MuiLinearProgress-bar': { bgcolor: '#4a9eff' } 
          }} />
          <Typography variant="h6" sx={{ 
            color: isDarkMode ? 'white' : '#1a1a1a',
            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 500
          }}>
            Đang tải thông tin đơn hàng...
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      className={`${inter.variable} ${roboto.variable}`}
      sx={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
        pt: 8,
        pb: 4,
        fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={8}
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            background: isDarkMode ? '#1e1e2e' : '#ffffff',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`,
            fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3,
              textAlign: 'center',
              borderBottom: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`
            }}
          >
            <ShoppingCart sx={{ fontSize: 40, mb: 1, color: '#4a9eff' }} />
            <Typography variant="h4" sx={{ 
              fontWeight: 900, 
              mb: 1, 
              color: 'white',
              fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: '-0.02em'
            }}>
              Xác nhận đơn hàng
            </Typography>
            <Typography variant="body1" sx={{ 
              opacity: 0.8, 
              color: '#b8b8b8',
              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 400
            }}>
              Kiểm tra thông tin trước khi thanh toán
            </Typography>
          </Box>

          <Box sx={{ p: 4, bgcolor: isDarkMode ? '#1e1e2e' : '#ffffff' }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  bgcolor: isDarkMode ? '#2d1b1b' : '#fdecea',
                  color: '#ff6b6b',
                  border: `1px solid ${isDarkMode ? '#4a1f1f' : '#f5c6cb'}`,
                  '& .MuiAlert-icon': { fontSize: 28, color: '#ff6b6b' }
                }}
                icon={<Warning fontSize="large" />}
              >
                {error}
              </Alert>
            )}

            {/* Customer Information Section */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2, 
              border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`, 
              bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa' 
            }}>
              <CardContent sx={{ bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa', borderRadius: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2, 
                  bgcolor: isDarkMode ? '#1a1a2e' : '#e9ecef', 
                  p: 1, 
                  borderRadius: 1, 
                  border: `1px solid ${isDarkMode ? '#3d3d5a' : '#dee2e6'}` 
                }}>
                  <LocationOn sx={{ color: '#4a9eff', mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    letterSpacing: '-0.01em'
                  }}>
                    Thông tin người nhận
                  </Typography>
                </Box>
                
                {address ? (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: isDarkMode ? '#1e1e2e' : '#ffffff', 
                    borderRadius: 2, 
                    border: `1px solid ${isDarkMode ? '#3d3d5a' : '#e0e0e0'}` 
                  }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body1" sx={{ 
                          color: isDarkMode ? '#b8b8b8' : '#666666',
                          fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: 400,
                          lineHeight: 1.5
                        }}>
                          <strong>Họ tên:</strong> {address.recipientName}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => router.push("/profile")}
                          sx={{ color: '#4a9eff', ml: 1 }}
                        >
                          <Edit />
                        </IconButton>
                      </Box>
                      <Typography variant="body1" sx={{ 
                        color: isDarkMode ? '#b8b8b8' : '#666666',
                        fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 400,
                        lineHeight: 1.5
                      }}>
                        <strong>Địa chỉ:</strong> {address.street}, {address.city}, {address.state}, {address.country}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: isDarkMode ? '#b8b8b8' : '#666666',
                        fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 400,
                        lineHeight: 1.5
                      }}>
                        <strong>SĐT:</strong> {address.phone}
                      </Typography>
                    </Stack>
                    <Chip 
                      label="Địa chỉ mặc định" 
                      sx={{ 
                        mt: 1, 
                        bgcolor: isDarkMode ? '#1a3a1a' : '#e8f5e8', 
                        color: '#4caf50',
                        border: `1px solid ${isDarkMode ? '#2d5a2d' : '#c8e6c9'}`
                      }}
                      size="small" 
                      icon={<CheckCircle />}
                    />
                  </Box>
                ) : (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: isDarkMode ? '#2d2a1b' : '#fff3e0',
                      color: '#ffa726',
                      border: `1px solid ${isDarkMode ? '#4a3f1f' : '#ffcc02'}`,
                      '& .MuiAlert-action': { alignItems: 'center' }
                    }}
                    action={
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={() => router.push("/profile")}
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: '#4a9eff',
                          '&:hover': { bgcolor: '#3a8eef' }
                        }}
                      >
                        Cập nhật ngay
                      </Button>
                    }
                  >
                    Bạn chưa có thông tin địa chỉ giao hàng.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2, 
              border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`, 
              bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa' 
            }}>
              <CardContent sx={{ bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa', borderRadius: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2, 
                  bgcolor: isDarkMode ? '#1a1a2e' : '#e9ecef', 
                  p: 1, 
                  borderRadius: 1, 
                  border: `1px solid ${isDarkMode ? '#3d3d5a' : '#dee2e6'}` 
                }}>
                  <ShoppingCart sx={{ color: '#4a9eff', mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    letterSpacing: '-0.01em'
                  }}>
                    Sản phẩm đã chọn
                  </Typography>
                  <Chip 
                    label={`${cartItems.length} sản phẩm`} 
                    size="small" 
                    sx={{ 
                      ml: 'auto', 
                      bgcolor: isDarkMode ? '#1a1a2e' : '#e9ecef', 
                      color: '#4a9eff',
                      border: `1px solid ${isDarkMode ? '#3d3d5a' : '#dee2e6'}`
                    }}
                  />
                </Box>

                {cartItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ShoppingCart sx={{ fontSize: 60, color: isDarkMode ? '#4a4a6a' : '#bdbdbd', mb: 2 }} />
                    <Typography variant="h6" sx={{ 
                      color: isDarkMode ? '#8a8a8a' : '#666666',
                      fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontWeight: 500
                    }}>
                      Không có sản phẩm nào trong giỏ hàng
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {cartItems.map((item, idx) => {
                      const originalPrice = getProductDisplayPrice(item);
                      return (
                        <Box 
                          key={idx} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            p: 2, 
                            bgcolor: isDarkMode ? '#1e1e2e' : '#ffffff', 
                            borderRadius: 2,
                            border: `1px solid ${isDarkMode ? '#3d3d5a' : '#e0e0e0'}`
                          }}
                        >
                          <Avatar 
                            src={item.product?.images?.[0] || ""} 
                            variant="rounded" 
                            sx={{ 
                              width: 70, 
                              height: 70,
                              border: `2px solid ${isDarkMode ? '#3d3d5a' : '#e0e0e0'}`
                            }} 
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              mb: 0.5, 
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              letterSpacing: '-0.01em'
                            }}>
                              {item.product?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              mb: 0.5, 
                              color: isDarkMode ? '#b8b8b8' : '#666666',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              fontWeight: 400
                            }}>
                              Số lượng: <strong style={{ color: isDarkMode ? 'white' : '#1a1a1a' }}>{item.quantity}</strong>
                            </Typography>
                            {item.size && (
                              <Typography variant="body2" sx={{ 
                                color: isDarkMode ? '#b8b8b8' : '#666666',
                                fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                fontWeight: 400
                              }}>
                                Size: <strong style={{ color: isDarkMode ? 'white' : '#1a1a1a' }}>{item.size}</strong>
                                {item.color && ` | Màu: ${item.color}`}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              color: '#4a9eff',
                              fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              letterSpacing: '-0.01em'
                            }}>
                              {(originalPrice * item.quantity).toLocaleString('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                              })}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: isDarkMode ? '#8a8a8a' : '#666666',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              fontWeight: 400
                            }}>
                              {originalPrice.toLocaleString('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                              })} x {item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2, 
              border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`, 
              bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa' 
            }}>
              <CardContent sx={{ bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa', borderRadius: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2, 
                  bgcolor: isDarkMode ? '#1a1a2e' : '#e9ecef', 
                  p: 1, 
                  borderRadius: 1, 
                  border: `1px solid ${isDarkMode ? '#3d3d5a' : '#dee2e6'}` 
                }}>
                  <Payment sx={{ color: '#4a9eff', mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    letterSpacing: '-0.01em'
                  }}>
                    Tổng thanh toán
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ 
                      color: isDarkMode ? 'white' : '#1a1a1a',
                      fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontWeight: 500
                    }}>Tổng tiền sản phẩm</Typography>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600, 
                      color: isDarkMode ? 'white' : '#1a1a1a',
                      fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}>
                      {subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Box>
                  
                  {productCouponDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ 
                        color: '#4caf50',
                        fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 500
                      }}>
                        Giảm giá sản phẩm (coupon)
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: '#4caf50', 
                        fontWeight: 600,
                        fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                      }}>
                        -{productCouponDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShipping sx={{ fontSize: 20, mr: 0.5, color: isDarkMode ? '#8a8a8a' : '#666666' }} />
                      <Typography variant="body1" sx={{ 
                        color: isDarkMode ? 'white' : '#1a1a1a',
                        fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 500
                      }}>Phí vận chuyển</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600, 
                      color: isDarkMode ? 'white' : '#1a1a1a',
                      fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}>
                      {shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Box>
                  
                  {shippingDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ 
                        color: '#4caf50',
                        fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 500
                      }}>
                        Giảm giá phí vận chuyển {shippingDiscountCode && `[${shippingDiscountCode}]`}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: '#4caf50', 
                        fontWeight: 600,
                        fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                      }}>
                        -{shippingDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1, bgcolor: isDarkMode ? '#3d3d5a' : '#e0e0e0' }} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    bgcolor: isDarkMode ? '#1a1a2e' : '#e9ecef',
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    borderRadius: 2,
                    border: `1px solid ${isDarkMode ? '#3d3d5a' : '#dee2e6'}`
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: isDarkMode ? 'white' : '#1a1a1a',
                      fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      letterSpacing: '-0.01em'
                    }}>
                      Tổng thanh toán
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 900, 
                      color: '#4a9eff',
                      fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      letterSpacing: '-0.02em'
                    }}>
                      {total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2, 
              border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`, 
              bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa' 
            }}>
              <CardContent sx={{ bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 2, 
                  color: isDarkMode ? 'white' : '#1a1a1a',
                  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  letterSpacing: '-0.01em'
                }}>
                  Phương thức thanh toán
                </Typography>
                <FormControl fullWidth>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <FormControlLabel 
                        value="COD" 
                        control={<Radio sx={{ color: '#4a9eff', '&.Mui-checked': { color: '#4a9eff' } }} />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ 
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              fontWeight: 500
                            }}>Thanh toán khi nhận hàng (COD)</Typography>
                            <Chip 
                              label="Miễn phí" 
                              size="small" 
                              sx={{ 
                                bgcolor: isDarkMode ? '#1a3a1a' : '#e8f5e8', 
                                color: '#4caf50',
                                border: `1px solid ${isDarkMode ? '#2d5a2d' : '#c8e6c9'}`
                              }}
                            />
                          </Box>
                        }
                        sx={{
                          flex: 1,
                          minWidth: 250,
                          p: 2,
                          border: paymentMethod === 'COD' ? '2px solid #4a9eff' : `1px solid ${isDarkMode ? '#3d3d5a' : '#e0e0e0'}`,
                          borderRadius: 2,
                          bgcolor: paymentMethod === 'COD' ? (isDarkMode ? '#1e1e2e' : '#f0f8ff') : 'transparent',
                          color: isDarkMode ? 'white' : '#1a1a1a'
                        }}
                      />
                      <FormControlLabel 
                        value="VNPAY" 
                        control={<Radio sx={{ color: '#4a9eff', '&.Mui-checked': { color: '#4a9eff' } }} />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ 
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              fontWeight: 500
                            }}>Thanh toán qua VNPAY</Typography>
                            <Chip 
                              label="An toàn" 
                              size="small" 
                              sx={{ 
                                bgcolor: isDarkMode ? '#1a1a2e' : '#e9ecef', 
                                color: '#4a9eff',
                                border: `1px solid ${isDarkMode ? '#3d3d5a' : '#dee2e6'}`
                              }}
                            />
                          </Box>
                        }
                        sx={{
                          flex: 1,
                          minWidth: 250,
                          p: 2,
                          border: paymentMethod === 'VNPAY' ? '2px solid #4a9eff' : `1px solid ${isDarkMode ? '#3d3d5a' : '#e0e0e0'}`,
                          borderRadius: 2,
                          bgcolor: paymentMethod === 'VNPAY' ? (isDarkMode ? '#1e1e2e' : '#f0f8ff') : 'transparent',
                          color: isDarkMode ? 'white' : '#1a1a1a'
                        }}
                      />
                    </Box>
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={placing || !address || cartItems.length === 0}
              onClick={handlePlaceOrder}
              sx={{
                background: 'linear-gradient(135deg, #4a9eff 0%, #3a8eef 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: 18,
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(74, 158, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3a8eef 0%, #4a9eff 100%)',
                  boxShadow: '0 12px 35px rgba(74, 158, 255, 0.4)',
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: isDarkMode ? '#2d2d44' : '#e0e0e0',
                  color: isDarkMode ? '#8a8a8a' : '#999999',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              {placing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <LinearProgress 
                    sx={{ 
                      width: 20, 
                      height: 2, 
                      bgcolor: 'rgba(255,255,255,0.3)', 
                      borderRadius: 1,
                      '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                    }} 
                  />
                  <Typography color="white" sx={{
                  fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 500
                }}>Đang xử lý...</Typography>
                </Box>
              ) : (
                <Typography color="white" sx={{
                  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.01em'
                }}>
                  {paymentMethod === "COD" ? "Đặt hàng ngay" : "Thanh toán qua VNPAY"}
                </Typography>
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 