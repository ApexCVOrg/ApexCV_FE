"use client";
import React from "react";
import GenderPageLayout from "@/components/layout/GenderPageLayout";

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

export default function KidsSmileyPage() {
  const fetchProducts = async (sortBy: string): Promise<Product[]> => {
    let apiSortBy = sortBy;
    let sortOrder = 'desc';
    if (sortBy === 'price-low') { apiSortBy = 'price'; sortOrder = 'asc'; }
    else if (sortBy === 'price-high') { apiSortBy = 'price'; sortOrder = 'desc'; }
    else if (sortBy === 'newest') { apiSortBy = 'createdAt'; sortOrder = 'desc'; }
    else if (sortBy === 'popular') { apiSortBy = 'popularity'; sortOrder = 'desc'; }
    
    try {
      // Fetch only kids' products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        gender: 'kids',
        sortBy: apiSortBy,
        sortOrder: sortOrder
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data = await res.json();
      
      // Lọc sản phẩm smiley cho kids
      const filtered = (data.data || []).filter((item: any) => {
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasSmiley = item.categoryPath.some((cat: string) => 
            cat.toLowerCase().includes('smiley') || cat.toLowerCase().includes('smileys')
          );
          if (hasSmiley) return true;
        }
        
        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: any) => cat.name.toLowerCase());
          const hasSmileyCategory = categoryNames.some((name: string) => 
            name.includes('smiley') || name.includes('smileys')
          );
          if (hasSmileyCategory) return true;
        }
        
        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasSmileyTag = item.tags.some((tag: string) => 
            tag.toLowerCase().includes('smiley')
          );
          if (hasSmileyTag) return true;
        }
        
        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('smiley')) return true;
        
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
      pageTitle="KIDS' SMILEY"
      pageDescription="Fun and colorful smiley collection for kids. Bright designs that bring joy to young ones."
      category="Smiley"
      fetchProducts={fetchProducts}
      emptyMessage="No smiley products found."
    />
  );
} 