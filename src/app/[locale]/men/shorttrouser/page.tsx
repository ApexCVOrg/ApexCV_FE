'use client';
import React from 'react';
import GenderPageLayout from '@/components/layout/GenderPageLayout';

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

export default function MenShortsPage() {
  const fetchProducts = async (sortBy: string): Promise<Product[]> => {
    let apiSortBy = sortBy;
    let sortOrder = 'desc';
    if (sortBy === 'price-low') {
      apiSortBy = 'price';
      sortOrder = 'asc';
    } else if (sortBy === 'price-high') {
      apiSortBy = 'price';
      sortOrder = 'desc';
    } else if (sortBy === 'newest') {
      apiSortBy = 'createdAt';
      sortOrder = 'desc';
    } else if (sortBy === 'popular') {
      apiSortBy = 'popularity';
      sortOrder = 'desc';
    }
    const queryParams = new URLSearchParams({ sortBy: apiSortBy, sortOrder, gender: 'men' });
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?${queryParams}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch products');
    const teamNames = ['arsenal', 'real madrid', 'manchester united', 'bayern munich', 'juventus'];
    const shorts = (data.data || []).filter(
      (p: Product) =>
        (p.categories || []).some((c: { _id: string; name: string }) => c.name.toLowerCase() === 'shorts') &&
        p.categories?.[1] &&
        teamNames.includes(p.categories[1].name.toLowerCase())
    );
    return shorts;
  };

  return (
    <GenderPageLayout
      pageTitle="MEN'S SHORTS"
      pageDescription="Discover our collection of men's shorts for training and casual wear."
      category="Shorts"
      fetchProducts={fetchProducts}
      emptyMessage="No shorts found."
    />
  );
}
