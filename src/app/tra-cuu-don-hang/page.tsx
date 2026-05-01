'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/data';

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<{
    orderNumber: string; guestName: string; guestPhone: string; guestEmail: string | null;
    guestAddress: string; status: string; paymentMethod: string; paymentStatus: string;
    subtotal: number; shippingFee: number; discount: number; total: number;
    trackingNumber: string | null; shippingProvider: string | null; note: string | null;
    createdAt: string;
    items: { product: { name: string }; variant: { name: string } | null; quantity: number; unitPrice: number; totalPrice: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipping', 'delivered'];
  const statusLabels: Record<string, { label: string; icon: string }> = {
    pending: { label: 'Chờ xác nhận', icon: '⏳' },
    confirmed: { label: 'Đã xác nhận', icon: '✅' },
    processing: { label: 'Đang xử lý', icon: '⚙️' },
    shipping: { label: 'Đang giao', icon: '🚚' },
    delivered: { label: 'Đã giao', icon: '📦' },
    cancelled: { label: 'Đã hủy', icon: '❌' },
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await fetch(`/api/orders/${orderNumber.trim()}`);
      if (res.ok) setOrder(await res.json());
      else setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.');
    } catch { setError('Lỗi kết nối. Vui lòng thử lại.'); }
    setLoading(false);
  };

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <>
      <section className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C4A3E, #3A2A1A)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 Q36 20 30 32 Q24 20 30 8Z' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
        <div className="container-custom text-center relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] inline-block mb-3" style={{color:'#C4956A'}}>Theo Dõi Đơn Hàng</span>
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2" style={{color:'#FFFFFF'}}>Tra Cứu Đơn Hàng</h1>
          <p className="text-sm" style={{color:'rgba(255,255,255,0.75)',maxWidth:'30rem',margin:'0 auto',textAlign:'center'}}>Nhập mã đơn hàng để kiểm tra trạng thái giao hàng và thanh toán</p>
        </div>
      </section>

      <section style={{paddingTop:'2.5rem',paddingBottom:'5rem',background:'#FAF6EF'}}>
        <div className="container-custom max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 border border-fog shadow-sm mb-8">
            <div className="flex gap-3">
              <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="Nhập mã đơn hàng (VD: HMMOJZ7SK5)"
                className="flex-1 px-4 py-3 rounded-xl border border-silver-light text-sm font-mono focus:ring-2 focus:ring-mountain-light/30 focus:border-mountain-light transition-all"
              />
              <button type="submit" disabled={loading || !orderNumber.trim()} className="btn-primary !py-3 !px-6 disabled:opacity-50">
                {loading ? '...' : 'Tra cứu'}
              </button>
            </div>
            {error && <p className="text-sm text-danger mt-3">{error}</p>}
          </form>

          {order && (
            <div className="space-y-5">
              {/* Status timeline */}
              <div className="bg-white rounded-2xl p-6 border border-fog shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading font-bold text-bark">
                    Đơn hàng <span className="font-mono text-mountain-deep">#{order.orderNumber}</span>
                  </h3>
                  <span className="text-xs text-silver-dark">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {order.status === 'cancelled' ? (
                  <div className="text-center py-6">
                    <p className="text-lg font-semibold text-danger">❌ Đơn hàng đã bị hủy</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    {statusSteps.map((status, i) => {
                      const info = statusLabels[status];
                      const isCompleted = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      return (
                        <div key={status} className="flex-1 flex flex-col items-center relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${isCurrent ? 'bg-mountain-deep text-white shadow-md scale-110' : isCompleted ? 'bg-mountain-pale/20 text-mountain-deep' : 'bg-fog text-silver-dark'}`}>
                            {info.icon}
                          </div>
                          <p className={`text-[10px] mt-2 text-center font-medium ${isCompleted ? 'text-mountain-deep' : 'text-silver-dark'}`}>{info.label}</p>
                          {i < statusSteps.length - 1 && (
                            <div className={`absolute top-5 left-[55%] w-full h-0.5 ${i < currentStepIndex ? 'bg-mountain-light' : 'bg-silver-light'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="bg-white rounded-2xl p-6 border border-fog shadow-sm">
                <h3 className="font-semibold text-bark mb-4">Sản phẩm đã đặt</h3>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-fog last:border-0">
                      <div>
                        <p className="text-sm font-medium text-bark">{item.product.name}</p>
                        {item.variant && <p className="text-xs text-silver-dark">{item.variant.name}</p>}
                        <p className="text-xs text-silver-dark">SL: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                      </div>
                      <p className="text-sm font-semibold text-earth-deep">{formatPrice(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-fog pt-3 mt-3 space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="text-silver-dark">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-silver-dark">Phí vận chuyển</span><span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-sm text-success"><span>Giảm giá</span><span>-{formatPrice(order.discount)}</span></div>}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-fog"><span>Tổng cộng</span><span className="text-mountain-deep">{formatPrice(order.total)}</span></div>
                </div>
              </div>

              {/* Shipping info */}
              <div className="bg-white rounded-2xl p-6 border border-fog shadow-sm">
                <h3 className="font-semibold text-bark mb-3">Thông tin giao hàng</h3>
                <div className="space-y-1.5 text-sm text-silver-dark">
                  <p><strong className="text-bark">Người nhận:</strong> {order.guestName}</p>
                  <p><strong className="text-bark">SĐT:</strong> {order.guestPhone}</p>
                  {order.guestEmail && <p><strong className="text-bark">Email:</strong> {order.guestEmail}</p>}
                  <p><strong className="text-bark">Địa chỉ:</strong> {order.guestAddress}</p>
                  {order.note && <p className="italic">Ghi chú: {order.note}</p>}
                </div>
              </div>
            </div>
          )}

          {!order && !loading && !error && (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-fog flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-silver-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-silver-dark text-sm">Nhập mã đơn hàng phía trên để tra cứu</p>
              <Link href="/san-pham" className="text-sm text-mountain-deep hover:underline mt-2 inline-block">← Quay lại mua sắm</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
