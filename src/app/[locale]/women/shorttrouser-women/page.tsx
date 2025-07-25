'use client';
import React from 'react';
import GenderPageLayout from '@/components/layout/GenderPageLayout';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  categoryPath?: string[] | string;
  createdAt: string;
}

export default function WomenShortsPage() {
  const fetchProducts = async (sortBy: string): Promise<Product[]> => {
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

    try {
      // Fetch only women's products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        gender: 'women',
        sortBy: apiSortBy,
        sortOrder: sortOrder,
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?${queryParams}`);
      const data = await res.json();

      // Lọc sản phẩm shorts cho nữ
      const filtered = (data.data || []).filter((item: Product) => {
        // Kiểm tra categoryPath
        if (item.categoryPath && Array.isArray(item.categoryPath)) {
          const hasShorts = item.categoryPath.some(
            (cat: string) =>
              cat.toLowerCase().includes('shorts') || cat.toLowerCase().includes('short')
          );
          if (hasShorts) return true;
        }

        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasShortsCategory = categoryNames.some(
            (name: string) => name.includes('shorts') || name.includes('short')
          );
          if (hasShortsCategory) return true;
        }

        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasShortsTag = item.tags.some(
            (tag: string) =>
              tag.toLowerCase().includes('shorts') || tag.toLowerCase().includes('short')
          );
          if (hasShortsTag) return true;
        }

        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('shorts') || item.name.toLowerCase().includes('short'))
          return true;

        return false;
      });

      return filtered;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  };

  return (
    <GenderPageLayout
      pageTitle="WOMEN'S SHORT TROUSERS"
      pageDescription="Thoải mái vận động với bộ sưu tập quần short nữ, chất liệu nhẹ, thoáng khí, phù hợp cho thể thao và mặc hàng ngày."
      category="Short Trousers"
      fetchProducts={fetchProducts}
      emptyMessage="No shorts found."
    />
  );
}
