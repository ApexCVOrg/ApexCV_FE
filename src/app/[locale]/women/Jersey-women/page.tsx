"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/card";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useParams } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  createdAt?: string; // Added for sorting
  popularity?: number; // Added for sorting
}

export default function WomenJerseyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const { locale } = useParams();

  // Helper function to sort products
  const sortProducts = (products: Product[], sortType: string) => {
    const sortedProducts = [...products];
    switch (sortType) {
      case 'price-low':
        return sortedProducts.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      case 'price-high':
        return sortedProducts.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      case 'newest':
        return sortedProducts.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
        });
      case 'popular':
        return sortedProducts;
      default:
        return sortedProducts;
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let apiSortBy = sortBy;
        let sortOrder = 'desc';
        if (sortBy === 'price-low') {
          apiSortBy = 'price';
          sortOrder = 'asc';
        } else if (sortBy === 'price-high') {
          apiSortBy = 'price';
          sortOrder = 'desc';
        } else if (sortBy === 'newest') {
          apiSortBy = 'createdAt';
          sortOrder = 'desc';
        } else if (sortBy === 'popular') {
          apiSortBy = 'popularity';
          sortOrder = 'desc';
        }
        const queryParams = new URLSearchParams({
          sortBy: apiSortBy,
          sortOrder: sortOrder,
          gender: 'women'
        });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
        const data = await res.json();
        const teamNames = [
          "arsenal",
          "real madrid",
          "manchester united",
          "bayern munich",
          "juventus"
        ];
        // Chỉ lấy sản phẩm jersey hoặc t-shirts
        const jerseys = (data.data || []).filter(
          (p: any) =>
            (p.categories || []).some(
              (c: any) => c.name.toLowerCase() === "t-shirts" || c.name.toLowerCase() === "jersey"
            ) &&
            (p.categories?.[1] && teamNames.includes(p.categories[1].name.toLowerCase()))
        );
        const sorted = sortProducts(jerseys, sortBy);
        setProducts(sorted);
        setProductCount(sorted.length);
      } catch (err) {
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sortBy]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: 32 }}>
      <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Link href="/women" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', fontWeight: 700, marginRight: 2 }}>
            <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5 }} />
            BACK
          </Link>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: 'grey.400', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
          </Link>
          <Typography component="span" sx={{ color: 'grey.400', mx: 0.5 }}>/</Typography>
          <Link href="/women" style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: 'grey.400', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Women</Typography>
          </Link>
          <Typography component="span" sx={{ color: 'grey.400', mx: 0.5 }}>/</Typography>
          <Typography component="span" sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Jersey</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
            WOMEN'S JERSEY
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 400, ml: 1 }}>
            {productCount > 0 ? `[${productCount}]` : ''}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, maxWidth: 900, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.1rem' } }}>
          Khám phá bộ sưu tập áo đấu nữ chính hãng, thiết kế hiện đại, chất liệu cao cấp, phù hợp cho cả thi đấu và thời trang hàng ngày.
        </Typography>
      </Box>
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
      {products.length === 0 && <p>Không có sản phẩm áo đấu nào.</p>}
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