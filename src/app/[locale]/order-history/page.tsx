/* eslint-disable */
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/card";
import StarIcon from '@mui/icons-material/Star';
import api from '@/services/api';
import { Rating, Button, Card, CardContent, Typography, Box, CircularProgress, TextField, Grid, Chip } from '@mui/material';
import styled from '@emotion/styled';
import { getRefundHistoryByOrder } from '@/services/api';

// Styled components for better organization and reusability of styles
const PageContainer = styled(Box)`
  max-width: 1200px;
  margin: 40px auto;
  padding: 24px;
`;

const SectionTitle = styled(Typography)`
  font-weight: 600; /* Adjusted font-weight for consistency */
  margin-bottom: 24px;
  color: #111a2f;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; /* Ensuring consistent font family */
`;

const OrderCard = styled(Card)`
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: translateY(-4px);
  }
`;

const ProductItemContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const ProductImage = styled('img')`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const ReviewCard = styled(Card)`
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
`;

const ReviewFormCard = styled(Card)`
  margin-top: 16px;
  background: #fff;
  border: 1px solid #111a2f;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
`;

const StyledRatingContainer = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const StyledStarIcon = styled(StarIcon)`
  font-size: 28px;
  cursor: pointer;
  transition: color 0.2s;
`;

const StyledTextArea = styled(TextField)`
  width: 100%;
  margin-bottom: 16px;
  .MuiOutlinedInput-root {
    border-radius: 8px;
    background: #fafbfc;
    font-weight: 500;
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: #e0e0e0;
  }
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: #111a2f;
  }
  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #111a2f;
    border-width: 2px;
  }
`;

const SubmitButton = styled(Button)`
  background: ${props => (props.disabled ? '#bdbdbd' : '#111a2f')};
  color: #fff;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: ${props => (props.disabled ? '#bdbdbd' : '#222c4c')};
    transform: translateY(-2px);
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

interface OrderItem {
  product: Product | { _id: string; name?: string; images?: string[]; price?: number; discountPrice?: number; } | string;
  quantity: number;
  price?: number;
  size?: { size: string; color?: string }[];
  coupon?: { newPrice?: number }; // <-- Add this line
}

interface Order {
  _id: string;
  createdAt: string;
  orderItems: OrderItem[];
  orderStatus?: string; // Added orderStatus to the interface
  shippingFee?: number; // Add this
  shippingDiscount?: number; // Add this
}

interface Product {
  _id: string;
  name: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  brand?: { _id: string; name: string } | string;
  categories?: { _id: string; name: string }[];
}

