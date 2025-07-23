"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Alert, Divider, Avatar } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [userPhone, setUserPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);

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

  if (loading) return <Typography>Đang tải...</Typography>;

  return (
    <Paper sx={{ maxWidth: 700, mx: "auto", mt: 6, p: 4, borderRadius: 2, border: "2px solid #111a2f" }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Xác nhận đơn hàng</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box mb={3}>
        <Typography fontWeight={700} mb={1}>Thông tin người nhận</Typography>
        {address ? (
          <Box>
            <Typography>Họ tên: <b>{address.recipientName}</b></Typography>
            <Typography>Địa chỉ: <b>{address.street}, {address.city}, {address.state}, {address.country}</b></Typography>
            <Typography>SĐT: <b>{address.phone}</b></Typography>
          </Box>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bạn chưa có thông tin địa chỉ. <Button variant="outlined" size="small" onClick={() => router.push("/profile")}>Cập nhật ngay</Button>
          </Alert>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box mb={3}>
        <Typography fontWeight={700} mb={1}>Sản phẩm</Typography>
        {cartItems.length === 0 ? <Typography>Không có sản phẩm nào trong giỏ.</Typography> : (
          <Box>
            {cartItems.map((item, idx) => {
              const originalPrice = getProductDisplayPrice(item);
              return (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar src={item.product?.images?.[0] || ""} variant="rounded" sx={{ width: 60, height: 60 }} />
                  <Box>
                    <Typography fontWeight={700}>{item.product?.name}</Typography>
                    <Typography fontSize={15}>
                      Giá: <b>{originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</b> x {item.quantity}
                    </Typography>
                    {item.size && <Typography fontSize={14}>Size: {item.size} {item.color && `| Màu: ${item.color}`}</Typography>}
                  </Box>
                </Box>
              );
            })}
            <Divider sx={{ my: 2 }} />
            <Typography fontWeight={700} fontSize={18}>Tổng tiền sản phẩm: <span style={{ color: '#d32f2f' }}>{subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></Typography>
          </Box>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      {/* Tổng tiền như Shopee */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Tổng tiền sản phẩm</Typography>
          <Typography>{subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
        </Box>
        {productCouponDiscount > 0 && (
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Giảm giá sản phẩm (coupon)</Typography>
            <Typography color="error">-{productCouponDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
          </Box>
        )}
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Phí vận chuyển</Typography>
          <Typography>{shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
        </Box>
        {shippingDiscount > 0 && (
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Giảm giá phí vận chuyển {shippingDiscountCode && `[${shippingDiscountCode}]`}</Typography>
            <Typography color="error">-{shippingDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
          </Box>
        )}
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography fontWeight={700} fontSize={18}>Tổng thanh toán</Typography>
          <Typography fontWeight={900} fontSize={22} color="error">
            {total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box mb={3}>
        <FormControl>
          <FormLabel id="payment-method-label">Phương thức thanh toán</FormLabel>
          <RadioGroup
            row
            aria-labelledby="payment-method-label"
            name="paymentMethod"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel value="COD" control={<Radio />} label="Thanh toán khi nhận hàng (COD)" />
            <FormControlLabel value="VNPAY" control={<Radio />} label="Thanh toán qua VNPAY" />
          </RadioGroup>
        </FormControl>
      </Box>
      <Button
        variant="contained"
        color="error"
        fullWidth
        sx={{ fontWeight: 700, borderRadius: 2, fontSize: 18, py: 1.5, mt: 2 }}
        disabled={placing || !address || cartItems.length === 0}
        onClick={handlePlaceOrder}
      >
        {paymentMethod === "COD" ? "Đặt hàng" : "Thanh toán qua VNPAY"}
      </Button>
    </Paper>
  );
} 