'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import ProductCard from '@/components/card';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  categories: { _id: string; name: string }[];
  brand: { _id: string; name: string };
}

export default function ArsenalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Arsenal category ObjectId
  const ARSENAL_CATEGORY_ID = '6847c7c618c3452a7165980e';

  useEffect(() => {
    const fetchArsenalProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?category=${ARSENAL_CATEGORY_ID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Arsenal products');
        }
        const data = await response.json();
        // Filter products to ensure they have the Arsenal category
        const arsenalProducts = data.filter((product: Product) => 
          product.categories.some(cat => cat._id === ARSENAL_CATEGORY_ID)
        );
        setProducts(arsenalProducts);
      } catch (err) {
        console.error('Error fetching Arsenal products:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchArsenalProducts();
  }, []);

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Arsenal Products
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            width: '100%',
            justifyContent: 'center'
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
                name={product.name}
                image={product.images[0]}
                price={product.price}
                discountPrice={product.discountPrice}
                tags={product.tags}
                brand={product.brand.name}
                categories={product.categories}
                onAddToCart={() => console.log('Add to cart:', product._id)}
              />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
} 