const HistoryPage = () => {
  const { isAuthenticated, getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userReviews, setUserReviews] = useState<Record<string, { rating: number; comment: string }>>({});
  const [form, setForm] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [refundHistories, setRefundHistories] = useState<Record<string, any[]>>({});

  // Gộp tất cả sản phẩm đã mua từ mọi đơn hàng, chỉ lấy mỗi sản phẩm 1 lần duy nhất
  const allProducts: Product[] = useMemo(() => {
    const seen = new Set<string>();
    const result: Product[] = [];
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (typeof item.product === "object" && item.product && !seen.has(item.product._id)) {
          result.push(item.product as Product);
          seen.add(item.product._id);
        }
      });
    });
    return result;
  }, [orders]);

  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const token = getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://nidas-be.onrender.com/api"}/orders/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Lỗi khi lấy lịch sử đơn hàng");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, getToken, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId || payload.id || null);
      } catch (error) {
        console.error("Failed to parse token:", error);
        setUserId(null);
      }
    }
  }, [isAuthenticated, getToken]);

  useEffect(() => {
    if (!userId) return;
    const fetchUserReviews = async () => {
      const reviews: Record<string, { rating: number; comment: string }> = {};
      for (const product of allProducts) {
        try {
          const res = await api.get(`/reviews?product=${product._id}&user=${userId}`);
          const data = res.data as Array<{ rating: number; comment: string }>;
          if (data && data.length > 0) {
            reviews[product._id] = { rating: data[0].rating, comment: data[0].comment };
          }
        } catch (error) {
          console.error(`Failed to fetch review for product ${product._id}:`, error);
        }
      }
      setUserReviews(reviews);
    };
    fetchUserReviews();
  }, [userId, allProducts]);

  useEffect(() => {
    const fetchAverages = async () => {
      const ratings: Record<string, number> = {};
      await Promise.all(allProducts.map(async (product) => {
        try {
          const res = await api.get(`/reviews/average/${product._id}`);
          const data = res.data as { average: number };
          ratings[product._id] = data.average || 0;
        } catch (error) {
          console.error(`Failed to fetch average rating for product ${product._id}:`, error);
          ratings[product._id] = 0;
        }
      }));
      setAverageRatings(ratings);
    };
    if (allProducts.length > 0) fetchAverages();
  }, [allProducts, refreshKey]);

  useEffect(() => {
    async function fetchAllRefundHistories() {
      const histories: Record<string, any[]> = {};
      for (const order of orders) {
        histories[order._id] = await getRefundHistoryByOrder(order._id);
      }
      setRefundHistories(histories);
    }
    if (orders.length) fetchAllRefundHistories();
  }, [orders]);

  const handleRatingChange = (productId: string, value: number) => {
    setForm(f => ({ ...f, [productId]: { ...f[productId], rating: value } }));
  };

  const handleCommentChange = (productId: string, value: string) => {
    setForm(f => ({ ...f, [productId]: { ...f[productId], comment: value } }));
  };

  const handleSubmit = async (productId: string) => {
    setSubmitting(s => ({ ...s, [productId]: true }));
    try {
      await api.post('/reviews', {
        product: productId,
        rating: form[productId]?.rating,
        comment: form[productId]?.comment,
      });
      setUserReviews(r => ({ ...r, [productId]: { rating: form[productId]?.rating, comment: form[productId]?.comment } }));
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error(`Failed to submit review for product ${productId}:`, error);
      // You could add a user-facing error message here
    } finally {
      setSubmitting(s => ({ ...s, [productId]: false }));
    }
  };

  // Helper: Tính tổng tiền sản phẩm gốc
  const getProductSubtotal = (order: Order) => order.orderItems.reduce((sum, item) => {
    const product = typeof item.product === 'object' && item.product ? item.product as Partial<Product> : {};
    const price = product.discountPrice || product.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);
  // Helper: Tính tổng giảm giá coupon sản phẩm
  const getProductCouponDiscount = (order: Order) => order.orderItems.reduce((sum, item) => {
    const product = typeof item.product === 'object' && item.product ? item.product as Partial<Product> : {};
    const coupon = item.coupon || null;
    if (coupon && coupon.newPrice) {
      const price = product.discountPrice || product.price || item.price || 0;
      return sum + (price - coupon.newPrice) * item.quantity;
    }
    return sum;
  }, 0);
  // Helper: Lấy phí vận chuyển và giảm giá phí vận chuyển (giả sử có trường shippingFee, shippingDiscount trên order, nếu không thì mặc định)
  const getShippingFee = (order: Order) => order.shippingFee ?? 30000;
  const getShippingDiscount = (order: Order) => order.shippingDiscount ?? 0;
  // Helper: Tổng thanh toán
  const getOrderTotal = (order: Order) => {
    const subtotal = getProductSubtotal(order);
    const couponDiscount = getProductCouponDiscount(order);
    const shippingFee = getShippingFee(order);
    const shippingDiscount = getShippingDiscount(order);
    return subtotal + shippingFee - shippingDiscount - couponDiscount;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Đang tải lịch sử mua hàng...</Typography>
      </Box>
    );
  }

  if (!orders.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6" color="text.secondary">Bạn chưa có đơn hàng nào.</Typography>
      </Box>
    );
  }

  return (
    <PageContainer>
      <SectionTitle variant="h4">Lịch sử đơn hàng của bạn</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 6 }}>
        {orders.map(order => {
          const refundHistory = refundHistories[order._id] || [];
          const rejectedRefunds = refundHistory.filter(r => r.status === 'rejected');
          const isRejectedLimit = rejectedRefunds.length >= 3;
          const lastRefund = refundHistory.length ? refundHistory[refundHistory.length - 1] : null;
          const hasAcceptedRefund = refundHistory.some(r => r.status === 'accepted');

          // Nếu có request refund đang chờ duyệt thì hiển thị trạng thái pending, không cho gửi mới
          if (lastRefund && lastRefund.status === 'pending') {
            return (
              <OrderCard key={order._id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111a2f' }}>Mã đơn: #{order._id.slice(-8).toUpperCase()}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{new Date(order.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>Các sản phẩm trong đơn:</Typography>
                  <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {order.orderItems.map((item, idx) => {
                      const productDetails = typeof item.product === 'object' && item.product ? item.product as Product : null;
                      const productName = productDetails?.name || (typeof item.product === 'string' ? item.product : 'Sản phẩm đã xóa');
                      const productImage = productDetails?.images && productDetails.images[0] ? productDetails.images[0] : "";
                      const itemPrice = productDetails?.discountPrice || productDetails?.price || item.price || 0;

                      return (
                        <ProductItemContainer key={idx}>
                          {productImage && <ProductImage src={productImage} alt={productName} />}
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111a2f' }}>{productName}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Giá: <b>{itemPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</b>
                              {item.size && Array.isArray(item.size) && item.size.length > 0 && (
                                <> | Size: **{item.size[0].size}** {item.size[0].color ? `| Màu: **${item.size[0].color}**` : ''}</>
                              )}
                              | Số lượng: **{item.quantity}**
                            </Typography>
                          </Box>
                        </ProductItemContainer>
                      );
                    })}
                  </Box>
                  <Chip label="Đang chờ duyệt hoàn tiền" color="warning" sx={{ fontWeight: 700, fontSize: 15, mt: 2 }} />
                </CardContent>
              </OrderCard>
            );
          }

          // Nếu đơn đã refunded thì không hiển thị trạng thái bị từ chối và nút thử lại
          if (order.orderStatus === 'refunded') {
            return (
              <OrderCard key={order._id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111a2f' }}>Mã đơn: #{order._id.slice(-8).toUpperCase()}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{new Date(order.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>Các sản phẩm trong đơn:</Typography>
                  <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {order.orderItems.map((item, idx) => {
                      const productDetails = typeof item.product === 'object' && item.product ? item.product as Product : null;
                      const productName = productDetails?.name || (typeof item.product === 'string' ? item.product : 'Sản phẩm đã xóa');
                      const productImage = productDetails?.images && productDetails.images[0] ? productDetails.images[0] : "";
                      const itemPrice = productDetails?.discountPrice || productDetails?.price || item.price || 0;

                      return (
                        <ProductItemContainer key={idx}>
                          {productImage && <ProductImage src={productImage} alt={productName} />}
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111a2f' }}>{productName}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Giá: <b>{itemPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</b>
                              {item.size && Array.isArray(item.size) && item.size.length > 0 && (
                                <> | Size: **{item.size[0].size}** {item.size[0].color ? `| Màu: **${item.size[0].color}**` : ''}</>
                              )}
                              | Số lượng: **{item.quantity}**
                            </Typography>
                          </Box>
                        </ProductItemContainer>
                      );
                    })}
                  </Box>
                  {/* Hiển thị Chip Đã hoàn tiền ở góc trái dưới */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Chip label="Đã hoàn tiền" color="success" sx={{ fontWeight: 700, fontSize: 15, px: 2, py: 0.5 }} />
                  </Box>
                </CardContent>
              </OrderCard>
            );
          }

          return (
            <OrderCard key={order._id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111a2f' }}>Mã đơn: #{order._id.slice(-8).toUpperCase()}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{new Date(order.createdAt).toLocaleString('vi-VN', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>Các sản phẩm trong đơn:</Typography>
                <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {order.orderItems.map((item, idx) => {
                    const productDetails = typeof item.product === 'object' && item.product ? item.product as Product : null;
                    const productName = productDetails?.name || (typeof item.product === 'string' ? item.product : 'Sản phẩm đã xóa');
                    const productImage = productDetails?.images && productDetails.images[0] ? productDetails.images[0] : "";
                    const itemPrice = productDetails?.discountPrice || productDetails?.price || item.price || 0;

                    return (
                      <ProductItemContainer key={idx}>
                        {productImage && <ProductImage src={productImage} alt={productName} />}
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#111a2f' }}>{productName}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Giá: <b>{itemPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</b>
                            {item.size && Array.isArray(item.size) && item.size.length > 0 && (
                              <> | Size: **{item.size[0].size}** {item.size[0].color ? `| Màu: **${item.size[0].color}**` : ''}</>
                            )}
                            | Số lượng: **{item.quantity}**
                          </Typography>
                        </Box>
                      </ProductItemContainer>
                    );
                  })}
                </Box>
                {/* Trạng thái refund và nút retry */}
                {lastRefund && lastRefund.status === 'pending' && (
                  <Chip label="Đang chờ duyệt hoàn tiền" color="warning" sx={{ fontWeight: 700, fontSize: 15, mb: 1 }} />
                )}
                {hasAcceptedRefund && (
                  <Chip label="Đã hoàn tiền" color="success" sx={{ fontWeight: 700, fontSize: 15, mb: 1 }} />
                )}
                {!hasAcceptedRefund && lastRefund && lastRefund.status === 'rejected' && !isRejectedLimit && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip label="Bị từ chối hoàn tiền" color="error" sx={{ fontWeight: 700, fontSize: 15 }} />
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                      onClick={() => router.push(`/order-history/${order._id}/refund`)}
                    >
                      Thử lại hoàn tiền
                    </Button>
                  </Box>
                )}
                {!hasAcceptedRefund && isRejectedLimit && (
                  <Chip label="Đã bị từ chối hoàn tiền 3 lần" color="error" sx={{ fontWeight: 700, fontSize: 15, mb: 1 }} />
                )}
                {/* Nút gửi refund chỉ hiện nếu chưa từng bị từ chối, chưa refund thành công, chưa pending */}
                {order.orderStatus !== 'refunded' && !isRejectedLimit && !hasAcceptedRefund && (!lastRefund || (lastRefund.status !== 'pending' && lastRefund.status !== 'rejected' && lastRefund.status !== 'accepted')) && (
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ borderRadius: '8px', fontWeight: 700, mt: 2, px: 3, py: 1 }}
                    onClick={() => router.push(`/order-history/${order._id}/refund`)}
                  >
                    Bạn muốn hoàn tiền?
                  </Button>
                )}
                {/* Tổng quan giá */}
                <Box sx={{ mt: 2, mb: 1, p: 2, bgcolor: '#fafbfc', borderRadius: 2, border: '1px solid #eee' }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Tổng tiền sản phẩm</Typography>
                    <Typography>{getProductSubtotal(order).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
                  </Box>
                  {getProductCouponDiscount(order) > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>Giảm giá sản phẩm (coupon)</Typography>
                      <Typography color="error">-{getProductCouponDiscount(order).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
                    </Box>
                  )}
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Phí vận chuyển</Typography>
                    <Typography>{getShippingFee(order).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
                  </Box>
                  {getShippingDiscount(order) > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>Giảm giá phí vận chuyển</Typography>
                      <Typography color="error">-{getShippingDiscount(order).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
                    </Box>
                  )}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography fontWeight={700} fontSize={16}>Tổng thanh toán</Typography>
                    <Typography fontWeight={900} fontSize={18} color="error">
                      {getOrderTotal(order).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </OrderCard>
          );
        })}
      </Box>

      <SectionTitle variant="h5">Đánh giá sản phẩm đã mua</SectionTitle>
      <Box display="flex" flexWrap="wrap" gap={3}>
        {allProducts.map((product, idx) => (
          <Box key={product._id + idx} flex="1 1 300px" minWidth={280} maxWidth={400}>
            <ProductCard
              _id={product._id}
              name={product.name}
              image={product.images && product.images[0] ? product.images[0] : ""}
              price={product.price}
              discountPrice={product.discountPrice}
              brand={product.brand}
              categories={product.categories}
              productId={product._id}
              averageRating={averageRatings[product._id] ?? 0}
            />
            {userReviews[product._id] ? (
              <ReviewCard>
                <CardContent sx={{ paddingBottom: '16px !important' }}>
                  <StyledRatingContainer>
                    <Rating value={userReviews[product._id].rating} readOnly precision={0.5} size="medium" />
                    <Typography variant="body1" sx={{ marginLeft: 1, fontWeight: 700, color: '#111a2f' }}>{userReviews[product._id].rating}/5</Typography>
                  </StyledRatingContainer>
                  <Typography variant="body2" sx={{ color: '#222', fontSize: 15, fontWeight: 500, mb: 1 }}>{userReviews[product._id].comment}</Typography>
                  <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>(Bạn đã đánh giá sản phẩm này)</Typography>
                </CardContent>
              </ReviewCard>
            ) : (
              <ReviewFormCard>
                <CardContent sx={{ paddingBottom: '16px !important' }}>
                  <StyledRatingContainer>
                    {[1,2,3,4,5].map(i => (
                      <StyledStarIcon
                        key={i}
                        sx={{ color: (form[product._id]?.rating || 0) >= i ? '#FFD600' : '#e0e0e0' }}
                        onClick={() => handleRatingChange(product._id, i)}
                      />
                    ))}
                    <Typography variant="body1" sx={{ marginLeft: 1.5, fontWeight: 700, color: '#111a2f' }}>{form[product._id]?.rating || 0}/5</Typography>
                  </StyledRatingContainer>
                  <StyledTextArea
                    multiline
                    minRows={3}
                    maxRows={6}
                    placeholder="Nhận xét của bạn về sản phẩm này..."
                    value={form[product._id]?.comment || ''}
                    onChange={e => handleCommentChange(product._id, e.target.value)}
                    variant="outlined"
                  />
                  <SubmitButton
                    disabled={submitting[product._id] || !form[product._id]?.rating}
                    onClick={() => handleSubmit(product._id)}
                  >
                    {submitting[product._id] ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Gửi đánh giá'
                    )}
                  </SubmitButton>
                </CardContent>
              </ReviewFormCard>
            )}
          </Box>
        ))}
      </Box>
    </PageContainer>
  );
};

export default HistoryPage;