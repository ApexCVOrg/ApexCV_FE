'use client';
import React from 'react';
import ShoesPageLayout from '@/components/layout/ShoesPageLayout';

interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: string | { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  categoryPath?: string[] | string;
  createdAt?: string;
}

const TABS = [
  // { label: "SPEZIAL", value: "spezial", image: "/assets/images/shoes/spezial/Giay_Handball_Spezial_mau_xanh_la_IG6192_01_standard.avif" }, // Loại bỏ SPEZIAL
  {
    label: 'SAMBA',
    value: 'samba',
    image: '/assets/images/shoes/samba/Giay_Samba_OG_trang_B75806_01_00_standard.avif',
  },
  {
    label: 'SUPERSTAR',
    value: 'superstar',
    image: '/assets/images/shoes/superstar/Giay_Superstar_Vintage_trang_JQ3254_01_00_standard.avif',
  },
  {
    label: 'GAZELLE',
    value: 'gazelle',
    image: '/assets/images/shoes/gazelle/Giay_Gazelle_Indoor_DJen_JI2060_01_standard.avif',
  },
  {
    label: 'SL 72',
    value: 'sl-72',
    image: '/assets/images/shoes/sl72/Giay_SL_72_OG_Mau_xanh_da_troi_JS0255_01_00_standard.avif',
  },
];

export default function SuperstarPage() {
  const fetchProducts = async (sortBy: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?status=active`);
      const data = await res.json();

      // Lọc sản phẩm theo categoryPath mong muốn
      const desiredPath = ['Shoes', 'Adidas', 'Superstar'];

      // Thử nhiều cách filter khác nhau
      const filtered = (data.data || []).filter((item: Product) => {
        // Cách 1: Kiểm tra nếu categoryPath là array
        if (item.categoryPath && Array.isArray(item.categoryPath)) {
          const isMatch = desiredPath.every(
            (cat, idx) => (item.categoryPath![idx] || '').toLowerCase() === cat.toLowerCase()
          );
          if (isMatch) return true;
        }

        // Cách 2: Kiểm tra nếu categoryPath là string
        if (item.categoryPath && typeof item.categoryPath === 'string') {
          const pathString = item.categoryPath.toLowerCase();
          const desiredString = desiredPath.join('/').toLowerCase();
          if (pathString === desiredString) return true;
        }

        // Cách 3: Kiểm tra nếu có field khác chứa category info
        if (item.categories && Array.isArray(item.categories)) {
          const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
          if (categoryNames.includes('superstar')) return true;
        }

        // Cách 4: Kiểm tra trong name hoặc description
        if (item.name.toLowerCase().includes('superstar')) return true;

        return false;
      });

      // Sort products based on sortBy
      switch (sortBy) {
        case 'price-low':
          return filtered.sort((a: Product, b: Product) => a.price - b.price);
        case 'price-high':
          return filtered.sort((a: Product, b: Product) => b.price - a.price);
        case 'popular':
          return filtered.sort((a: Product, b: Product) => (b.tags?.length || 0) - (a.tags?.length || 0));
        case 'newest':
        default:
          return filtered.sort(
            (a: Product, b: Product) =>
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
      }
    } catch (e) {
      console.error('Error fetching products:', e);
      return [];
    }
  };

  return (
    <ShoesPageLayout
      pageTitle="ADIDAS SUPERSTAR"
      pageDescription="Discover the iconic Superstar collection"
      category="Superstar"
      fetchProducts={fetchProducts}
      emptyMessage="No Superstar products found"
      tabs={TABS}
    />
  );
}
