"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/card";
import { Box, Container, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Link from "next/link";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

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

export default function WomenSportsBraPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);
  const locale = "vi";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let apiSortBy = sortBy;
        let sortOrder = 'desc';
        if (sortBy === 'price-low') { apiSortBy = 'price'; sortOrder = 'asc'; }
        else if (sortBy === 'price-high') { apiSortBy = 'price'; sortOrder = 'desc'; }
        else if (sortBy === 'newest') { apiSortBy = 'createdAt'; sortOrder = 'desc'; }
        else if (sortBy === 'popular') { apiSortBy = 'popularity'; sortOrder = 'desc'; }
        const queryParams = new URLSearchParams({ sortBy: apiSortBy, sortOrder, gender: 'women' });
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        const items = data.data || [];
        setProducts(items);
        setProductCount(items.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sortBy]);

  if (error) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Link href="/women" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', fontWeight: 700, marginRight: 2 }}>
            <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5 }} />BACK
          </Link>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: 'grey.400', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
          </Link>
          <Typography component="span" sx={{ color: 'grey.400', mx: 0.5 }}>/</Typography>
          <Link href="/women" style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: 'grey.400', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Women</Typography>
          </Link>
          <Typography component="span" sx={{ color: 'grey.400', mx: 0.5 }}>/</Typography>
          <Typography component="span" sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Sports Bra</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
            WOMEN'S SPORTS BRA
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 400, ml: 1 }}>{productCount > 0 ? `[${productCount}]` : ''}</Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, maxWidth: 900, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.1rem' } }}>
          Khám phá các mẫu áo ngực thể thao nữ, hỗ trợ tối đa khi vận động, chất liệu co giãn, thấm hút mồ hôi tốt.
        </Typography>
      </Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1600px', width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><CircularProgress /></Box>
        ) : (
          <>
            {products.length === 0 && (<Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>Không có sản phẩm áo ngực thể thao nào.</Typography>)}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 3 }, width: '100%', justifyContent: 'center' }}>
              {products.map((product) => (
                <Box key={product._id} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <ProductCard
                    productId={product._id}
                    name={product.name}
                    image={product.images?.[0] ? `/assets/images/women/${product.categories?.[1]?.name.toLowerCase()}/${product.images[0]}` : "/assets/images/placeholder.jpg"}
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
    </>
  );
}