"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/card";
import { Box } from "@mui/material";

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
}

export default function WomenShortsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=women`);
      const data = await res.json();
      const teamNames = [
        "arsenal",
        "real madrid",
        "manchester united",
        "bayern munich",
        "juventus"
      ];
      const shorts = (data.data || []).filter(
        (p: any) =>
          (p.categories || []).some(
            (c: any) => c.name.toLowerCase() === "shorts"
          ) &&
          (p.categories?.[1] && teamNames.includes(p.categories[1].name.toLowerCase()))
      );
      setProducts(shorts);
      setLoading(false);
    };
    fetchShorts();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1>Quần short Nữ</h1>
      {products.length === 0 && <p>Không có sản phẩm quần short nào.</p>}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 3 },
          width: '100%',
          justifyContent: 'center',
        }}
      >
        {products.map((product) => (
          <Box 
            key={product._id}
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <ProductCard
              productId={product._id}
              name={product.name}
              image={
                product.images?.[0]
                  ? `/assets/images/women/${product.categories?.[1]?.name.toLowerCase()}/${product.images[0]}`
                  : "/assets/images/placeholder.jpg"
              }
              price={product.price}
              discountPrice={product.discountPrice}
              tags={product.tags || []}
              brand={product.brand || { _id: "", name: "Unknown Brand" }}
              categories={product.categories || []}
              onAddToCart={() => {}}
            />
          </Box>
        ))}
      </Box>
    </div>
  );
} 