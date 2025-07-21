
"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/card";
import StarIcon from '@mui/icons-material/Star';
import api from '@/services/api';

interface OrderItem {
  product: { _id: string; name?: string } | string;
  quantity: number;
}

interface Order {
  _id: string;
  createdAt: string;
  orderItems: OrderItem[];
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
  // Gộp tất cả sản phẩm đã mua từ mọi đơn hàng, chỉ lấy mỗi sản phẩm 1 lần duy nhất
  const allProducts: Product[] = [];
  const seen = new Set<string>();
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (typeof item.product === "object" && item.product && !seen.has(item.product._id)) {
        allProducts.push(item.product as Product);
        seen.add(item.product._id);
      }
    });
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const token = getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Lỗi khi lấy lịch sử đơn hàng");
        const data = await res.json();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, getToken, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Lấy userId từ token (giả sử token là JWT chuẩn, có userId)
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId || payload.id || null);
      } catch {
        setUserId(null);
      }
    }
  }, [isAuthenticated, getToken]);

  useEffect(() => {
    if (!userId) return;
    // Lấy review của user cho từng sản phẩm đã mua
    const fetchUserReviews = async () => {
      const reviews: Record<string, { rating: number; comment: string }> = {};
      for (const product of allProducts) {
        try {
          const res = await api.get(`/reviews?product=${product._id}&user=${userId}`);
          const data = res.data as Array<{ rating: number; comment: string }>;
          if (data && data.length > 0) {
            reviews[product._id] = { rating: data[0].rating, comment: data[0].comment };
          }
        } catch {}
      }
      setUserReviews(reviews);
    };
    fetchUserReviews();
  }, [userId, allProducts]);

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
      setRefreshKey(k => k + 1); // Tăng refreshKey để cập nhật rating realtime
    } catch {}
    setSubmitting(s => ({ ...s, [productId]: false }));
  };

  if (loading) return <div>Đang tải lịch sử mua hàng...</div>;
  if (!orders.length) return <div>Bạn chưa có đơn hàng nào.</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 24, display: "flex", flexWrap: "wrap", gap: 24 }}>
      {allProducts.map((product, idx) => (
        <div key={product._id + idx} style={{ width: 320 }}>
          <ProductCard
            _id={product._id}
            name={product.name}
            image={product.images && product.images[0] ? product.images[0] : ""}
            price={product.price}
            discountPrice={product.discountPrice}
            brand={product.brand}
            categories={product.categories}
            productId={product._id}
            refreshKey={refreshKey}
          />
          {/* Đánh giá của tôi */}
          {userReviews[product._id] ? (
            <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ color: i < userReviews[product._id].rating ? '#FFD600' : '#e0e0e0', fontSize: 22, mr: 0.5 }} />
                ))}
                <span style={{ marginLeft: 10, fontWeight: 700, color: '#111a2f', fontSize: 16 }}>{userReviews[product._id].rating}/5</span>
              </div>
              <div style={{ color: '#222', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{userReviews[product._id].comment}</div>
              <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>(Bạn đã đánh giá sản phẩm này)</div>
            </div>
          ) : (
            <div style={{ marginTop: 12, background: '#fff', border: '1px solid #111a2f', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                {[1,2,3,4,5].map(i => (
                  <StarIcon
                    key={i}
                    sx={{ color: form[product._id]?.rating >= i ? '#FFD600' : '#e0e0e0', fontSize: 26, cursor: 'pointer', transition: 'color 0.2s' }}
                    onClick={() => handleRatingChange(product._id, i)}
                  />
                ))}
                <span style={{ marginLeft: 12, fontWeight: 700, color: '#111a2f', fontSize: 16 }}>{form[product._id]?.rating || 0}/5</span>
              </div>
              <textarea
                style={{ width: '100%', minHeight: 48, borderRadius: 6, border: '1.5px solid #e0e0e0', padding: 10, fontSize: 15, marginBottom: 10, color: '#111a2f', background: '#fafbfc', fontWeight: 500, outline: 'none', resize: 'vertical' }}
                placeholder="Nhận xét của bạn về sản phẩm này..."
                value={form[product._id]?.comment || ''}
                onChange={e => handleCommentChange(product._id, e.target.value)}
              />
              <button
                style={{ background: submitting[product._id] ? '#888' : '#111a2f', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 700, fontSize: 15, cursor: submitting[product._id] ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'background 0.2s' }}
                disabled={submitting[product._id] || !form[product._id]?.rating}
                onClick={() => handleSubmit(product._id)}
                onMouseOver={e => { if (!submitting[product._id]) (e.target as HTMLButtonElement).style.background = '#222c4c'; }}
                onMouseOut={e => { if (!submitting[product._id]) (e.target as HTMLButtonElement).style.background = '#111a2f'; }}
              >
                {submitting[product._id] ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistoryPage; 