"use client";
import React from "react";
import GenderPageLayout from "@/components/layout/GenderPageLayout";
import { sortProductsClientSide, convertSortParams } from "@/lib/utils/sortUtils";
import { ApiProduct, ApiResponse } from '@/types';

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

export default function WomenHoodiePage() {
  const fetchProducts = async (sortBy: string): Promise<Product[]> => {
    const { apiSortBy, sortOrder } = convertSortParams(sortBy);
    
    try {
      // Fetch only women's products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        gender: 'women',
        sortBy: apiSortBy,
        sortOrder: sortOrder
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data = await res.json();
      
      // Lọc sản phẩm hoodie cho women
      const filtered = (data.data || []).filter((item: ApiProduct) => {
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasHoodie = item.categoryPath.some((cat: string) => 
            cat.toLowerCase().includes('hoodie') || cat.toLowerCase().includes('hoodies')
          );
          if (hasHoodie) return true;
        }
        
        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasHoodieCategory = categoryNames.some((name: string) => 
            name.includes('hoodie') || name.includes('hoodies')
          );
          if (hasHoodieCategory) return true;
        }
        
        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasHoodieTag = item.tags.some((tag: string) => 
            tag.toLowerCase().includes('hoodie')
          );
          if (hasHoodieTag) return true;
        }
        
        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('hoodie')) return true;
        
        return false;
      });
      
      // Client-side sorting as fallback if API sorting doesn't work
      const sorted = sortProductsClientSide(filtered, sortBy);
      
      return sorted;
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  };

  return (
    <GenderPageLayout
      pageTitle="WOMEN'S HOODIES"
      pageDescription="Explore our collection of women's hoodies, perfect for comfort and style. From casual to sporty, find your perfect hoodie."
      category="Hoodies"
      fetchProducts={fetchProducts}
      emptyMessage="No hoodies found."
    />
  );
}