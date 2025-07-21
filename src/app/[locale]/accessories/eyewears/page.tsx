"use client";
import React from "react";
import AccessoriesPageLayout from "@/components/layout/AccessoriesPageLayout";
import { convertSortParams } from "@/lib/utils/sortUtils";
import { ApiProduct } from '@/types';

export default function EyewearsPage() {
  const fetchProducts = async (sortBy: string) => {
    const { apiSortBy, sortOrder } = convertSortParams(sortBy);
    
    try {
      // Fetch only accessories products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        sortBy: apiSortBy,
        sortOrder: sortOrder,
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data = await res.json();
      
      // Lọc sản phẩm eyewears
      const filtered = (data.data || []).filter((item: ApiProduct) => {
        // Kiểm tra categoryPath
        if (item.categoryPath && Array.isArray(item.categoryPath)) {
          const hasEyewear = item.categoryPath.some(
            (cat: string) =>
              cat.toLowerCase().includes('eyewear') || cat.toLowerCase().includes('eyewears') || cat.toLowerCase().includes('sunglasses')
          );
          if (hasEyewear) return true;
        }

        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasEyewearCategory = categoryNames.some((name: string) => 
            name.includes('eyewear') || name.includes('eyewears') || name.includes('sunglasses')
          );
          if (hasEyewearCategory) return true;
        }

        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasEyewearTag = item.tags.some((tag: string) =>
            tag.toLowerCase().includes('eyewear') || tag.toLowerCase().includes('sunglasses')
          );
          if (hasEyewearTag) return true;
        }

        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('eyewear') || item.name.toLowerCase().includes('sunglasses')) return true;

        return false;
      });
      
      // Convert ApiProduct to Product to match the expected interface
      const converted = filtered.map((item: ApiProduct) => ({
        _id: item._id,
        name: item.name,
        images: item.images || [],
        price: item.price,
        discountPrice: item.discountPrice,
        tags: item.tags || [],
        brand: item.brand || { _id: '', name: 'Unknown Brand' },
        categories: item.categories || [],
        categoryPath: item.categoryPath,
        createdAt: item.createdAt || new Date().toISOString(),
      }));
      
      return converted;
    } catch {
      throw new Error('Failed to fetch products');
    }
  };

  return (
    <AccessoriesPageLayout
      pageTitle="ACCESSORIES EYEWEARS"
      category="Eyewears"
      fetchProducts={fetchProducts}
      emptyMessage="No eyewears found."
      tabs={[]} // Removed tabs as per new_code
    />
  );
} 