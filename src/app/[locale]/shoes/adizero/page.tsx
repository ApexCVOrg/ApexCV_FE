"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Container, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Link from "next/link";
import ProductCard from "@/components/card";

interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: string | { _id: string; name: string };
  categories?: { _id: string; name: string }[];
}

export default function AdizeroPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?status=active`);
        const data = await res.json();
        
        // Lọc sản phẩm theo categoryPath mong muốn
        const desiredPath = ['Shoes', 'Adidas', 'Adizero'];
        
        // Thử nhiều cách filter khác nhau
        const filtered = (data.data || []).filter((item: any) => {
          // Cách 1: Kiểm tra nếu categoryPath là array
          if (Array.isArray(item.categoryPath)) {
            const isMatch = desiredPath.every((cat, idx) => 
              (item.categoryPath[idx] || '').toLowerCase() === cat.toLowerCase()
            );
            if (isMatch) return true;
          }
          
          // Cách 2: Kiểm tra nếu categoryPath là string
          if (typeof item.categoryPath === 'string') {
            const pathString = item.categoryPath.toLowerCase();
            const desiredString = desiredPath.join('/').toLowerCase();
            if (pathString === desiredString) return true;
          }
          
          // Cách 3: Kiểm tra nếu có field khác chứa category info
          if (item.categories && Array.isArray(item.categories)) {
            const categoryNames = item.categories.map((cat: any) => cat.name.toLowerCase());
            if (categoryNames.includes('adizero')) return true;
          }
          
          // Cách 4: Kiểm tra trong name hoặc description
          if (item.name.toLowerCase().includes('adizero')) return true;
          
          return false;
        });
        
        setProducts(filtered);
      } catch (e) {
        console.error('Error fetching products:', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", mt: 10, position: 'relative' }}>
      {/* Banner */}
      <Box sx={{ position: 'relative', width: '100vw', left: '50%', right: '50%', transform: 'translateX(-50%)', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#000', overflow: 'hidden', p: 0, m: 0, minHeight: { xs: '320px', md: '400px' }, maxHeight: '600px' }}>
        <img src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1752486876/global_adizero_running_ss25_launch_pdp_boston_women_banner_statement_1_d_b621f7cbda_go299l.avif" alt="Adizero Banner" style={{ width: '100vw', height: '40vw', minHeight: '320px', maxHeight: '600px', objectFit: 'cover', display: 'block', margin: 0, padding: 0, filter: 'brightness(0.55)' }} />
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', px: 2, zIndex: 2, textAlign: 'center', pointerEvents: 'none' }}>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.85)', mt: 30, textShadow: '0 2px 8px #000' }}>Tốc độ tối đa, hiệu suất vượt trội.</Typography>
        </Box>
      </Box>
      
      {/* Breadcrumb */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Link href="/shoes" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', fontWeight: 700, marginRight: 2 }}>
              <span style={{ fontWeight: 700, marginRight: 4 }}>{'< BACK'}</span>
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={{ color: '#000', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
            </Link>
            <Typography component="span" sx={{ color: '#000', mx: 0.5 }}>/</Typography>
            <Link href="/shoes" style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={{ color: '#000', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Shoes</Typography>
            </Link>
            <Typography component="span" sx={{ color: '#000', mx: 0.5 }}>/</Typography>
            <Typography component="span" sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Adizero</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
              ADIDAS ADIZERO
            </Typography>
            <Typography variant="body2" sx={{ color: '#000', fontWeight: 400, ml: 1 }}>
              [{products.length}]
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Filter Bar */}
      <Container maxWidth="lg" sx={{ mb: 3, position: 'relative', zIndex: 2, mt: 6, px: { xs: 1, md: 4 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select 
              value={sortBy} 
              label="Sort By" 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Product List */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={6}
          justifyContent="center"
          alignItems="stretch"
        >
          {loading ? (
            <div>Loading...</div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <Box
                key={product._id}
                flex="1 1 320px"
                maxWidth={320}
                minWidth={260}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  m: 0,
                }}
              >
                <ProductCard
                  _id={product._id}
                  productId={product._id}
                  name={product.name}
                  image={product.images?.[0] || "/assets/images/placeholder.jpg"}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  tags={product.tags}
                  brand={product.brand}
                  categories={product.categories}
                  onAddToCart={() => {}}
                />
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
              <Typography variant="h5" sx={{ color: 'text.secondary', mb: 2 }}>
                Không tìm thấy sản phẩm Adizero
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Sản phẩm có thể đang được cập nhật hoặc tạm thời không có sẵn.
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
} 