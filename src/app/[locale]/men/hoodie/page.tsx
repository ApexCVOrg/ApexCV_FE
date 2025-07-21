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

export default function HoodiePage() {
  const fetchProducts = async (sortBy: string): Promise<Product[]> => {
    let apiSortBy = sortBy;
    let sortOrder = 'desc';
    if (sortBy === 'price-low') { apiSortBy = 'price'; sortOrder = 'asc'; }
    else if (sortBy === 'price-high') { apiSortBy = 'price'; sortOrder = 'desc'; }
    else if (sortBy === 'newest') { apiSortBy = 'createdAt'; sortOrder = 'desc'; }
    else if (sortBy === 'popular') { apiSortBy = 'popularity'; sortOrder = 'desc'; }
    
    try {
      // Fetch only men's products
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?status=active&gender=men`);
      const data = await res.json();
      
      // Lọc sản phẩm hoodie cho nam
      const filtered = (data.data || []).filter((item: any) => {
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasHoodie = item.categoryPath.some((cat: string) => 
            cat.toLowerCase().includes('hoodie') || cat.toLowerCase().includes('hoodies')
          );
          if (hasHoodie) return true;
        }
        
        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: any) => cat.name.toLowerCase());
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
      
      return filtered;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  };

  return (
    <GenderPageLayout
      pageTitle="MEN'S HOODIES"
      pageDescription="Discover our collection of men's hoodies for comfort and style on and off the pitch."
      category="Hoodie"
      fetchProducts={fetchProducts}
      emptyMessage="No hoodies found."
    />
  );
} 