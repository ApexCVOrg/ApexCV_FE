"use client";
import React from "react";
import ShoesPageLayout from "@/components/layout/ShoesPageLayout";

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

const TABS = [
  { label: "SAMBA", value: "samba", image: "/assets/images/shoes/samba/Giay_Samba_OG_trang_B75806_01_00_standard.avif" },
  { label: "SUPERSTAR", value: "superstar", image: "/assets/images/shoes/superstar/Giay_Superstar_Vintage_trang_JQ3254_01_00_standard.avif" },
  { label: "GAZELLE", value: "gazelle", image: "/assets/images/shoes/gazelle/Giay_Gazelle_Indoor_DJen_JI2060_01_standard.avif" },
  { label: "SL 72", value: "sl-72", image: "/assets/images/shoes/sl72/Giay_SL_72_OG_Mau_xanh_da_troi_JS0255_01_00_standard.avif" }
];

export default function SambaPage() {
  const fetchProducts = async (sortBy: string): Promise<Product[]> => {
    let apiSortBy = sortBy;
    let sortOrder = 'desc';
    if (sortBy === 'price-low') { apiSortBy = 'price'; sortOrder = 'asc'; }
    else if (sortBy === 'price-high') { apiSortBy = 'price'; sortOrder = 'desc'; }
    else if (sortBy === 'newest') { apiSortBy = 'createdAt'; sortOrder = 'desc'; }
    else if (sortBy === 'popular') { apiSortBy = 'popularity'; sortOrder = 'desc'; }
    
    try {
      // Fetch products with sorting
      const queryParams = new URLSearchParams({
        status: 'active',
        sortBy: apiSortBy,
        sortOrder: sortOrder
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      const data = await res.json();
      
      // Lọc sản phẩm samba
      const filtered = (data.data || []).filter((item: any) => {
        // Kiểm tra categoryPath
        if (Array.isArray(item.categoryPath)) {
          const hasSamba = item.categoryPath.some((cat: string) => 
            cat.toLowerCase().includes('samba')
          );
          if (hasSamba) return true;
        }
        
        // Kiểm tra categories array
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: any) => cat.name.toLowerCase());
          const hasSambaCategory = categoryNames.some((name: string) => 
            name.includes('samba')
          );
          if (hasSambaCategory) return true;
        }
        
        // Kiểm tra tags
        if (item.tags && Array.isArray(item.tags)) {
          const hasSambaTag = item.tags.some((tag: string) => 
            tag.toLowerCase().includes('samba')
          );
          if (hasSambaTag) return true;
        }
        
        // Kiểm tra trong name
        if (item.name.toLowerCase().includes('samba')) return true;
        
        return false;
      });
      
      return filtered;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  };

  return (
    <ShoesPageLayout
      pageTitle="ADIDAS SAMBA"
      pageDescription="Discover the iconic Adidas Samba collection. Classic design meets modern comfort."
      category="Samba"
      fetchProducts={fetchProducts}
      emptyMessage="No samba shoes found."
      tabs={TABS}
    />
  );
} 