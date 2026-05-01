'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession, SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Sản Phẩm' },
  { href: '/admin/orders', label: 'Đơn Hàng' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/coupons', label: 'Mã Giảm Giá' },
  { href: '/admin/settings', label: 'Cài Đặt' },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [status, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Prevent flashing protected content before redirect
  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6EF' }}>
      {/* ── Top bar: dark green ── */}
      <div style={{ background: '#1A3328' }}>
        <div className="container-custom flex items-center justify-between py-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <span className="hidden sm:inline tracking-wide">
            🛡️ Savin Regal — Quản trị hệ thống
          </span>
          <div className="flex items-center gap-5 mx-auto sm:mx-0">
            <Link href="/" target="_blank" className="hover:text-white transition-colors font-medium" style={{ color: '#DFC09A' }}>
              🌐 Xem trang web
            </Link>
            <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <button
              onClick={handleLogout}
              className="hidden sm:inline hover:text-white transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              🚪 Đăng Xuất
            </button>
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
        <div className="container-custom flex items-center justify-between" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>

          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-3 group">
            <img
              src="/savin-regal-logo.png"
              alt="Savin Regal"
              style={{ height: '44px', width: '44px', objectFit: 'contain', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-1">
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#1A3328', letterSpacing: '-0.01em' }}>Savin</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 400, color: '#C4956A', letterSpacing: '-0.01em' }}> Regal</span>
              </div>
              <span style={{ fontSize: '8px', letterSpacing: '0.22em', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 500, marginTop: '1px' }}>Admin Panel</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2 mx-4">
            {navItems.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className="text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all duration-200"
                  style={isActive
                    ? { color: '#FFFFFF', background: '#2C4A3E', border: '1px solid #2C4A3E', letterSpacing: '0.07em', padding: '0.45rem 1.4rem' }
                    : { color: '#2C4A3E', background: '#F0F7F5', border: '1px solid #C5DDD8', letterSpacing: '0.07em', padding: '0.45rem 1.4rem' }
                  }
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#2C4A3E'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#2C4A3E'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F0F7F5'; (e.currentTarget as HTMLElement).style.color = '#2C4A3E'; (e.currentTarget as HTMLElement).style.borderColor = '#C5DDD8'; } }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#F2EBE0' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#2C4A3E', color: '#C4956A' }}>A</div>
              <span className="text-sm font-medium hidden sm:inline" style={{ color: '#374151' }}>Admin</span>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full transition-colors"
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
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}
          style={{ borderTop: isMobileMenuOpen ? '1px solid #E5E7EB' : 'none' }}>
          <nav className="container-custom py-4 flex flex-col gap-1">
            {navItems.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-[13px] font-semibold uppercase tracking-widest rounded-xl transition-colors"
                  style={isActive
                    ? { color: '#FFFFFF', background: '#2C4A3E' }
                    : { color: '#374151' }
                  }
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#F0F7F5'; (e.currentTarget as HTMLElement).style.color = '#2C4A3E'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#374151'; } }}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t my-2" style={{ borderColor: '#E5E7EB' }} />
            <Link href="/" target="_blank" className="px-4 py-3 text-[13px] font-semibold uppercase tracking-widest rounded-xl" style={{ color: '#374151' }}>
              🌐 Xem Trang Web
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-3 text-[13px] font-semibold uppercase tracking-widest rounded-xl text-left"
              style={{ color: '#DC2626' }}
            >
              🚪 Đăng Xuất
            </button>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="container-custom" style={{ paddingTop: '1.5rem', paddingBottom: '2rem', minHeight: 'calc(100vh - 7rem)' }}>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
