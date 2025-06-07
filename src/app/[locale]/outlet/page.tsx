'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import ProductCard from '@/components/card/index';


interface Product {
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
}

const categories = [
  {
    name: 'NAM',
    image: '/assets/images/outlet-men.jpg',
    href: '/outlet/men',
  },
  {
    name: 'NỮ',
    image: '/assets/images/outlet-women.jpg',
    href: '/outlet/women',
  },
  {
    name: 'TRẺ EM',
    image: '/assets/images/outlet-kids.jpg',
    href: '/outlet/kids',
  },
  {
    name: 'SHOP SHOES',
    image: '/assets/images/outlet-shoes.jpg',
    href: '/outlet/men-shoes', // hoặc route phù hợp
  },
  {
    name: 'SIZE CUỐI: GIẢM ĐẾN 40%',
    image: '/assets/images/outlet-sale.jpg',
    href: '/outlet/last-size', // hoặc route phù hợp
  },
];

export default function OutletPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Typography variant="h3" fontWeight={700} mb={4}>
        OUTLET
      </Typography>
      <Typography variant="subtitle1" mb={4}>
        Săn sale cực sốc các sản phẩm chính hãng với giá tốt nhất!
      </Typography>

      {/* Categories Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        {categories.map((category, index) => (
          <Box
            key={index}
            component="a"
            href={category.href}
            sx={{
              display: 'block',
              position: 'relative',
              height: 200,
              backgroundImage: `url(${category.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                color: 'white',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {category.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {loading ? (
        <Typography>Đang tải sản phẩm...</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          {products.map((product, idx) => (
            <Box
              key={idx}
              sx={{
                width: { xs: '100%', sm: '50%', md: '25%' },
                p: 1.5,
              }}
            >
              <ProductCard
                name={product.name}
                image={product.images?.[0]}
                price={product.price}
                discountPrice={product.discountPrice}
                tags={product.tags}
                onAddToCart={() => {
                  console.log(`Added ${product.name} to cart!`);
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}