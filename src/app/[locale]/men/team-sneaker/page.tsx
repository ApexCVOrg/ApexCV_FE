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

export default function TeamSneakerPage() {
  const fetchProducts = async (sortBy: string): Promise<Product[]> => {
    let apiSortBy = sortBy;
    let sortOrder = 'desc';
    if (sortBy === 'price-low') { apiSortBy = 'price'; sortOrder = 'asc'; }
    else if (sortBy === 'price-high') { apiSortBy = 'price'; sortOrder = 'desc'; }
    else if (sortBy === 'newest') { apiSortBy = 'createdAt'; sortOrder = 'desc'; }
    else if (sortBy === 'popular') { apiSortBy = 'popularity'; sortOrder = 'desc'; }
    
    try {
      // Fetch only men's products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        gender: 'men',
        sortBy: apiSortBy,
        sortOrder: sortOrder
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data = await res.json();
      
      // Lọc sản phẩm team sneaker cho nam
      const filtered = (data.data || []).filter((item: any) => {
        // Loại trừ Nike Span 2
        if (item.name.toLowerCase().includes('nike span 2') || 
            item.name.toLowerCase().includes('span 2')) {
          return false;
        }
        
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasSneaker = item.categoryPath.some((cat: string) => 
            cat.toLowerCase().includes('sneaker') || cat.toLowerCase().includes('shoes') || cat.toLowerCase().includes('team-sneaker')
          );
          if (hasSneaker) return true;
        }
        
        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: any) => cat.name.toLowerCase());
          const hasSneakerCategory = categoryNames.some((name: string) => 
            name.includes('sneaker') || name.includes('shoes') || name.includes('team-sneaker')
          );
          if (hasSneakerCategory) return true;
        }
        
        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasSneakerTag = item.tags.some((tag: string) => 
            tag.toLowerCase().includes('sneaker') || tag.toLowerCase().includes('shoes')
          );
          if (hasSneakerTag) return true;
        }
        
        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('sneaker') || item.name.toLowerCase().includes('shoes')) return true;
        
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
      pageTitle="TEAM SNEAKER"
      pageDescription="Discover the ultimate collection of team-inspired sneakers"
      category="Team Sneaker"
      fetchProducts={fetchProducts}
      emptyMessage="No sneakers found."
    />
  );
} 