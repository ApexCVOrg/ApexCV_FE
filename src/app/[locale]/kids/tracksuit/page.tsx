"use client";
import React from "react";
import GenderPageLayout from "@/components/layout/GenderPageLayout";
import { sortProductsClientSide, convertSortParams } from "@/lib/utils/sortUtils";
import { ApiProduct } from '@/types';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  categoryPath?: string[];
  createdAt: string;
}

export default function KidsTracksuitPage() {
  const fetchProducts = async (sortBy: string): Promise<Product[]> => {
    const { apiSortBy, sortOrder } = convertSortParams(sortBy);
    
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
      const filtered = (data.data || []).filter((item: ApiProduct) => {
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
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasTracksuitCategory = categoryNames.some((name: string) => 
            name.includes('tracksuit') || name.includes('tracksuits')
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
      
      // Client-side sorting as fallback if API sorting doesn't work
      const sorted = sortProductsClientSide(filtered, sortBy);
      
      return sorted;
    } catch {
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
