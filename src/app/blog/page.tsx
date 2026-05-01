import React from 'react';
import Link from 'next/link';
import { blogPosts } from '@/lib/data';

export default function BlogPage() {
  return (
    <>
      {/* Header */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C4A3E 0%, #1e3328 60%, #3A2A1A 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 Q36 20 30 32 Q24 20 30 8Z' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
        <div className="container-custom relative z-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 inline-block" style={{color:'#C4956A'}}>Kiến Thức Sức Khỏe</span>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3" style={{color:'#FFFFFF'}}>Blog Sức Khỏe</h1>
          <p style={{color:'rgba(255,255,255,0.8)',textAlign:'center',whiteSpace:'nowrap'}}>Kiến thức hữu ích về Sâm Ngọc Linh, thực phẩm chức năng và chăm sóc sức khỏe</p>
        </div>
      </section>

      <section style={{paddingTop:'3rem',paddingBottom:'5rem',background:'#FAF6EF'}}>
        <div className="container-custom">
          {/* Featured */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-fog mb-10 group">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video md:aspect-auto min-h-[240px] flex items-center justify-center overflow-hidden" style={{background:'#FAF6EF'}}>
                <img src="/placeholder.png" alt="Featured Blog" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-[10px] font-semibold text-mountain-light uppercase tracking-[0.15em] mb-3">{blogPosts[0].category}</span>
                <h2 className="text-2xl font-heading font-bold text-bark mt-1 mb-3 group-hover:text-mountain-deep transition-colors leading-snug">
                  {blogPosts[0].title}
                </h2>
                <p className="text-sm text-silver-dark leading-relaxed mb-5">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-silver-dark mb-6">
                  <span>{blogPosts[0].publishedAt}</span>
                  <span className="w-1 h-1 rounded-full bg-silver-light" />
                  <span>{blogPosts[0].readTime} phút đọc</span>
                </div>
                <Link href={`/blog/${blogPosts[0].slug}`} className="btn-primary self-start !text-sm">Đọc bài viết →</Link>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map(post => (
              <article key={post.id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{border:'1px solid #E8DDD0'}}>
                <div className="aspect-video flex items-center justify-center overflow-hidden" style={{background:'#FAF6EF'}}>
                  <img src="/placeholder.png" alt={post.title} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </div>
                <div style={{padding:'1.25rem'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{color:'#4E7D6A'}}>{post.category}</span>
                    <span className="text-[10px]" style={{color:'#9CA3AF'}}>• {post.readTime} phút</span>
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
