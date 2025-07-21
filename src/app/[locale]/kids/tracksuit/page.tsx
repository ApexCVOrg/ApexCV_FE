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

export default function KidsTracksuitPage() {
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
      // Fetch only kids' products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        gender: 'kids',
        sortBy: apiSortBy,
        sortOrder: sortOrder,
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data = await res.json();

      // Lọc sản phẩm tracksuit cho kids
      const filtered = (data.data || []).filter((item: any) => {
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasTracksuit = item.categoryPath.some(
            (cat: string) =>
              cat.toLowerCase().includes('tracksuit') || cat.toLowerCase().includes('tracksuits')
          );
          if (hasTracksuit) return true;
        }

        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: any) => cat.name.toLowerCase());
          const hasTracksuitCategory = categoryNames.some(
            (name: string) => name.includes('tracksuit') || name.includes('tracksuits')
          );
          if (hasTracksuitCategory) return true;
        }

        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasTracksuitTag = item.tags.some((tag: string) =>
            tag.toLowerCase().includes('tracksuit')
          );
          if (hasTracksuitTag) return true;
        }

        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('tracksuit')) return true;

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
      pageTitle="KIDS' TRACKSUITS"
      pageDescription="Comfortable and stylish tracksuits for kids. Perfect for sports and casual wear."
      category="Tracksuit"
      fetchProducts={fetchProducts}
      emptyMessage="No tracksuits found."
    />
  );
}
