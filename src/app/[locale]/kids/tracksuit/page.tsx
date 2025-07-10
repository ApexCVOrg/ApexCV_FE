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

export default function KidsTracksuitPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracksuits = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=kids`);
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch products');
        }
        
        const teamNames = [
          "arsenal",
          "real madrid",
          "manchester united", 
          "bayern munich",
          "juventus"
        ];
        
        const tracksuits = (data.data || []).filter((p: any) => {
          // Check if product has any category that might be tracksuit-related
          const hasTracksuitCategory = (p.categories || []).some(
            (c: any) => {
              const categoryName = c.name.toLowerCase();
              return categoryName.includes('tracksuit') || 
                     categoryName.includes('training') ||
                     categoryName.includes('jacket') ||
                     categoryName.includes('pants') ||
                     categoryName.includes('suit') ||
                     categoryName.includes('sportswear');
            }
          );
          
          // Check if product belongs to one of the major teams
          const hasTeamCategory = (p.categories || []).some(
            (c: any) => teamNames.includes(c.name.toLowerCase())
          );
          
          return hasTracksuitCategory && hasTeamCategory;
        });
        
        setProducts(tracksuits);
      } catch (error) {
        console.error('Error fetching tracksuits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTracksuits();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1>Tracksuit Trẻ em</h1>
      {products.length === 0 && <p>Không có sản phẩm tracksuit nào.</p>}
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
                  ? `/assets/images/kids/${product.categories?.[1]?.name.toLowerCase()}/${product.images[0]}`
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