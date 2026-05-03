'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps { product: Product }

const badgeConfig: Record<string, { label: string; bg: string; color: string }> = {
  bestseller: { label: 'Bán chạy', bg: '#FEF3C7', color: '#92400E' },
  new:        { label: 'Mới',      bg: '#D1FAE5', color: '#065F46' },
  sale:       { label: 'Giảm giá', bg: '#FEE2E2', color: '#991B1B' },
  limited:    { label: 'Có hạn',   bg: '#E5E7EB', color: '#374151' },
};

const categoryImageMap: Record<string, string> = {
  'sam-ngoc-linh': '/cat-sam-ngoc-linh.jpg',
  'thuc-pham-chuc-nang': '/cat-tpcn.jpg',
  'ruou-sam': '/cat-ruou-sam.jpg',
  'tra-mat-ong': '/cat-tra-mat-ong.jpg',
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-sr-green-200">
      {/* Image area */}
      <Link
        href={`/san-pham/${product.slug}`}
        className="block relative overflow-hidden bg-sr-green-50"
        style={{ aspectRatio: '1/1' }}
      >
        {/* Image — real category photo or logo placeholder */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105"
          style={{ background: '#FAF6EF' }}>
          <img
            src={product.images?.[0] || categoryImageMap[product.categorySlug] || '/placeholder.png'}
            alt={product.name}
            style={{
              width: '100%', height: '100%',
              objectFit: (product.images?.[0] || categoryImageMap[product.categorySlug]) ? 'cover' : 'contain',
              objectPosition: 'center',
              padding: (product.images?.[0] || categoryImageMap[product.categorySlug]) ? 0 : '1rem',
            }}
          />
        </div>

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badges.map(badge => {
            const cfg = badgeConfig[badge];
            if (!cfg) return null;
            return (
              <span key={badge}
                className="inline-block text-[11px] font-bold rounded-full leading-none tracking-wide uppercase"
                style={{ background: cfg.bg, color: cfg.color, padding: '0.3rem 0.75rem' }}
              >
                {cfg.label}
              </span>
            );
          })}
        </div>

        {/* Discount badge top-right */}
        {product.originalPrice && (
          <div className="absolute top-3 right-3 z-10">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-md"
              style={{ background: '#DC2626' }}>
              -{getDiscountPercent(product.price, product.originalPrice)}%
            </div>
          </div>
        )}

        {/* Quick add — slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); addItem(product); }}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold tracking-wide shadow-lg transition-colors"
            style={{ background: '#2C4A3E' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1A3328')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2C4A3E')}
          >
            + Thêm vào giỏ
          </button>
        </div>
      </Link>

      {/* Content — inline padding to bypass Tailwind v4 issues */}
      <div className="flex flex-col flex-1 gap-3" style={{ padding: '1.25rem' }}>
        {/* Category label */}
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#4E7D6A' }}>
          {product.category}
        </p>

        {/* Product name */}
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="text-[15px] font-semibold leading-snug line-clamp-2 transition-colors"
            style={{ fontFamily: 'var(--font-heading)', color: '#111714', minHeight: '2.6rem' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#2C4A3E')}
            onMouseLeave={e => (e.currentTarget.style.color = '#111714')}
          >
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5" fill={i < Math.floor(product.rating) ? '#C4956A' : '#E5E7EB'} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <span className="text-[12px]" style={{ color: '#6B7280' }}>({product.reviewCount})</span>
        </div>

        {/* Price — always at bottom */}
        <div className="flex items-baseline gap-2 mt-auto pt-4 border-t border-gray-100">
          <span className="text-lg font-bold" style={{ color: '#2C4A3E' }}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm line-through" style={{ color: '#9CA3AF' }}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
