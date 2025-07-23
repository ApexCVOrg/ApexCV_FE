"use client";
import React from "react";
import AccessoriesPageLayout from "@/components/layout/AccessoriesPageLayout";
import { convertSortParams } from "@/lib/utils/sortUtils";
import { ApiProduct } from '@/types';

const TABS = [
  { label: "BAGS", value: "bags", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093478/Mini_Airliner_Bag_Blue_JC8302_01_00_standard_qv8iwo.avif" },
  { label: "HATS", value: "hats", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093480/Golf_Performance_Crestable_Cap_Black_IM9184_01_standard_pjozkk.avif" },
  { label: "SOCKS", value: "socks", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093481/Mid_Cut_Crew_Socks_3_Pairs_White_IJ0733_01_01_00_standard_b3j0iv.avif" },
  { label: "EYEWEARS", value: "eyewears", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753094816/Sport_Sunglasses_adidas_DUNAMIS_Antique_Black_IV1298_01_hover_standard_whlnza.avif" }
];

export default function EyewearsPage() {
  const fetchProducts = async (sortBy: string, gender?: string) => {
    const { apiSortBy, sortOrder } = convertSortParams(sortBy);
    
    try {
      // Fetch only accessories products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        sortBy: apiSortBy,
        sortOrder: sortOrder,
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?${queryParams}`);
      const data = await res.json();
      
      // Lọc sản phẩm eyewears
      const filtered = (data.data || []).filter((item: ApiProduct) => {
        // First: Filter by gender if specified
        if (gender && gender !== 'all') {
          let hasGender = false;
          
          // Check categoryPath for gender - look for structure like ['Accessories', 'Men', 'Eyewears']
          if (item.categoryPath && Array.isArray(item.categoryPath)) {
            hasGender = item.categoryPath.some((cat: string) =>
              cat.toLowerCase() === gender.toLowerCase()
            );
          }
          
          // Check tags for gender if not found in categoryPath
          if (!hasGender && item.tags && Array.isArray(item.tags)) {
            hasGender = item.tags.some((tag: string) =>
              tag.toLowerCase() === gender.toLowerCase()
            );
          }
          
          if (!hasGender) {
            return false;
          }
        }
        
        // Second: Filter by category (eyewears)
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
      tabs={TABS}
    />
  );
} 