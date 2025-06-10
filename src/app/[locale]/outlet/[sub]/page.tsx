'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ProductCard from '@/components/card/index';

interface Product {
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
}

const OUTLET_CATEGORY_ID = '68446a93bc749d5ad8fb80f2'; // OUTLET
const CATEGORY_NAME_TO_ID: Record<string, string> = {
  men: '6845a435f588c9b6fd8235fa',
  women: '6845a435f588c9b6fd8235fb',
  kids: '6845a435f588c9b6fd8235fc',
  'last-size': '6845a435f588c9b6fd8235fd',
};

export default function OutletSubCategoryPage() {
  const { sub } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const subId = CATEGORY_NAME_TO_ID[sub as string];
    if (!subId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          category: `${OUTLET_CATEGORY_ID},${subId}`,
          sortBy: sortBy
        });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sub, sortBy]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        OUTLET - {sub?.toString().toUpperCase()}
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
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

      {loading ? (
        <Typography>Đang tải sản phẩm...</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          {products.map((product, idx) => (
            <Box key={idx} sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
              <ProductCard {...product} image={product.images[0]} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
