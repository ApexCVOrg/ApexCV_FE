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

export default function WomenSweatshirtPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const { locale } = useParams();
  const productCount = products.length;

  // Helper function to sort products
  const sortProducts = (products: Product[], sortType: string) => {
    console.log('[SweatshirtPage] Sorting products by:', sortType);
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
        return sortedProducts.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          const priceA = a.discountPrice !== undefined ? a.discountPrice : a.price;
          const priceB = b.discountPrice !== undefined ? b.discountPrice : b.price;
          return priceB - priceA;
        });
      case 'popular':
        return sortedProducts;
      default:
        return sortedProducts;
    }
  };

  useEffect(() => {
    const fetchSweatshirts = async () => {
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

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
        console.log('[SweatshirtPage] Fetching products with URL:', apiUrl);
        
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch products');
        }

        const sweatshirts = data.data || [];

        console.log('[SweatshirtPage] Filtered sweatshirts before sorting:', sweatshirts.length);
        console.log('[SweatshirtPage] Current sortBy value:', sortBy);
        
        const sortedSweatshirts = sortProducts(sweatshirts, sortBy);
        console.log('[SweatshirtPage] Final sorted sweatshirts count:', sortedSweatshirts.length);
        
        setProducts(sortedSweatshirts);
      } catch (err) {
        console.error('[SweatshirtPage] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSweatshirts();
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
          <Typography component="span" sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Sweatshirts</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
            WOMEN'S SWEATSHIRTS
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 400, ml: 1 }}>
            {productCount > 0 ? `[${productCount}]` : ''}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, maxWidth: 900, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.1rem' } }}>
          Explore our collection of women's sweatshirts, perfect for comfort and style. From casual to sporty, find your perfect sweatshirt.
        </Typography>
      </Box>
      {/* Sort Bar */}
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
      {/* Danh sách sản phẩm */}
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
                Không có sản phẩm áo sweatshirt nào.
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
          </>
        )}
      </Container>
    </>
  );
}