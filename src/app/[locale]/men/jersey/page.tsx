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

export default function MenJerseyPage() {
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
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch products');
    const teamNames = ['arsenal', 'real madrid', 'manchester united', 'bayern munich', 'juventus'];
    const jerseys = (data.data || []).filter(
      (p: any) =>
        (p.categories || []).some(
          (c: any) => c.name.toLowerCase() === 't-shirts' || c.name.toLowerCase() === 'jersey'
        ) &&
        p.categories?.[1] &&
        teamNames.includes(p.categories[1].name.toLowerCase())
    );
    return jerseys;
  };

  return (
    <GenderPageLayout
      pageTitle="MEN'S JERSEYS"
      pageDescription="Discover our collection of men's football jerseys from top clubs and national teams. Designed for performance and style, these jerseys keep you cool and comfortable on and off the pitch."
      category="Jersey"
      fetchProducts={fetchProducts}
      emptyMessage="No jerseys found."
    />
  );
}
