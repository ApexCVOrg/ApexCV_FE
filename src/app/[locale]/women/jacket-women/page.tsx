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
  createdAt: string;
}

export default function WomenJacketPage() {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data = await res.json();

      // Lọc sản phẩm jacket cho nữ
      const filtered = (data.data || []).filter((item: any) => {
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasJacket = item.categoryPath.some(
            (cat: string) =>
              cat.toLowerCase().includes('jacket') || cat.toLowerCase().includes('jackets')
          );
          if (hasJacket) return true;
        }

        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: any) => cat.name.toLowerCase());
          const hasJacketCategory = categoryNames.some(
            (name: string) => name.includes('jacket') || name.includes('jackets')
          );
          if (hasJacketCategory) return true;
        }

        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasJacketTag = item.tags.some((tag: string) =>
            tag.toLowerCase().includes('jacket')
          );
          if (hasJacketTag) return true;
        }

        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('jacket')) return true;

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
      pageTitle="WOMEN'S JACKETS"
      pageDescription="Phong cách và ấm áp với bộ sưu tập áo khoác nữ, thiết kế hiện đại, chất liệu cao cấp, phù hợp cho mọi dịp và thời tiết."
      category="Jacket"
      fetchProducts={fetchProducts}
      emptyMessage="No jackets found."
    />
  );
}
