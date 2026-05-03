'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Trang Chủ' },
    { href: '/san-pham', label: 'Sản Phẩm' },
    { href: '/gioi-thieu', label: 'Giới Thiệu' },
    { href: '/blog', label: 'Blog' },
    { href: '/tra-cuu-don-hang', label: 'Tra Cứu' },
  ];

  return (
    <>
      {/* ── Top bar: dark green, white text ── */}
      <div style={{ background: '#1A3328' }}>
        <div className="container-custom flex items-center justify-between py-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <span className="hidden sm:inline tracking-wide">
            🌿 Dược liệu quý từ núi rừng Ngọc Linh — Kon Tum
          </span>
          <div className="flex items-center gap-5 mx-auto sm:mx-0">
            <a href="tel:0901690470" className="hover:text-white transition-colors font-medium" style={{ color: '#DFC09A' }}>
              📞 0901 690 470
            </a>
            <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <a href="mailto:savin.regal@gmail.com" className="hidden sm:inline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
              savin.regal@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isScrolled ? 'rgba(255,255,255,0.97)' : '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        boxShadow: isScrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s, background 0.3s',
      }}>
        <div className="container-custom flex items-center justify-between" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/savin-regal-logo.png"
              alt="Savin Regal"
              style={{ height: '52px', width: '52px', objectFit: 'contain', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-1">
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#1A3328', letterSpacing: '-0.01em' }}>Savin</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 400, color: '#C4956A', letterSpacing: '-0.01em' }}> Regal</span>
              </div>
              <span style={{ fontSize: '9px', letterSpacing: '0.22em', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 500, marginTop: '1px' }}>Dược Liệu Núi Rừng</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 mx-2 lg:mx-4">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-wider rounded-full transition-all duration-200 whitespace-nowrap"
                style={{ color: '#2C4A3E', background: '#F0F7F5', border: '1px solid #C5DDD8', letterSpacing: '0.07em', padding: '0.5rem 1rem' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2C4A3E'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#2C4A3E'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F0F7F5'; (e.currentTarget as HTMLElement).style.color = '#2C4A3E'; (e.currentTarget as HTMLElement).style.borderColor = '#C5DDD8'; }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              className="p-2.5 rounded-full transition-colors"
              style={{ color: '#6B7280' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#111714'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}
              aria-label="Tìm kiếm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full transition-colors"
              style={{ color: '#6B7280' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#111714'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}
              aria-label="Giỏ hàng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-[18px] h-[18px] text-[10px] font-bold text-white rounded-full"
                  style={{ background: '#C4956A' }}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* CTA */}
            <a href="tel:0901690470"
              className="hidden lg:flex items-center gap-2 ml-2 btn-primary !text-[13px] !py-2.5 !px-6 !tracking-widest !uppercase">
              Liên Hệ
            </a>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full transition-colors"
              style={{ color: '#374151' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F3F4F6'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-80' : 'max-h-0'}`}
          style={{ borderTop: isMobileMenuOpen ? '1px solid #E5E7EB' : 'none' }}>
          <nav className="container-custom py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-[13px] font-semibold uppercase tracking-widest rounded-xl transition-colors"
                style={{ color: '#374151' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0F7F5'; (e.currentTarget as HTMLElement).style.color = '#2C4A3E'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
              >
                {link.label}
              </Link>
            ))}
            <a href="tel:0901690470" className="btn-primary mt-3 text-center !text-sm">
              📞 Gọi Tư Vấn: 0901 690 470
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
