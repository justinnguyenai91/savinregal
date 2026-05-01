import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="page-section-lg section-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 Q36 20 30 32 Q24 20 30 8Z' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.92)', border: '3px solid rgba(196,149,106,0.5)', boxShadow: '0 0 60px rgba(196,149,106,0.25)' }}>
                <img src="/savin-regal-logo.png" alt="Savin Regal" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
              </div>
            </div>
            {/* Text */}
            <div className="space-y-5 text-center lg:text-left">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] inline-block" style={{ color: '#C4956A' }}>Về Chúng Tôi</span>
              <h1 className="text-4xl md:text-5xl font-heading font-bold" style={{ color: '#FFFFFF' }}>Savin Regal</h1>
              <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Hành trình mang <strong style={{ color: '#DFC09A' }}>Quốc Bảo Sâm Ngọc Linh</strong> chính hãng từ đỉnh núi Ngọc Linh, Kon Tum đến mọi gia đình Việt.
              </p>
              {/* Stats */}
              <div className="flex gap-8 pt-2">
                {[
                  { num: '10+', label: 'Năm kinh nghiệm' },
                  { num: '5.000+', label: 'Khách hàng' },
                  { num: '98%', label: 'Hài lòng' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-heading font-bold" style={{ color: '#C4956A' }}>{s.num}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Câu Chuyện ── */}
      <section className="page-section section-warm">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title">Câu Chuyện Của Chúng Tôi</h2>
              <div className="section-divider" />
            </div>
            <div className="space-y-5">
              <p className="leading-relaxed" style={{ color: '#374151', fontSize: '1.05rem' }}>
                Sinh ra và lớn lên tại vùng đất <strong style={{ color: '#2C4A3E' }}>Kon Tum</strong> — nơi Sâm Ngọc Linh được mệnh danh là "Quốc bảo" của Việt Nam, chúng tôi luôn trăn trở khi thấy nhiều người tiêu dùng phải mua phải sâm giả, sâm kém chất lượng với giá cao.
              </p>
              <p className="leading-relaxed" style={{ color: '#374151', fontSize: '1.05rem' }}>
                <strong style={{ color: '#2C4A3E' }}>Savin Regal</strong> ra đời với sứ mệnh trở thành cầu nối đáng tin cậy — đưa Sâm Ngọc Linh chính hãng, có đầy đủ kiểm định nguồn gốc từ vùng trồng đến tay người tiêu dùng trên khắp cả nước.
              </p>
              {/* Contact card */}
              <div className="mt-8 p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E8DDD0' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Liên hệ trực tiếp</p>
                <div className="space-y-2 text-sm" style={{ color: '#374151' }}>
                  <p>👤 <strong>Người phụ trách:</strong> Nguyễn Xuân Thiều</p>
                  <p>📞 <strong>Điện thoại / Zalo:</strong> <a href="tel:0901690470" style={{ color: '#2C4A3E', fontWeight: 700 }}>0901 690 470</a></p>
                  <p>✉️ <strong>Email:</strong> <a href="mailto:savin.regal@gmail.com" style={{ color: '#2C4A3E', fontWeight: 700 }}>savin.regal@gmail.com</a></p>
                  <p>🕐 <strong>Giờ làm việc:</strong> 8:00 – 21:00, Thứ 2 – Chủ Nhật</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Giá Trị Cốt Lõi ── */}
      <section className="page-section section-cream">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Giá Trị Cốt Lõi</h2>
            <div className="section-divider" />
            <p className="section-subtitle max-w-lg mx-auto">Những cam kết bền vững chúng tôi giữ vững suốt hơn 10 năm</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🛡️', title: 'Chính Hãng 100%', desc: 'Toàn bộ sản phẩm đều có giấy tờ kiểm định, chứng nhận nguồn gốc từ vùng trồng Kon Tum. Hoàn tiền gấp 10 lần nếu phát hiện hàng giả.' },
              { icon: '💚', title: 'Tư Vấn Tận Tâm', desc: 'Mỗi khách hàng được tư vấn cá nhân hóa bởi đội ngũ chuyên gia, giúp chọn đúng sản phẩm phù hợp với nhu cầu sức khỏe và ngân sách.' },
              { icon: '🌱', title: 'Phát Triển Bền Vững', desc: 'Hợp tác chặt chẽ với các vùng trồng có chứng nhận GACP-WHO, bảo tồn nguồn gene Sâm Ngọc Linh quý hiếm cho thế hệ tương lai.' },
            ].map((item, i) => (
              <div key={i} className="card-warm text-center hover:-translate-y-2 transition-all duration-300" style={{ padding: '2.5rem 2rem' }}>
                <div className="text-5xl mb-5">{item.icon}</div>
                <h3 className="text-xl font-heading font-bold mb-3" style={{ color: '#111714' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chứng Nhận ── */}
      <section className="page-section section-warm">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-title">Chứng Nhận &amp; Tiêu Chuẩn</h2>
            <div className="section-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Chỉ dẫn Địa lý Kon Tum', icon: '📍', desc: 'Nguồn gốc được bảo hộ' },
              { label: 'Kiểm định ATTP', icon: '🔬', desc: 'An toàn thực phẩm' },
              { label: 'GACP-WHO', icon: '🏥', desc: 'Trồng trọt tốt' },
              { label: 'ISO 22000', icon: '📋', desc: 'Quản lý chất lượng' },
            ].map((cert, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl text-center hover:shadow-md transition-all" style={{ border: '1px solid #E8DDD0' }}>
                <div className="text-4xl mb-3">{cert.icon}</div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#111714' }}>{cert.label}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{cert.desc}</p>
              </div>
            ))}
          </div>
          {/* CTA inline — no duplicate dark section */}
          <div className="mt-14 text-center">
            <p className="mb-5" style={{ color: '#6B7280' }}>Sẵn sàng trải nghiệm sản phẩm chính hãng?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/san-pham" className="btn-primary">🌿 Xem sản phẩm</Link>
              <a href="tel:0901690470" className="btn-outline">📞 0901 690 470</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
