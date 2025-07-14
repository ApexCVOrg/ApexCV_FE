"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import Link from "next/link";
import ProductCard from "@/components/card";
import { FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  createdAt: string;
}

export default function TeamSneakerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const teamNames = ["arsenal","real madrid","manchester united","bayern munich","juventus"];

  useEffect(() => {
    const fetchSneakers = async () => {
      setLoading(true);
      setError(null);
      try {
        let apiSortBy = sortBy;
        let sortOrder = 'desc';
        if (sortBy === 'price-low') { apiSortBy = 'price'; sortOrder = 'asc'; }
        else if (sortBy === 'price-high') { apiSortBy = 'price'; sortOrder = 'desc'; }
        else if (sortBy === 'newest') { apiSortBy = 'createdAt'; sortOrder = 'desc'; }
        else if (sortBy === 'popular') { apiSortBy = 'popularity'; sortOrder = 'desc'; }
        const queryParams = new URLSearchParams({ sortBy: apiSortBy, sortOrder, gender: 'men' });
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch products');
        const sneakers = (data.data || []).filter((p: Product) =>
          (p.categories || []).some((c) => c.name.toLowerCase() === "sneakers" || c.name.toLowerCase() === "sneaker") &&
          (p.categories?.[1] && teamNames.includes(p.categories[1].name.toLowerCase()))
        );
        setProducts(sneakers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchSneakers();
  }, [sortBy]);

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", mt: 10, position: 'relative' }}>
      {/* Banner background with overlay - below header */}
      <Box sx={{ width: '100vw', height: 400, mx: 'calc(-50vw + 50%)', position: 'relative', overflow: 'hidden', zIndex: 1, display: 'flex', alignItems: 'center' }}>
        <img src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1752509684/banner-aerial-view-young-man-600nw-2466088991_c1elqe.webp" alt="Team Sneaker Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.45)', zIndex: 2 }} />
        {/* Breadcrumb and heading over banner, above overlay */}
        <Box sx={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: '1600px', mx: 'auto', px: { xs: 2, md: 6 } }}>
          <Box sx={{ pt: 4, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Link href="/men" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff', fontWeight: 700, marginRight: 2 }}>
                <span style={{ fontWeight: 700, marginRight: 4, color: '#fff' }}>{'< BACK'}</span>
              </Link>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Typography component="span" sx={{ color: '#fff', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
              </Link>
              <Typography component="span" sx={{ color: '#fff', mx: 0.5 }}>/</Typography>
              <Link href="/men" style={{ textDecoration: 'none' }}>
                <Typography component="span" sx={{ color: '#fff', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Men</Typography>
              </Link>
              <Typography component="span" sx={{ color: '#fff', mx: 0.5 }}>/</Typography>
              <Typography component="span" sx={{ color: '#fff', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Team Sneaker</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0, color: '#fff' }}>
                TEAM SNEAKER
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 2, maxWidth: 900, color: 'grey.200', fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Discover the ultimate collection of team-inspired sneakers
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.92)', mt: 1 }}>
              Explore exclusive sneakers from top football clubs. Express your passion and style with iconic designs, perfect for every fan and sneakerhead.
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Sort Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="popular">Most Popular</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {/* Product Grid */}
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1600px', width: '100%' }}>
        {error && (
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'error.main', py: 2 }}>{error}</Typography>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {products.length === 0 && (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No sneakers found.
              </Typography>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 3 }, width: '100%', justifyContent: 'center' }}>
              {products.map((product) => (
                <Box key={product._id} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <ProductCard
                    productId={product._id}
                    name={product.name}
                    image={product.images?.[0] ? `/assets/images/men/${product.categories?.[1]?.name.toLowerCase()}/${product.images[0]}` : "/assets/images/placeholder.jpg"}
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
          </>
        )}
      </Container>
    </Box>
  );
} 