'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ProductCard from '@/components/card/index';
import { useCartContext } from '@/context/CartContext';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
}

export default function OutletSubCategoryPage() {
  const { sub } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const { addToCart } = useCartContext();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          categorySlug: 'outlet',
          subSlug: sub?.toString() || '',
          sortBy: sortBy
        });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProducts(Array.isArray(data.data) ? data.data : []);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sub, sortBy]);

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        OUTLET - {sub?.toString().toUpperCase()}
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="popular">Most Popular</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Đang tải sản phẩm...</Typography>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="flex-start" gap={4} flexWrap="wrap" sx={{ width: 'auto', maxWidth: 'none' }}>
          {Array.isArray(products) && products.map((product) => (
            <Box
              key={product._id}
              sx={{
                maxWidth: 350,
                width: '100%',
                minWidth: 220,
                margin: 0,
                flex: '0 1 30%',
              }}
            >
              <ProductCard
                _id={product._id}
                productId={product._id}
                name={product.name}
                image={product.images[0]}
                price={product.price}
                discountPrice={product.discountPrice}
                tags={product.tags}
                brand={product.brand}
                categories={product.categories}
                onAddToCart={async () => {
                  try {
                    await addToCart({
                      productId: product._id,
                      quantity: 1,
                    });
                  } catch (error) {
                    console.error('Error adding to cart:', error);
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
