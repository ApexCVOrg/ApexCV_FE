'use client';

import React from 'react';
import '@/styles/components/_product-card.scss';

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  onAddToCart: () => void;
}

export default function ProductCard({
  name,
  image,
  price,
  discountPrice,
  tags,
  brand,
  categories,
  onAddToCart,
}: ProductCardProps) {
  const isDiscounted = discountPrice && discountPrice < price;

  return (
    <div className="product-card">
      <div className="card-image-container">
        <img src={image} alt={name} className="card-image" />
        {isDiscounted && <span className="sale-chip">Sale</span>}
      </div>
      <div className="card-content">
        <h3 className="product-name" title={name}>{name}</h3>
        <div className="price-container">
          {isDiscounted ? (
            <>
              <span className="discount-price">
                {discountPrice.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </span>
              <span className="original-price">
                {price.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </span>
            </>
          ) : (
            <span className="discount-price">
              {price.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </span>
          )}
        </div>
        <div className="brand-category">
          {brand?.name || 'Unknown Brand'} - {categories?.map(cat => cat.name).join(', ') || 'Uncategorized'}
        </div>
        {tags.length > 0 && (
          <div className="tags-container">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <button className="add-to-cart-button" onClick={onAddToCart}>
        Thêm vào giỏ
      </button>
    </div>
  );
}
