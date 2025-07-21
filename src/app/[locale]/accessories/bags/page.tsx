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

export default function BagsPage() {
  const fetchProducts = async (sortBy: string, gender?: string) => {
    try {
      let queryParams = new URLSearchParams();
      queryParams.append('status', 'active');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data: ApiResponse<ApiProduct[]> = await res.json();
      
      // Lọc sản phẩm bags
      const filtered = (data.data || []).filter((item: ApiProduct) => {
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasBags = item.categoryPath.some((cat: string) => 
            cat.toLowerCase().includes('bags') || cat.toLowerCase().includes('bag')
          );
          if (hasBags) return true;
        }
        
        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          const hasBagsCategory = categoryNames.some((name: string) => 
            name.includes('bags') || name.includes('bag')
          );
          if (hasBagsCategory) return true;
        }
        
        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasBagsTag = item.tags.some((tag: string) => 
            tag.toLowerCase().includes('bags') || tag.toLowerCase().includes('bag')
          );
          if (hasBagsTag) return true;
        }
        
        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('bags') || item.name.toLowerCase().includes('bag')) return true;
        
        return false;
      });

      // Apply sorting using utility function
      const sorted = sortProductsClientSide(filtered, sortBy);

      return sorted;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AccessoriesPageLayout
      pageTitle="ACCESSORIES BAGS"
      pageDescription="Discover the iconic bags collection. Classic design meets modern comfort."
      category="Bags"
      fetchProducts={fetchProducts}
      emptyMessage="No bags found."
      tabs={TABS}
    />
  );
} 