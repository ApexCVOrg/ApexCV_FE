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

const TABS = [
  // { label: "SPEZIAL", value: "spezial", image: "/assets/images/shoes/spezial/Giay_Handball_Spezial_mau_xanh_la_IG6192_01_standard.avif" }, // Loại bỏ SPEZIAL
  { label: "SAMBA", value: "samba", image: "/assets/images/shoes/samba/Giay_Samba_OG_trang_B75806_01_00_standard.avif" },
  { label: "SUPERSTAR", value: "superstar", image: "/assets/images/shoes/superstar/Giay_Superstar_Vintage_trang_JQ3254_01_00_standard.avif" },
  { label: "GAZELLE", value: "gazelle", image: "/assets/images/shoes/gazelle/Giay_Gazelle_Indoor_DJen_JI2060_01_standard.avif" },
  { label: "SL 72", value: "sl-72", image: "/assets/images/shoes/sl72/Giay_SL_72_OG_Mau_xanh_da_troi_JS0255_01_00_standard.avif" }
];

export default function GazellePage() {
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
        const desiredPath = ['Shoes', 'Adidas', 'Gazelle'];
        
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
            if (categoryNames.includes('gazelle')) return true;
          }
          
          // Cách 4: Kiểm tra trong name hoặc description
          if (item.name.toLowerCase().includes('gazelle')) return true;
          
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
      {/* Banner ở phía sau */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 400, 
        zIndex: 1 
      }}>
        <img 
          src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1752376328/originals_ss25_the_original_introduce_plp_the_original_iwp_background_media_d_79a5b46e37_lwnind.avif" 
          alt="Banner" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
      </Box>
      
      {/* Breadcrumb và navigation ở phía trên banner */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Breadcrumb */}
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
            <Typography component="span" sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Gazelle</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
              ADIDAS GAZELLE
            </Typography>
            <Typography variant="body2" sx={{ color: '#000', fontWeight: 400, ml: 1 }}>
              [{products.length}]
            </Typography>
          </Box>
        </Box>
        {/* Tab Card Navigation */}
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', alignItems: 'flex-end', pb: 2 }}>
            {TABS.map(tab => (
              <Link key={tab.value} href={`/shoes/${tab.value}`} style={{ textDecoration: 'none', flex: 1 }}>
                <Box sx={{
                  border: 0,
                  borderBottom: tab.value === 'gazelle' ? '4px solid #000' : 'none',
                  bgcolor: tab.value === 'gazelle' ? '#000' : '#fff',
                  color: tab.value === 'gazelle' ? '#fff' : '#111',
                  fontWeight: tab.value === 'gazelle' ? 700 : 500,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  p: 0,
                  pb: 0,
                  minWidth: 180,
                  maxWidth: 220,
                  mx: 0.5,
                  '&:hover': {
                    borderBottom: '4px solid #000',
                    bgcolor: tab.value === 'gazelle' ? '#000' : '#f5f5f5',
                    color: '#000',
                    fontWeight: 700,
                    transform: 'scale(1.04)',
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)'
                  }
                }}>
                  <Box sx={{ width: '100%', height: 160, overflow: 'hidden', borderRadius: 0 }}>
                    <img src={tab.image} alt={tab.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Typography sx={{ py: 2, fontWeight: tab.value === 'gazelle' ? 700 : 600, fontSize: '1.1rem', letterSpacing: 1, bgcolor: tab.value === 'gazelle' ? '#000' : '#fff', color: tab.value === 'gazelle' ? '#fff' : '#111', textTransform: 'uppercase' }}>{tab.label}</Typography>
                </Box>
              </Link>
            ))}
          </Box>
        </Container>
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
          ) : (
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
          )}
        </Box>
      </Container>
    </Box>
  );
} 