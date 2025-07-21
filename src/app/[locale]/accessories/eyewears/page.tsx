"use client";
import React from "react";
import AccessoriesPageLayout from "@/components/layout/AccessoriesPageLayout";
import { sortProductsClientSide } from "@/lib/utils/sortUtils";
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
  categoryPath?: string[];
  createdAt: string;
}

const TABS = [
  { label: "BAGS", value: "bags", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093478/Mini_Airliner_Bag_Blue_JC8302_01_00_standard_qv8iwo.avif" },
  { label: "HATS", value: "hats", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093480/Golf_Performance_Crestable_Cap_Black_IM9184_01_standard_pjozkk.avif" },
  { label: "SOCKS", value: "socks", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093481/Mid_Cut_Crew_Socks_3_Pairs_White_IJ0733_01_01_00_standard_b3j0iv.avif" },
  { label: "EYEWEARS", value: "eyewears", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753094816/Sport_Sunglasses_adidas_DUNAMIS_Antique_Black_IV1298_01_hover_standard_whlnza.avif" }
];

export default function EyewearsPage() {
  const fetchProducts = async (sortBy: string, gender?: string): Promise<Product[]> => {
    try {
      let queryParams = new URLSearchParams();
      queryParams.append('status', 'active');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data: ApiResponse<ApiProduct[]> = await res.json();
      
      // Lọc sản phẩm eyewears
      const filtered = (data.data || []).filter((item: ApiProduct) => {
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasEyewears = item.categoryPath.some((cat: string) => 
            cat.toLowerCase().includes('eyewears') || cat.toLowerCase().includes('eyewear')
          );
          if (hasEyewears) return true;
        }
        
        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasEyewearsCategory = categoryNames.some((name: string) => 
            name.includes('eyewears') || name.includes('eyewear')
          );
          if (hasEyewearsCategory) return true;
        }
        
        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasEyewearsTag = item.tags.some((tag: string) => 
            tag.toLowerCase().includes('eyewears') || tag.toLowerCase().includes('eyewear')
          );
          if (hasEyewearsTag) return true;
        }
        
        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('eyewears') || item.name.toLowerCase().includes('eyewear')) return true;
        
        return false;
      });

      // Convert ApiProduct to Product
      const products: Product[] = filtered.map((item: ApiProduct) => ({
        _id: item._id,
        name: item.name,
        images: item.images || [],
        price: item.price,
        discountPrice: item.discountPrice,
        tags: item.tags || [],
        brand: item.brand || { _id: '', name: '' },
        categories: item.categories || [],
        categoryPath: Array.isArray(item.categoryPath) ? item.categoryPath : undefined,
        createdAt: item.createdAt || new Date().toISOString(),
      }));

      // Apply sorting
      let sorted = [...products];
      switch (sortBy) {
        case 'price-low':
          sorted.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          sorted.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popular':
          // Sort by popularity (you can implement your own logic here)
          break;
        default:
          break;
      }

      return sorted;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  return (
    <AccessoriesPageLayout
      pageTitle="ACCESSORIES EYEWEARS"
      pageDescription="Discover the iconic eyewears collection. Classic design meets modern comfort."
      category="Eyewears"
      fetchProducts={fetchProducts}
      emptyMessage="No eyewears found."
      tabs={TABS}
    />
  );
} 