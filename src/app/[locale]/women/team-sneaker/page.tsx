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

export default function WomenSneakerPage() {
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

      // Lọc sản phẩm sneaker cho nữ
      const filtered = (data.data || []).filter((item: Product) => {
        // Kiểm tra categoryPath
        if (item.categoryPath && Array.isArray(item.categoryPath)) {
          const hasSneaker = item.categoryPath.some(
            (cat: string) =>
              cat.toLowerCase().includes('sneaker') ||
              cat.toLowerCase().includes('sneakers') ||
              cat.toLowerCase().includes('shoes')
          );
          if (hasSneaker) return true;
        }

        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasSneakerCategory = categoryNames.some(
            (name: string) =>
              name.includes('sneaker') || name.includes('sneakers') || name.includes('shoes')
          );
          if (hasSneakerCategory) return true;
        }

        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasSneakerTag = item.tags.some(
            (tag: string) =>
              tag.toLowerCase().includes('sneaker') || tag.toLowerCase().includes('shoes')
          );
          if (hasSneakerTag) return true;
        }

        // Kiểm tra trong name
        if (
          item.name.toLowerCase().includes('sneaker') ||
          item.name.toLowerCase().includes('shoes')
        )
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
      pageTitle="WOMEN'S SNEAKERS"
      pageDescription="Discover our collection of women's sneakers for comfort and style. From casual to sporty, find your perfect pair."
      category="Sneakers"
      fetchProducts={fetchProducts}
      emptyMessage="No sneakers found."
    />
  );
}
