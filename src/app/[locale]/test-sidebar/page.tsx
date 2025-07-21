'use client';

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ProductDetailSidebar from '@/components/ui/ProductDetailSidebar';

// Mock product data for testing
const mockProduct = {
  _id: 'test-product-1',
  name: "Women's Air Peg 2K35",
  description:
    'Legendary style meets all-day comfort. This running shoe features responsive cushioning and breathable mesh for your daily runs.',
  images: [
    '/assets/images/lib/air-max-270.png',
    '/assets/images/lib/air-max-90.png',
    '/assets/images/lib/air-max-excee-.png',
    '/assets/images/lib/nike-span-2.png',
  ],
  price: 2500000,
  discountPrice: 2000000,
  tags: ['Sport', 'Casual'],
  brand: { _id: 'nike', name: 'Nike' },
  categories: [{ _id: 'running', name: 'Running' }],
  sizes: [
    { size: '6.0', stock: 5 },
    { size: '6.5', stock: 3 },
    { size: '7.0', stock: 8 },
    { size: '7.5', stock: 2 },
    { size: '8.0', stock: 1 },
    { size: '8.5', stock: 4 },
    { size: '9.0', stock: 6 },
    { size: '9.5', stock: 2 },
    { size: '10.0', stock: 3 },
  ],
  colors: ['black', 'white', 'red', 'blue'],
  rating: 4.5,
  reviewCount: 128,
  stock: 50,
};

export default function TestSidebarPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(mockProduct);

  const handleOpenSidebar = () => {
    setSelectedProduct(mockProduct);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Typography variant="h3" gutterBottom>
        Test Product Detail Sidebar
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Click the button below to open the Product Detail Sidebar with the new design.
      </Typography>

      <Button variant="contained" size="large" onClick={handleOpenSidebar} sx={{ mb: 4 }}>
        Open Product Detail Sidebar
      </Button>

      <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" gutterBottom>
          Product Information
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Name: {mockProduct.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Price: {mockProduct.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discount Price:{' '}
          {mockProduct.discountPrice?.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tags: {mockProduct.tags?.join(', ')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Colors: {mockProduct.colors?.join(', ')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sizes: {mockProduct.sizes?.map(s => s.size).join(', ')}
        </Typography>
      </Box>

      {/* Product Detail Sidebar */}
      <ProductDetailSidebar
        productId={selectedProduct._id}
        product={selectedProduct}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Overlay */}
      {isSidebarOpen && (
        <Box
          onClick={handleCloseSidebar}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.3)',
            zIndex: 1200,
            cursor: 'pointer',
          }}
        />
      )}
    </Box>
  );
}
