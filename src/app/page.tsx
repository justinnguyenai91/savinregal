'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { testimonials, formatPrice } from '@/lib/data';
import { Product } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(p: any): Product {
  return {
    ...p,
    category: p.category?.name || '',
    categorySlug: p.category?.slug || '',
    originalPrice: p.originalPrice ?? undefined,
    variants: p.variants?.map((v: { id: string; name: string; price: number; originalPrice?: number | null; inStock: boolean }) => ({
      ...v, originalPrice: v.originalPrice ?? undefined,
    })),
  };
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = target / (2000 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}{suffix}</>;
}

interface ApiCategory { id: string; name: string; slug: string; _count: { products: number } }
interface ApiBlogPost { id: string; title: string; slug: string; excerpt: string; category: string; readTime: number; publishedAt: string }

const catIcons = [
  // Sâm Ngọc Linh — leaf/plant
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'1.2rem',height:'1.2rem'}}><path d="M12 22V12"/><path d="M12 12C12 12 7 9 7 4c2.5 0 5 2 5 8z"/><path d="M12 12C12 12 17 9 17 4c-2.5 0-5 2-5 8z"/><path d="M5 22c1-4 4-7 7-10"/></svg>,
  // Thực Phẩm Chức Năng — capsule/pill
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'1.2rem',height:'1.2rem'}}><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/><circle cx="18" cy="18" r="3"/><path d="m22 22-1.5-1.5"/></svg>,
  // Rượu Sâm — bottle/wine
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'1.2rem',height:'1.2rem'}}><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v3"/><path d="M15 2H9l-1 8h8l-1-8z"/><path d="M9 10v5a3 3 0 0 0 6 0v-5"/></svg>,
  // Trà & Mật Ong — cup/tea
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:'1.2rem',height:'1.2rem'}}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>,
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [blogPosts, setBlogPosts] = useState<ApiBlogPost[]>([]);

  useEffect(() => {
    Promise.all([fetch('/api/products?limit=6'), fetch('/api/categories'), fetch('/api/blog?limit=3')])
      .then(([p, c, b]) => Promise.all([p.json(), c.json(), b.json()]))
      .then(([pd, cd, bd]) => {
        const t = (pd.products || []).map(transformProduct);
        setAllProducts(t);
        setFeaturedProducts(t.filter((p: Product) => p.badges.includes('bestseller')).slice(0, 4));
        setCategories(cd || []);
        setBlogPosts(bd.posts || []);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C4A3E 0%, #1e3328 40%, #3A2A1A 100%)' }}>
        {/* Mist orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-10 animate-leaf-float" style={{ background: 'radial-gradient(circle, #5A8F7A, transparent)' }} />
          <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #C4956A, transparent)', animation: 'leafFloat 5s ease-in-out infinite reverse' }} />
        </div>

        {/* Leaf pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 Q36 20 30 32 Q24 20 30 8Z' fill='%23ffffff'/%3E%3C/svg%3E")` }} />

        <div className="container-custom relative z-10 py-24">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div className="space-y-7 animate-mountain-rise" style={{color:'#FFFFFF'}}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.07)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-gentle-pulse" style={{background:'#C4956A'}} />
                <span className="text-[11px] font-medium tracking-[0.2em] uppercase" style={{color:'#DFC09A'}}>Quốc Bảo Việt Nam</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-semibold leading-[1.1]" style={{color:'#FFFFFF'}}>
                Sâm Ngọc Linh<br />
                <span className="text-earth-shimmer">Chính Hãng 100%</span>
              </h1>

              <p className="text-base max-w-lg leading-relaxed" style={{color:'rgba(255,255,255,0.7)'}}>
                Trực tiếp từ vùng trồng Kon Tum — <strong style={{color:'rgba(255,255,255,0.95)'}}>52 loại saponin</strong> nhiều nhất thế giới. Savin Regal cam kết nguyên chất, kiểm định, bảo hành nguồn gốc.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/san-pham" className="btn-accent" style={{padding:'0.9rem 2rem',fontSize:'1rem'}}>Khám Phá Ngay →</Link>
                <a href="tel:0901690470" style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 1.5rem',fontSize:'0.875rem',border:'2px solid rgba(255,255,255,0.3)',borderRadius:'8px',color:'#FFFFFF',fontWeight:600,transition:'background 0.2s'}}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Tư Vấn Miễn Phí
                </a>
              </div>

              <div className="flex flex-wrap gap-5 pt-2 text-xs" style={{color:'rgba(255,255,255,0.75)'}}>
                {['Chỉ dẫn địa lý', 'Kiểm định ATTP', 'Đổi trả 30 ngày'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" style={{color:'#7AB8A4'}}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Ginseng plant image */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative" style={{ width: '340px', height: '460px' }}>

                {/* Soft radial glow behind plant */}
                <div className="absolute inset-0 rounded-full animate-leaf-float" style={{
                  background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(90,143,122,0.18), transparent)',
                  transform: 'scale(1.1)',
                }} />

                {/* Plant image — mix-blend-mode:multiply removes white bg on dark bg */}
                <img
                  src="/sam-ngoc-linh-hero.png"
                  alt="Sâm Ngọc Linh chính hãng"
                  className="animate-leaf-float"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                    filter: 'drop-shadow(0 0 32px rgba(90,180,130,0.35)) drop-shadow(0 8px 24px rgba(0,0,0,0.3)) brightness(1.05) contrast(1.05)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />

                {/* Badge: Rating — top right */}
                <div className="glass absolute top-4 right-0 rounded-2xl shadow-lg animate-fade-in-up"
                  style={{ padding: '0.6rem 1rem', animationDelay: '0.5s', zIndex: 2 }}>
                  <p className="text-xs font-bold" style={{ color: '#111714' }}>⭐ 4.9/5</p>
                  <p className="text-[10px]" style={{ color: '#6B7280' }}>127 đánh giá</p>
                </div>

                {/* Badge: Saponin — bottom left */}
                <div className="glass absolute bottom-8 left-0 rounded-2xl shadow-lg animate-fade-in-up"
                  style={{ padding: '0.6rem 1rem', animationDelay: '0.8s', zIndex: 2 }}>
                  <p className="text-xs font-bold" style={{ color: '#111714' }}>🏔️ 52+ Saponin</p>
                  <p className="text-[10px]" style={{ color: '#6B7280' }}>Nhiều nhất thế giới</p>
                </div>

                {/* Badge: Origin — middle left */}
                <div className="glass absolute top-1/2 -left-4 rounded-2xl shadow-lg animate-fade-in-up"
                  style={{ padding: '0.6rem 1rem', animationDelay: '1.1s', zIndex: 2, transform: 'translateY(-50%)' }}>
                  <p className="text-xs font-bold" style={{ color: '#111714' }}>📍 Kon Tum</p>
                  <p className="text-[10px]" style={{ color: '#6B7280' }}>Vùng chỉ dẫn địa lý</p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto">
            <path fill="#FFFFFF" d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="relative z-20" style={{background:'#FFFFFF',paddingBottom:'0'}}>
        <div className="container-custom">
          <div className="bg-white rounded-3xl grid grid-cols-2 md:grid-cols-4 -mt-12 md:-mt-16 divide-x divide-gray-100"
            style={{boxShadow:'0 8px 40px rgba(44,74,62,0.12)',border:'1px solid #E2EFEC'}}>
            {[
              {
                n: 5000, s: '+', label: 'Khách hàng tin tưởng',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                bg: '#E2EFEC', color: '#2C4A3E',
              },
              {
                n: 10, s: ' năm', label: 'Kinh nghiệm',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
                bg: '#FDF3E7', color: '#C4956A',
              },
              {
                n: 100, s: '%', label: 'Sản phẩm chính hãng',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
                bg: '#E2EFEC', color: '#2C4A3E',
              },
              {
                n: 30, s: ' ngày', label: 'Đổi trả miễn phí',
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
                bg: '#FDF3E7', color: '#C4956A',
              },
            ].map((s, i) => (
              <div key={i} className="text-center flex flex-col items-center" style={{padding:'1.25rem 0.5rem'}}>
                <div className="mb-3 flex items-center justify-center rounded-2xl" style={{width:'3rem',height:'3rem',background:s.bg,color:s.color}}>
                  <span style={{width:'1.4rem',height:'1.4rem',display:'flex'}}>{s.icon}</span>
                </div>
                <div className="text-xl md:text-2xl lg:text-3xl font-heading font-bold" style={{color:'#2C4A3E'}}>
                  <AnimatedCounter target={s.n} suffix={s.s} />
                </div>
                <p className="text-xs md:text-sm mt-1.5 leading-tight" style={{color:'#374151'}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{background:'#FAF6EF',paddingTop:'5rem',paddingBottom:'5rem'}}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{color:'#111714'}}>Danh Mục Sản Phẩm</h2>
            <div className="section-divider" />
            <p className="mt-4" style={{color:'#6B7280',fontSize:'0.9375rem'}}>Đa dạng sản phẩm từ Sâm Ngọc Linh, phục vụ mọi nhu cầu chăm sóc sức khỏe</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => {
              const cardStyles = [
                {
                  // Sâm Ngọc Linh — lá xanh rừng tự nhiên
                  photo: '/cat-sam-ngoc-linh.jpg',
                  overlay: 'linear-gradient(to top, rgba(15,40,25,0.88) 0%, rgba(15,40,25,0.3) 60%, transparent 100%)',
                },
                {
                  // Thực Phẩm Chức Năng — trái cây/viên nang nền trắng sáng
                  photo: '/cat-tpcn.jpg',
                  overlay: 'linear-gradient(to top, rgba(20,50,80,0.9) 0%, rgba(20,50,80,0.45) 55%, rgba(0,0,0,0.15) 100%)',
                },
                {
                  // Rượu Sâm — nền trắng/vàng gold
                  photo: '/cat-ruou-sam.jpg',
                  overlay: 'linear-gradient(to top, rgba(60,25,0,0.92) 0%, rgba(60,25,0,0.5) 55%, rgba(0,0,0,0.2) 100%)',
                },
                {
                  // Trà Sâm — nền trắng, lọ xanh đậm
                  photo: '/cat-tra-mat-ong.jpg',
                  overlay: 'linear-gradient(to top, rgba(10,35,20,0.92) 0%, rgba(10,35,20,0.5) 55%, rgba(0,0,0,0.2) 100%)',
                },
              ];
              const cs = cardStyles[i] || cardStyles[0];
              return (
                <Link key={cat.id} href={`/san-pham?category=${cat.slug}`}
                  className={`group relative overflow-hidden rounded-2xl flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 cat-card-${i}`}
                  style={{ minHeight: '220px' }}
                >
                  {/* Real photo background */}
                  <div className={`absolute inset-0 cat-photo-${i}`} style={{
                    backgroundImage: `url("${cs.photo}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'transform 0.6s ease',
                  }} />
                  {/* Zoom on hover */}
                  <style>{`
                    .cat-card-${i}:hover .cat-photo-${i} { transform: scale(1.08); }
                  `}</style>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: cs.overlay }} />
                  {/* Icon pill — frosted top-left */}
                  <div className="absolute top-4 left-4 rounded-xl flex items-center justify-center z-10"
                    style={{ width:'2.5rem', height:'2.5rem', background:'rgba(255,255,255,0.18)', backdropFilter:'blur(6px)', color:'#FFFFFF' }}>
                    {catIcons[i] || catIcons[0]}
                  </div>
                  {/* Content bottom */}
                  <div className="relative z-10 mt-auto" style={{ padding: '1.25rem', paddingTop: '4rem' }}>
                    <h3 className="font-heading font-bold text-base leading-tight drop-shadow-md" style={{ color: '#FFFFFF' }}>{cat.name}</h3>
                    <p className="text-xs mt-1 drop-shadow" style={{ color: 'rgba(255,255,255,0.75)' }}>{cat._count.products} sản phẩm</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold mt-3 group-hover:gap-2 transition-all drop-shadow" style={{ color: '#FFD580' }}>
                      Xem thêm <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{background:'#FFFDF8',paddingTop:'5rem',paddingBottom:'5rem'}}>
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{color:'#111714'}}>Sản Phẩm Bán Chạy</h2>
            <div className="section-divider" />
            <p className="mt-4" style={{color:'#6B7280'}}>Được hàng nghìn khách hàng tin tưởng lựa chọn</p>
          </div>
          <div className="flex justify-end mb-6">
            <Link href="/san-pham" className="btn-outline" style={{padding:'0.5rem 1.5rem',fontSize:'0.875rem'}}>Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{background:'#F2EBE0',paddingTop:'5rem',paddingBottom:'5rem'}}>
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{color:'#111714'}}>Tại Sao Chọn Savin Regal?</h2>
            <div className="section-divider" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🛡️', title: 'Cam Kết Chính Hãng 100%', desc: 'Mỗi sản phẩm đều có tem chống giả, QR truy xuất nguồn gốc và giấy kiểm định ATTP. Hoàn tiền gấp 10 lần nếu phát hiện hàng giả.' },
              { icon: '👨‍⚕️', title: 'Tư Vấn Chuyên Gia', desc: 'Đội ngũ chuyên gia tư vấn miễn phí 24/7, hướng dẫn chi tiết cách sử dụng phù hợp với tình trạng sức khỏe của bạn.' },
              { icon: '🚚', title: 'Giao Hàng & Đổi Trả', desc: 'Miễn phí vận chuyển toàn quốc cho đơn từ 2 triệu. Đổi trả trong 30 ngày nếu không hài lòng, không cần lý do.' },
            ].map((item, i) => (
              <div key={i} className="group text-center p-10 rounded-3xl bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2" style={{border:'1px solid #E2EFEC'}}>
                <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="font-heading font-bold text-xl mb-4" style={{color:'#111714'}}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{color:'#6B7280'}}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ── */}
      <section style={{paddingTop:'5rem',paddingBottom:'5rem',position:'relative',overflow:'hidden',background:'linear-gradient(135deg, #2C4A3E 0%, #1e3328 60%, #3A2A1A 100%)'}}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 Q36 20 30 32 Q24 20 30 8Z' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="flex justify-center">
              <div className="w-72 h-72 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.92)', border: '3px solid rgba(196,149,106,0.5)', boxShadow: '0 0 40px rgba(196,149,106,0.2)' }}>
                <img
                  src="/savin-regal-logo.png"
                  alt="Savin Regal Logo"
                  style={{ width: '88%', height: '88%', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div className="space-y-5" style={{color:'#FFFFFF'}}>
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{color:'#C4956A'}}>Câu Chuyện Thương Hiệu</span>
              <h2 className="text-3xl md:text-4xl font-heading font-semibold leading-snug" style={{color:'#FFFFFF'}}>
                Hành Trình Mang<br />
                <span style={{color:'#DFC09A'}}>Quốc Bảo</span> Đến Mọi Nhà
              </h2>
              <p className="leading-relaxed" style={{color:'rgba(255,255,255,0.82)'}}>Với hơn 10 năm kinh nghiệm trong lĩnh vực dược liệu quý, Savin Regal tự hào là cầu nối đưa Sâm Ngọc Linh chính hãng từ đỉnh núi Ngọc Linh đến tay người tiêu dùng trên khắp cả nước.</p>
              <p className="leading-relaxed" style={{color:'rgba(255,255,255,0.82)'}}>Mỗi sản phẩm đều được chọn lọc kỹ càng, có đầy đủ chứng nhận nguồn gốc và kiểm định chất lượng. Liên hệ: <a href="tel:0901690470" style={{color:'#C4956A',fontWeight:600}}>0901 690 470</a></p>
              <Link href="/gioi-thieu" className="btn-accent inline-flex">Tìm hiểu thêm →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALL PRODUCTS ── */}
      <section style={{background:'#FAF6EF',paddingTop:'5rem',paddingBottom:'5rem'}}>
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{color:'#111714'}}>Tất Cả Sản Phẩm</h2>
            <div className="section-divider" />
            <p className="mt-5" style={{color:'#6B7280'}}>Khám phá bộ sưu tập dược liệu cao cấp</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {allProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-12">
            <Link href="/san-pham" className="btn-primary" style={{padding:'0.8rem 3rem'}}>Xem thêm sản phẩm →</Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{background:'#FFFDF8',paddingTop:'5rem',paddingBottom:'5rem'}}>
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{color:'#111714'}}>Khách Hàng Nói Gì?</h2>
            <div className="section-divider" />
            <p className="mt-5" style={{color:'#6B7280'}}>Hơn 5.000 khách hàng đã tin tưởng lựa chọn Savin Regal</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map(item => (
              <div key={item.id} className="group p-7 rounded-2xl bg-white hover:shadow-lg transition-all duration-300" style={{border:'1px solid #E5E7EB'}}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="#C4956A" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 line-clamp-4" style={{color:'#374151'}}>&ldquo;{item.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{background:'#E2EFEC',color:'#2C4A3E'}}>
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{color:'#111714'}}>{item.name}</p>
                    <p className="text-xs" style={{color:'#6B7280'}}>{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section style={{background:'#FAF6EF',paddingTop:'5rem',paddingBottom:'5rem'}}>
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold" style={{color:'#111714'}}>Blog Sức Khỏe</h2>
              <div className="section-divider !mx-0 mt-3" />
              <p className="mt-2" style={{color:'#6B7280'}}>Kiến thức hữu ích về sâm Ngọc Linh và chăm sóc sức khỏe</p>
            </div>
            <Link href="/blog" className="btn-outline self-start md:self-auto" style={{padding:'0.5rem 1.5rem',fontSize:'0.875rem'}}>Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map(post => (
              <article key={post.id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{border:'1px solid #E8DDD0'}}>
                {/* Thumbnail — matches blog page */}
                <div className="aspect-video flex items-center justify-center overflow-hidden" style={{background:'#FAF6EF'}}>
                  <img src="/placeholder.png" alt={post.title} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </div>
                <div style={{padding:'1.25rem'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{color:'#4E7D6A'}}>{post.category}</span>
                    <span className="text-[10px]" style={{color:'#9CA3AF'}}>• {post.readTime} phút đọc</span>
                  </div>
                  <h3 className="font-heading font-bold mb-2 line-clamp-2" style={{color:'#111714',fontSize:'1rem'}}>{post.title}</h3>
                  <p className="text-sm line-clamp-3 mb-4" style={{color:'#6B7280'}}>{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{color:'#9CA3AF'}}>{post.publishedAt}</span>
                    <Link href={`/blog/${post.slug}`} className="text-sm font-semibold" style={{color:'#2C4A3E'}}>Đọc thêm →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
