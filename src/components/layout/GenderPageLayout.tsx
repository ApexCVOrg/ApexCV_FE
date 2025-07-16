"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Container, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import Link from "next/link";
import ProductCard from "@/components/card";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useParams, usePathname } from 'next/navigation';

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

interface GenderPageLayoutProps {
  pageTitle: string;
  pageDescription: string;
  category: string;
  bannerImage?: string;
  bannerAlt?: string;
  fetchProducts: (sortBy: string) => Promise<Product[]>;
  emptyMessage: string;
}

export default function GenderPageLayout({
  pageTitle,
  pageDescription,
  category,
  bannerImage = "https://res.cloudinary.com/dqmb4e2et/image/upload/v1752517180/360_F_305556926_2QKGFHJ0AmtNsexJPjOgXVOOSUpy8g60_d6tt7m.jpg",
  bannerAlt = "Collection Banner",
  fetchProducts,
  emptyMessage
}: GenderPageLayoutProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const { locale } = useParams();
  const pathname = usePathname();
  const productCount = products.length;

  // Detect gender from URL path
  const getGenderFromPath = () => {
    if (pathname.includes('/women/')) return 'women';
    if (pathname.includes('/kids/')) return 'kids';
    return 'men'; // default
  };

  const gender = getGenderFromPath();
  const genderDisplay = gender.charAt(0).toUpperCase() + gender.slice(1);
  const genderPath = `/${gender}`;

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProducts = await fetchProducts(sortBy);
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [sortBy, fetchProducts]);

  return (
    <Box sx={{ minHeight: "100vh", mt: 10, position: 'relative' }}>
      {/* Banner background with overlay - below header */}
      <Box sx={{ width: '100vw', height: 400, mx: 'calc(-50vw + 50%)', position: 'relative', overflow: 'hidden', zIndex: 1, display: 'flex', alignItems: 'center' }}>
        <img src={bannerImage} alt={bannerAlt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.45)', zIndex: 2 }} />
        {/* Breadcrumb and heading over banner, above overlay */}
        <Box sx={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: '1600px', mx: 'auto', px: { xs: 2, md: 6 } }}>
          <Box sx={{ pt: 4, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Link href={genderPath} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff', fontWeight: 700, marginRight: 2 }}>
                <ArrowBackIosIcon fontSize="small" sx={{ mr: 0.5, color: '#fff' }} /> BACK
              </Link>
              <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
                <Typography component="span" sx={{ color: '#fff', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
              </Link>
              <Typography component="span" sx={{ color: '#fff', mx: 0.5 }}>/</Typography>
              <Link href={genderPath} style={{ textDecoration: 'none' }}>
                <Typography component="span" sx={{ color: '#fff', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>{genderDisplay}</Typography>
              </Link>
              <Typography component="span" sx={{ color: '#fff', mx: 0.5 }}>/</Typography>
              <Typography component="span" sx={{ color: '#fff', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>{category}</Typography>
            </Box>
            {/* Heading & description */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0, color: '#fff' }}>
                {pageTitle}
              </Typography>
              {productCount > 0 && (
                <Typography variant="body2" sx={{ color: 'grey.300', fontWeight: 400, ml: 1 }}>
                  [{productCount}]
                </Typography>
              )}
            </Box>
            <Typography variant="body1" sx={{ mt: 2, maxWidth: 900, color: 'grey.200', fontSize: { xs: '1rem', md: '1.1rem' } }}>
              {pageDescription}
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Sort Bar */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 5, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1600px', width: '100%' }}>
        <FormControl sx={{ minWidth: 200, mr: { xs: 3, sm: 6, md: 8 } }}>
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
                {emptyMessage}
              </Typography>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 3 }, width: '100%', justifyContent: 'center' }}>
              {products.map((product) => (
                <Box key={product._id} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <ProductCard
                    _id={product._id}
                    productId={product._id}
                    name={product.name}
                    image={(() => {
                      // If image is a full URL (starts with http/https), use it directly
                      if (product.images?.[0]?.startsWith('http')) {
                        return product.images[0];
                      }
                      // If image is a local path, construct the path like TeamPage
                      if (product.images?.[0]) {
                        // Try to determine gender and category from product data
                        const gender = product.categories?.find(cat => 
                          ['men', 'women', 'kids'].includes(cat.name.toLowerCase())
                        )?.name.toLowerCase() || 'men';
                        
                        const teamCategory = product.categories?.find(cat => 
                          cat.name.toLowerCase().includes('arsenal') ||
                          cat.name.toLowerCase().includes('real madrid') ||
                          cat.name.toLowerCase().includes('manchester united') ||
                          cat.name.toLowerCase().includes('bayern munich') ||
                          cat.name.toLowerCase().includes('juventus')
                        )?.name.toLowerCase() || 'adidas';
                        
                        return `/assets/images/${gender}/${teamCategory}/${product.images[0]}`;
                      }
                      return "/assets/images/placeholder.jpg";
                    })()}
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