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
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

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

export default function MenJerseyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const { locale } = useParams();
  const productCount = products.length;

  // Helper function to sort products
  const sortProducts = (products: Product[], sortType: string) => {
    console.log('[JerseyPage] Sorting products by:', sortType);
    const sortedProducts = [...products];
    
    switch (sortType) {
      case 'price-low':
        return sortedProducts.sort((a, b) => {
          const priceA = a.discountPrice !== undefined ? a.discountPrice : a.price;
          const priceB = b.discountPrice !== undefined ? b.discountPrice : b.price;
          return priceA - priceB;
        });
      case 'price-high':
        return sortedProducts.sort((a, b) => {
          const priceA = a.discountPrice !== undefined ? a.discountPrice : a.price;
          const priceB = b.discountPrice !== undefined ? b.discountPrice : b.price;
          return priceB - priceA;
        });
      case 'newest':
        // Sort by createdAt if available, otherwise by price
        return sortedProducts.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          // Fallback to price sorting if createdAt is not available
          const priceA = a.discountPrice !== undefined ? a.discountPrice : a.price;
          const priceB = b.discountPrice !== undefined ? b.discountPrice : b.price;
          return priceB - priceA;
        });
      case 'popular':
        // For now, return default order since we don't have popularity field
        // Could be enhanced with orderCount or similar field in the future
        return sortedProducts;
      default:
        return sortedProducts;
    }
  };

  useEffect(() => {
    const fetchJerseys = async () => {
      setLoading(true);
      setError(null);
      try {
        // Convert sortBy to API format
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
          gender: 'men'
        });

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
        console.log('[JerseyPage] Fetching products with URL:', apiUrl);
        
        const res = await fetch(apiUrl);
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
        
        const jerseys = (data.data || []).filter(
          (p: any) =>
            (p.categories || []).some(
              (c: any) => c.name.toLowerCase() === "t-shirts" || c.name.toLowerCase() === "jersey"
            ) &&
            (p.categories?.[1] && teamNames.includes(p.categories[1].name.toLowerCase()))
        );

        console.log('[JerseyPage] Filtered jerseys before sorting:', jerseys.length);
        console.log('[JerseyPage] Current sortBy value:', sortBy);
        
        // Apply client-side sorting
        const sortedJerseys = sortProducts(jerseys, sortBy);
        console.log('[JerseyPage] Final sorted jerseys count:', sortedJerseys.length);
        console.log('[JerseyPage] Sample sorted jerseys:', sortedJerseys.slice(0, 3).map(p => ({
          name: p.name,
          price: p.price,
          discountPrice: p.discountPrice,
          createdAt: p.createdAt
        })));
        
        setProducts(sortedJerseys);
      } catch (err) {
        console.error('[JerseyPage] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJerseys();
  }, [sortBy]);

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Breadcrumb và Heading */}
      <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Link href="/men" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', fontWeight: 700, marginRight: 2 }}>
            <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5 }} />
            BACK
          </Link>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: 'grey.400', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
          </Link>
          <Typography component="span" sx={{ color: 'grey.400', mx: 0.5 }}>/</Typography>
          <Link href="/men" style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: 'grey.400', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Men</Typography>
          </Link>
          <Typography component="span" sx={{ color: 'grey.400', mx: 0.5 }}>/</Typography>
          <Typography component="span" sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Jersey</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
            MEN'S JERSEYS
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 400, ml: 1 }}>
            {productCount > 0 ? `[${productCount}]` : ''}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, maxWidth: 900, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.1rem' } }}>
          Discover our collection of men's football jerseys from top clubs and national teams. Designed for performance and style, these jerseys keep you cool and comfortable on and off the pitch.
        </Typography>
      </Box>
      {/* Sort Bar giữ nguyên ngoài box xám */}
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
      {/* Danh sách sản phẩm không còn box màu xám */}
      <Container maxWidth={false} sx={{ 
        py: 4, 
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1600px',
        width: '100%'
      }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {products.length === 0 && (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                  Không có sản phẩm áo đấu nào.
                </Typography>
              )}
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
                          ? `/assets/images/men/${product.categories?.[1]?.name.toLowerCase()}/${product.images[0]}`
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
            </>
          )}
        </Container>
    </>
  );
} 