"use client";
import React from "react";
import AccessoriesPageLayout from "@/components/layout/AccessoriesPageLayout";
import { sortProductsClientSide } from "@/lib/utils/sortUtils";
import { ApiProduct } from '@/types';



export default function BagsPage() {
  const fetchProducts = async (sortBy: string) => {
    try {
      // Fetch only accessories products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        sortBy: 'newest',
        sortOrder: 'desc',
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data = await res.json();
      
      // Lọc sản phẩm bags
      const filtered = (data.data || []).filter((item: ApiProduct) => {
        // Kiểm tra categoryPath
        if (item.categoryPath && Array.isArray(item.categoryPath)) {
          const hasBag = item.categoryPath.some(
            (cat: string) =>
              cat.toLowerCase().includes('bag') || cat.toLowerCase().includes('bags')
          );
          if (hasBag) return true;
        }

        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasBagCategory = categoryNames.some((name: string) => 
            name.includes('bag') || name.includes('bags')
          );
          if (hasBagCategory) return true;
        }

        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasBagTag = item.tags.some((tag: string) =>
            tag.toLowerCase().includes('bag')
          );
          if (hasBagTag) return true;
        }

        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('bag')) return true;

        return false;
      });
      
      // Client-side sorting as fallback if API sorting doesn't work
      const sorted = sortProductsClientSide(filtered, sortBy);
      
      // Convert to match the expected Product interface
      const converted = sorted.map((item) => ({
        _id: item._id,
        name: item.name,
        images: item.images || [],
        price: item.price,
        discountPrice: item.discountPrice,
        tags: item.tags || [],
        brand: item.brand || { _id: '', name: 'Unknown Brand' },
        categories: item.categories || [],
        createdAt: item.createdAt || new Date().toISOString(),
      }));
      
      return converted;
    } catch {
      throw new Error('Failed to fetch products');
    }
  };

  return (
    <AccessoriesPageLayout
      pageTitle="ACCESSORIES BAGS"
      category="Bags"
      fetchProducts={fetchProducts}
      emptyMessage="No bags found."
      tabs={[]} // Removed tabs as per new_code
    />
  );
} 