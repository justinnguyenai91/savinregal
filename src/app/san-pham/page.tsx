'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
interface ApiCategory { id: string; name: string; slug: string; _count: { products: number } }

export default function ProductCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/products?limit=50'), fetch('/api/categories')])
      .then(([p, c]) => Promise.all([p.json(), c.json()]))
      .then(([pd, cd]) => {
        const transformed = (pd.products || []).map((p: {
          id: string; slug: string; name: string; shortDescription: string; description: string;
          price: number; originalPrice: number | null; images: string[]; badges: string[];
          rating: number; reviewCount: number; inStock: boolean; stockQuantity: number;
          benefits: string[]; ingredients: string[]; usage: string; warnings: string[];
          certifications: string[]; origin: string;
          category: { name: string; slug: string };
          variants: { id: string; name: string; price: number; originalPrice: number | null; inStock: boolean }[];
        }) => ({
          ...p,
          category: p.category?.name || '',
          categorySlug: p.category?.slug || '',
          originalPrice: p.originalPrice ?? undefined,
          variants: p.variants?.map(v => ({ ...v, originalPrice: v.originalPrice ?? undefined })),
        }));
        setProducts(transformed);
        setCategories(cd || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'all') result = result.filter(p => p.categorySlug === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
    }
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, selectedCategory, sortBy, searchQuery]);

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C4A3E 0%, #1e3328 60%, #3A2A1A 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 Q36 20 30 32 Q24 20 30 8Z' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
        <div className="container-custom relative z-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 inline-block" style={{color:'#C4956A'}}>Savin Regal</span>
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4" style={{color:'#FFFFFF'}}>Sản Phẩm Của Chúng Tôi</h1>
          <p className="max-w-lg mx-auto" style={{color:'rgba(255,255,255,0.6)'}}>Khám phá bộ sưu tập dược liệu quý hiếm từ núi rừng Tây Nguyên</p>
        </div>
      </section>

      <section style={{paddingTop:'2.5rem',paddingBottom:'5rem',background:'#FAF6EF'}}>
        <div className="container-custom">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 border-2 border-mountain-deep border-t-transparent rounded-full animate-spin" />
              <p className="text-silver-dark text-sm">Đang tải sản phẩm...</p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    style={{
                      padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.8125rem',
                      fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
                      background: selectedCategory === 'all' ? '#2C4A3E' : '#FFFFFF',
                      color: selectedCategory === 'all' ? '#FFFFFF' : '#374151',
                      border: selectedCategory === 'all' ? '1px solid #2C4A3E' : '1px solid #D1D5DB',
                      boxShadow: selectedCategory === 'all' ? '0 2px 8px rgba(44,74,62,0.25)' : 'none',
                    }}
                  >
                    Tất cả ({products.length})
                  </button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)}
                      style={{
                        padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.8125rem',
                        fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
                        background: selectedCategory === cat.slug ? '#2C4A3E' : '#FFFFFF',
                        color: selectedCategory === cat.slug ? '#FFFFFF' : '#374151',
                        border: selectedCategory === cat.slug ? '1px solid #2C4A3E' : '1px solid #D1D5DB',
                        boxShadow: selectedCategory === cat.slug ? '0 2px 8px rgba(44,74,62,0.25)' : 'none',
                      }}
                    >
                      {cat.name} ({cat._count.products})
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Tìm sản phẩm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-silver-light bg-white text-sm focus:ring-2 focus:ring-mountain-light/30 focus:border-mountain-light transition-all"
                    />
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-2.5 rounded-xl border border-silver-light bg-white text-sm text-bark-light focus:ring-2 focus:ring-mountain-light/30 cursor-pointer">
                    <option value="default">Mặc định</option>
                    <option value="price-asc">Giá: Thấp → Cao</option>
                    <option value="price-desc">Giá: Cao → Thấp</option>
                    <option value="rating">Đánh giá cao</option>
                  </select>
                </div>
              </div>

              <p className="text-sm mb-6" style={{color:'#6B7280'}}>
                Hiển thị <strong style={{color:'#111714'}}>{filteredProducts.length}</strong> sản phẩm
              </p>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="w-16 h-16 mx-auto rounded-full bg-fog flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-silver-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-bark mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-silver-dark text-sm mb-5">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="btn-outline !text-sm">Xóa bộ lọc</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
