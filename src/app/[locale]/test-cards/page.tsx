"use client";

import React from 'react';
import ProductCard from '@/components/card';

const images = [
  'nike-span-2.png',
  'nike-air-force-1-high.png',
  'nike-air-force.png',
  'air-max-90.png',
  'air-max-excee-.png',
  'air-max-270.png',
];

const imageBase = '/assets/images/lib/';

const sampleNames = [
  'Nike Span 2',
  'Nike Air Force 1 High',
  'Nike Air Force',
  'Air Max 90',
  'Air Max Excee',
  'Air Max 270',
];

const samplePrices = [2300000, 2500000, 2100000, 2200000, 2000000, 2400000];

const TestCardsPage = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2rem',
      padding: '2rem',
      background: '#f5f5f5',
      minHeight: '100vh',
    }}>
      {images.map((img, idx) => (
        <ProductCard
          key={img}
          _id={img}
          productId={img}
          name={sampleNames[idx]}
          image={imageBase + img}
          price={samplePrices[idx]}
          discountPrice={samplePrices[idx] - 200000}
          tags={['new', 'hot']}
          brand={{ _id: 'nike', name: 'Nike' }}
          categories={[{ _id: 'shoes', name: 'Shoes' }]}
          labels={['sale']}
          allCategories={[{ _id: 'shoes', name: 'Shoes' }]}
          allBrands={[{ _id: 'nike', name: 'Nike' }]}
          backgroundColor="#fff"
          colors={3}
          onAddToCart={() => alert('Add to cart: ' + sampleNames[idx])}
        />
      ))}
    </div>
  );
};

export default TestCardsPage; 