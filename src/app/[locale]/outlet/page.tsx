'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ProductCard from '@/components/card';
import { useTranslations } from 'next-intl';

import '@/styles/components/_outlet.scss'; // import SCSS

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  sizes?: { size: string; stock: number }[];
  colors?: string[];
}

export default function OutletPage() {
  const t = useTranslations('outletPage');
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    {
      name: t('categories.men'),
      image: '/assets/images/aothun.jpg',
      href: 'men',
    },
    {
      name: t('categories.women'),
      image: '/assets/images/outlet-women.jpg',
      href: 'women',
    },
    {
      name: t('categories.kids'),
      image: '/assets/images/outlet-kids.jpg',
      href: 'kids',
    },
    {
      name: t('categories.lastSize'),
      image: '/assets/images/outlet-sale.jpg',
      href: 'last-size',
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          categorySlug: 'outlet',
          sortBy: sortBy
        });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
        const data = await res.json();
        // Handle different API response structures
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
  }, [sortBy]);

  return (
    <Box className="outlet-wrapper">
      <Typography className="outlet-heading">{t('title')}</Typography>
      <Typography className="outlet-subtitle">{t('subtitle')}</Typography>

      <Box className="outlet-categories-section">
        <Box className="outlet-grid">
          {categories.map((category, index) => (
            <Box
              key={index}
              onClick={() => router.push(`/outlet/${category.href}`)}
              className="outlet-category-card"
              style={{ backgroundImage: `url(${category.image})` }}
            >
              <Typography className="label">{category.name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className="outlet-products-section">
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="priceAsc">Price: Low to High</MenuItem>
              <MenuItem value="priceDesc">Price: High to Low</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Typography>{t('loading')}</Typography>
        ) : (
          <Box className="product-grid-centered">
            {Array.isArray(products) && products.map((product) => (
              <Box key={product._id} className="product-card">
                <ProductCard
                  productId={product._id}
                  name={product.name}
                  image={product.images[0]}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  tags={product.tags}
                  brand={product.brand}
                  categories={product.categories}
                  sizes={product.sizes}
                  // @ts-expect-error colors prop expects number, but product.colors is string[]
                  colors={product.colors}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
