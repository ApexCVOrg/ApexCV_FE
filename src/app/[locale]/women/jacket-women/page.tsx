"use client";
import React from "react";
import GenderPageLayout from "@/components/layout/GenderPageLayout";
import { sortProductsClientSide, convertSortParams } from "@/lib/utils/sortUtils";
import { ApiProduct } from '@/types';

export default function WomenJacketPage() {
  const fetchProducts = async (sortBy: string) => {
    const { apiSortBy, sortOrder } = convertSortParams(sortBy);
    
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
      
      // Lọc sản phẩm jacket cho women
      const filtered = (data.data || []).filter((item: ApiProduct) => {
        // Kiểm tra categoryPath
        if (item.categoryPath && Array.isArray(item.categoryPath)) {
          const hasJacket = item.categoryPath.some(
            (cat: string) =>
              cat.toLowerCase().includes('jacket') || cat.toLowerCase().includes('jackets')
          );
          if (hasJacket) return true;
        }

        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasJacketCategory = categoryNames.some((name: string) => 
            name.includes('jacket') || name.includes('jackets')
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
    <GenderPageLayout
      pageTitle="WOMEN'S JACKETS"
      pageDescription="Phong cách và ấm áp với bộ sưu tập áo khoác nữ, thiết kế hiện đại, chất liệu cao cấp, phù hợp cho mọi dịp và thời tiết."
      category="Jacket"
      fetchProducts={fetchProducts}
      emptyMessage="No jackets found."
    />
  );
}
