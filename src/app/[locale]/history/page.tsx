"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/card";

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

  if (loading) return <div>Đang tải lịch sử mua hàng...</div>;
  if (!orders.length) return <div>Bạn chưa có đơn hàng nào.</div>;

  // Gộp tất cả sản phẩm đã mua từ mọi đơn hàng
  const allProducts = orders.flatMap(order => order.orderItems.map(item => typeof item.product === "object" ? (item.product as Product) : null)).filter(Boolean);

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 24, display: "flex", flexWrap: "wrap", gap: 24 }}>
      {allProducts.map((product, idx) => (
        <ProductCard
          key={product!._id + idx}
          _id={product!._id}
          name={product!.name}
          image={product!.images && product!.images[0] ? product!.images[0] : ""}
          price={product!.price}
          discountPrice={product!.discountPrice}
          brand={product!.brand}
          categories={product!.categories}
          productId={product!._id}
        />
      ))}
    </div>
  );
};

export default HistoryPage; 