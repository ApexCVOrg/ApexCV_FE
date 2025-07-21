"use client";
import React from "react";
import AccessoriesPageLayout from "@/components/layout/AccessoriesPageLayout";



interface ApiProduct {
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

interface ApiResponse {
  data: ApiProduct[];
}

const TABS = [
  { label: "BAGS", value: "bags", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093478/Mini_Airliner_Bag_Blue_JC8302_01_00_standard_qv8iwo.avif" },
  { label: "HATS", value: "hats", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093480/Golf_Performance_Crestable_Cap_Black_IM9184_01_standard_pjozkk.avif" },
  { label: "SOCKS", value: "socks", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753093481/Mid_Cut_Crew_Socks_3_Pairs_White_IJ0733_01_01_00_standard_b3j0iv.avif" },
  { label: "EYEWEARS", value: "eyewears", image: "https://res.cloudinary.com/dqmb4e2et/image/upload/v1753094816/Sport_Sunglasses_adidas_DUNAMIS_Antique_Black_IV1298_01_hover_standard_whlnza.avif" }
];

export default function SocksPage() {
  const fetchProducts = async (sortBy: string, gender?: string) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', 'active');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data: ApiResponse = await res.json();
      const filtered = (data.data || []).filter((item: ApiProduct) => {
        // First: Filter by gender if specified
        if (gender && gender !== 'all') {
          let hasGender = false;
          
          // Check categoryPath for gender
          if (Array.isArray(item.categoryPath)) {
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
        
        // Second: Filter by category (socks)
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasSocks = item.categoryPath.some((cat: string) =>
            cat.toLowerCase().includes('socks') || cat.toLowerCase().includes('sock')
          );
          if (hasSocks) return true;
        }
        
        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { name: string }) => cat.name.toLowerCase());
          const hasSocksCategory = categoryNames.some((name: string) =>
            name.includes('socks') || name.includes('sock')
          );
          if (hasSocksCategory) return true;
        }
        
        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasSocksTag = item.tags.some((tag: string) =>
            tag.toLowerCase().includes('socks') || tag.toLowerCase().includes('sock')
          );
          if (hasSocksTag) return true;
        }
        
        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('socks') || item.name.toLowerCase().includes('sock')) return true;
        
        return false;
      });

      // Apply sorting
      const sorted = [...filtered];
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
      throw error;
    }
  };

  return (
    <AccessoriesPageLayout
      pageTitle="ACCESSORIES SOCKS"
      category="Socks"
      fetchProducts={fetchProducts}
      emptyMessage="No socks found."
      tabs={TABS}
    />
  );
} 