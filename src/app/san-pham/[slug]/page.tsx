'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { Product, ProductVariant } from '@/types';
import ProductCard from '@/components/product/ProductCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(p: any): Product {
  return {
    ...p,
    category: p.category?.name || '',
    categorySlug: p.category?.slug || '',
    originalPrice: p.originalPrice ?? undefined,
    variants: p.variants?.map((v: ProductVariant & { originalPrice?: number | null }) => ({
      ...v,
      originalPrice: v.originalPrice ?? undefined,
    })),
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'usage' | 'reviews'>('benefits');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        const transformed = transformProduct(data);
        setProduct(transformed);
        setSelectedVariant(transformed.variants?.[0] ?? null);

        // Fetch related products
        if (data.category?.slug) {
          const relRes = await fetch(`/api/products?category=${data.category.slug}&limit=4`);
          const relData = await relRes.json();
          setRelatedProducts(
            (relData.products || [])
              .filter((p: { id: string }) => p.id !== data.id)
              .map(transformProduct)
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: '#1a3c34', borderTopColor: 'transparent' }}></div>
          <p className="text-slate text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-heading font-bold mb-2">Không tìm thấy sản phẩm</h2>
          <Link href="/san-pham" className="btn-primary mt-4 inline-flex">← Quay lại cửa hàng</Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;

  const handleAddToCart = () => {
    addItem(product, selectedVariant ?? undefined, quantity);
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav style={{background:'#FAF6EF',borderBottom:'1px solid #E8DDD0',paddingTop:'0.75rem',paddingBottom:'0.75rem'}}>
        <div className="container-custom flex items-center gap-2 text-xs" style={{color:'#9CA3AF'}}>
          <a href="/" style={{color:'#6B7280'}} className="hover:underline">Trang chủ</a>
          <span>/</span>
          <a href="/san-pham" style={{color:'#6B7280'}} className="hover:underline">Sản phẩm</a>
          <span>/</span>
          <span style={{color:'#111714',fontWeight:500}} className="truncate">{product.name}</span>
        </div>
      </nav>

      {/* ===== MAIN PRODUCT SECTION ===== */}
      <section style={{paddingTop:'2rem',paddingBottom:'2rem',background:'#FAF6EF'}}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* LEFT: Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden" style={{border:'1px solid #E8DDD0'}}>
                <img src={product.images?.[0] || "/placeholder.png"} alt={product.name} style={{width:'100%',height:'100%',objectFit:'contain'}} />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {product.images.slice(1, 4).map((img, i) => (
                    <div key={i} className="aspect-square bg-white rounded-xl shadow-sm flex items-center justify-center cursor-pointer transition-all hover:border-forest-light" style={{border:'1px solid #E8DDD0'}}>
                      <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Info */}
            <div className="space-y-5">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-forest-light uppercase tracking-wider">{product.category}</span>
                {product.badges.map(badge => {
                  const config: Record<string, { label: string; color: string }> = {
                    bestseller: { label: 'Bán chạy', color: 'bg-gold/10 text-gold-dark' },
                    new: { label: 'Mới', color: 'bg-forest-light/10 text-forest-deep' },
                    sale: { label: 'Giảm giá', color: 'bg-danger/10 text-danger' },
                    limited: { label: 'Có hạn', color: 'bg-charcoal/10 text-charcoal' },
                  };
                  const c = config[badge];
                  return <span key={badge} className={`${c.color} text-[10px] font-bold px-2.5 py-1 rounded-full`}>{c.label}</span>;
                })}
              </div>

              {/* Name */}
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-charcoal leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-gold' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-charcoal font-medium">{product.rating}</span>
                <span className="text-sm text-slate">({product.reviewCount} đánh giá)</span>
                <span className="text-sm text-forest-light">• {product.inStock ? 'Còn hàng' : 'Hết hàng'}</span>
              </div>

              {/* Short Description */}
              <p className="text-sm text-charcoal/70 leading-relaxed">{product.shortDescription}</p>

              {/* Price */}
              <div className="flex items-end gap-3 py-2">
                <span className="text-3xl font-bold text-forest-deep">{formatPrice(currentPrice)}</span>
                {currentOriginalPrice && (
                  <>
                    <span className="text-lg text-slate line-through">{formatPrice(currentOriginalPrice)}</span>
                    <span className="text-sm font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                      -{getDiscountPercent(currentPrice, currentOriginalPrice)}%
                    </span>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 py-3 border-y border-gray-100">
                {[
                  { icon: '✅', text: 'Cam kết chính hãng' },
                  { icon: '🔬', text: 'Kiểm định ATTP' },
                  { icon: '🔄', text: 'Đổi trả 30 ngày' },
                  { icon: '🚚', text: 'Freeship từ 2tr' },
                ].map((badge, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-charcoal/70 bg-forest-mist/30 px-3 py-1.5 rounded-full">
                    {badge.icon} {badge.text}
                  </span>
                ))}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-charcoal mb-2 block">Lựa chọn:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={!v.inStock}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                          selectedVariant?.id === v.id
                            ? 'border-forest-deep bg-forest-deep text-white'
                            : v.inStock
                              ? 'border-gray-200 bg-white text-charcoal hover:border-forest-light'
                              : 'border-gray-100 bg-gray-50 text-slate/50 cursor-not-allowed line-through'
                        }`}
                      >
                        {v.name}
                        {!v.inStock && ' (Hết)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex gap-3 pt-2">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-lg hover:bg-gray-50 transition-colors">−</button>
                  <span className="px-5 py-3 text-sm font-semibold border-x border-gray-200 min-w-[50px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-lg hover:bg-gray-50 transition-colors">+</button>
                </div>
                <button onClick={handleAddToCart} className="btn-gold flex-1 !text-base">
                  🛒 Thêm Vào Giỏ Hàng
                </button>
              </div>

              {/* Buy Now */}
              <Link href="/gio-hang" onClick={handleAddToCart} className="btn-primary w-full text-center block !text-base !py-4">
                ⚡ Mua Ngay — {formatPrice(currentPrice * quantity)}
              </Link>

              {/* Consult CTA */}
              <div className="flex gap-3 pt-1">
                <a href="tel:0123456789" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-charcoal hover:bg-forest-mist/20 transition-colors">
                  📞 Gọi tư vấn
                </a>
                <a href="https://zalo.me/0123456789" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-charcoal hover:bg-forest-mist/20 transition-colors">
                  💬 Chat Zalo
                </a>
              </div>

              {/* Origin info */}
              <div className="bg-cream/60 rounded-xl p-4 text-sm">
                <p className="text-charcoal/70">
                  <strong className="text-charcoal">Xuất xứ:</strong> {product.origin} •
                  <strong className="text-charcoal"> Chứng nhận:</strong> {product.certifications.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT DETAILS TABS ===== */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto gap-1 border-b border-gray-200 mb-8">
            {[
              { key: 'benefits', label: '🎯 Công Dụng' },
              { key: 'ingredients', label: '🌿 Thành Phần' },
              { key: 'usage', label: '📖 Hướng Dẫn' },
              { key: 'reviews', label: `⭐ Đánh Giá (${product.reviewCount})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`whitespace-nowrap px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-forest-deep text-forest-deep'
                    : 'border-transparent text-slate hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-3xl">
            {activeTab === 'benefits' && (
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-bold text-charcoal">Công dụng nổi bật</h3>
                <ul className="space-y-3">
                  {product.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-forest-mist/20 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-forest-light text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                      <span className="text-sm text-charcoal/80 leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-bold text-charcoal">Bảng thành phần hoạt chất</h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-forest-deep text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Thành phần</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Hàm lượng</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold hidden sm:table-cell">Mô tả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {product.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-forest-mist/10 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-charcoal">{ing.name}</td>
                          <td className="px-4 py-3 text-sm text-forest-deep font-semibold">{ing.amount}</td>
                          <td className="px-4 py-3 text-sm text-slate hidden sm:table-cell">{ing.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-heading font-bold text-charcoal mb-3">Hướng dẫn sử dụng</h3>
                  <div className="bg-forest-mist/20 rounded-xl p-5">
                    <p className="text-sm text-charcoal/80 leading-relaxed">{product.usage}</p>
                  </div>
                </div>
                {product.warnings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-heading font-bold text-charcoal mb-3">⚠️ Lưu ý quan trọng</h3>
                    <ul className="space-y-2">
                      {product.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-charcoal/70">
                          <span className="text-warning mt-0.5">⚠️</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="flex items-center gap-6 p-5 bg-cream/60 rounded-xl">
                  <div className="text-center">
                    <div className="text-4xl font-heading font-bold text-forest-deep">{product.rating}</div>
                    <div className="flex justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-gold' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate mt-1">{product.reviewCount} đánh giá</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(star => {
                      const pct = star === 5 ? 75 : star === 4 ? 18 : star === 3 ? 5 : 2;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-slate w-3">{star}</span>
                          <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-slate w-8">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews Placeholder */}
                <div className="text-center py-8 text-slate">
                  <p className="text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== RELATED PRODUCTS ===== */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-off-white">
          <div className="container-custom">
            <h2 className="text-2xl font-heading font-bold text-charcoal mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== STICKY MOBILE CTA ===== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-3 z-50 flex gap-2">
        <div className="flex-1">
          <p className="text-xs text-slate">Giá</p>
          <p className="text-lg font-bold text-forest-deep">{formatPrice(currentPrice)}</p>
        </div>
        <button onClick={handleAddToCart} className="btn-gold !py-2.5 !px-5 !text-sm">
          Thêm vào giỏ
        </button>
        <Link href="/gio-hang" onClick={handleAddToCart} className="btn-primary !py-2.5 !px-5 !text-sm">
          Mua ngay
        </Link>
      </div>
    </>
  );
}
