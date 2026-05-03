import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* ── CTA Banner ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C4A3E 0%, #3D6B5A 40%, #2C4A3E 100%)' }}>
        {/* Subtle leaf pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M20 3 Q23 10 20 17 Q17 10 20 3Z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container-custom relative z-10 text-center" style={{paddingTop:'4rem',paddingBottom:'4.5rem'}}>
          <h3 className="text-2xl md:text-3xl font-heading font-semibold text-white mb-3">
            Cần tư vấn về dược liệu quý?
          </h3>
          <p style={{color:'rgba(255,255,255,0.75)',marginBottom:'2rem',fontSize:'0.9rem',lineHeight:'1.6',maxWidth:'40rem',margin:'0 auto 2rem'}}>
            Đội ngũ chuyên gia của Savin Regal sẵn sàng hỗ trợ bạn chọn sản phẩm phù hợp nhất
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="tel:0901690470" className="btn-accent !py-3 !px-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Gọi Ngay: 0901 690 470
            </a>
            <a href="https://zalo.me/0901690470" target="_blank" rel="noopener noreferrer" className="btn-outline !border-white/30 !text-white hover:!bg-white/10 hover:!border-white/50 !py-3 !px-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Chat Zalo
            </a>
          </div>
        </div>
      </div>
      {/* Thin gold accent line between CTA and footer body */}
      <div style={{height:'2px',background:'linear-gradient(90deg, #2C4A3E 0%, #C4956A 40%, #C4956A 60%, #2C4A3E 100%)'}} />

      {/* ── Main Footer ── */}
      <div style={{background:'#1C1C1C',color:'rgba(255,255,255,0.7)'}}>
        <div className="container-custom py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{background:'#FFFFFF',padding:'2px'}}>
                  <img src="/savin-regal-logo.png" alt="Savin Regal" style={{width:'100%',height:'100%',objectFit:'contain'}} />
                </div>
                <div>
                  <span className="text-xl font-heading font-bold text-white tracking-wide block">
                    Savin<span style={{color:'#C4956A'}}> Regal</span>
                  </span>
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] font-medium">Dược Liệu Núi Rừng</p>
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                Chuyên cung cấp Sâm Ngọc Linh và các sản phẩm dược liệu quý hiếm, chính hãng 100% từ vùng trồng Kon Tum.
              </p>
              <div className="flex gap-2.5">
                {[
                  { name: 'facebook', letter: 'f' },
                  { name: 'youtube', letter: 'y' },
                  { name: 'tiktok', letter: 't' },
                ].map(social => (
                  <a
                    key={social.name}
                    href="#"
                    className="w-8 h-8 rounded-full border border-white/10 hover:border-earth-warm hover:bg-earth-warm/10 flex items-center justify-center transition-all duration-300 text-xs font-semibold text-white/40 hover:text-earth-warm uppercase"
                  >
                    {social.letter}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{color:'#FFFFFF'}}>Sản Phẩm</h4>
              <ul className="space-y-2.5">
                {['Sâm Ngọc Linh Tươi', 'Sâm Ngọc Linh Khô', 'Viên Nang TPCN', 'Rượu Sâm', 'Trà & Mật Ong'].map(item => (
                  <li key={item}>
                    <Link href="/san-pham" className="text-sm text-white/65 hover:text-earth-warm transition-colors duration-200">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{color:'#FFFFFF'}}>Chính Sách</h4>
              <ul className="space-y-2.5">
                {['Chính sách đổi trả', 'Chính sách vận chuyển', 'Chính sách bảo mật', 'Hướng dẫn mua hàng', 'Câu hỏi thường gặp'].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/65 hover:text-earth-warm transition-colors duration-200">
                      {item}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/tra-cuu-don-hang" className="text-sm text-white/65 hover:text-earth-warm transition-colors duration-200">
                    Tra cứu đơn hàng
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{color:'#FFFFFF'}}>Liên Hệ</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-white/65">
                  <svg className="w-4 h-4 mt-0.5 text-silver-mist/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Kon Tum, Việt Nam</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-white/65">
                  <svg className="w-4 h-4 mt-0.5 text-silver-mist/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>Nguyễn Xuân Thiều</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-white/65">
                  <svg className="w-4 h-4 mt-0.5 text-silver-mist/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href="tel:0901690470" className="hover:text-earth-warm transition-colors">0901 690 470</a>
                  <span className="text-white/20 text-xs">(Zalo)</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-white/65">
                  <svg className="w-4 h-4 mt-0.5 text-silver-mist/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href="mailto:savin.regal@gmail.com" className="hover:text-earth-warm transition-colors">savin.regal@gmail.com</a>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-white/65">
                  <svg className="w-4 h-4 mt-0.5 text-silver-mist/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>8:00 - 21:00, Thứ 2 - Chủ Nhật</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-white/[0.06]">
          <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-white/25">
              © 2026 Savin Regal. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs text-white/25">
              <span className="whitespace-nowrap">Chấp nhận thanh toán:</span>
              <div className="flex gap-1.5">
                {['VNPay', 'MoMo', 'COD'].map(method => (
                  <span key={method} className="px-2.5 py-1 bg-white/[0.05] rounded text-[10px] font-medium border border-white/[0.06] whitespace-nowrap">{method}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
