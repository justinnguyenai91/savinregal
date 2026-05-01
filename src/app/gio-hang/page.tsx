'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/data';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; total: number } | null>(null);
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
  const [paymentInfo, setPaymentInfo] = useState<Record<string, string>>({});

  // Shipping form state
  const [shipping, setShipping] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: '',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState('');

  const freeThreshold = parseInt(paymentInfo['shipping.freeThreshold'] || '2000000');
  const defaultShipFee = parseInt(paymentInfo['shipping.defaultFee'] || '30000');
  const shippingFee = totalPrice >= freeThreshold ? 0 : defaultShipFee;
  const grandTotal = totalPrice + shippingFee - couponDiscount;

  // Fetch settings for shipping + payment info
  React.useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => setPaymentInfo(data))
      .catch(() => {});
  }, []);

  const validateCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: totalPrice }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data.discount);
        setCouponApplied(couponCode);
      } else {
        setCouponError(data.error);
        setCouponDiscount(0);
        setCouponApplied('');
      }
    } catch {
      setCouponError('Lỗi kiểm tra mã giảm giá');
    }
  };

  const handleSubmitOrder = async () => {
    if (!shipping.name || !shipping.phone || !shipping.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      setStep('shipping');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            variantId: item.variant?.id,
            quantity: item.quantity,
          })),
          customer: shipping,
          paymentMethod,
          note: shipping.note,
          couponCode: couponApplied || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOrderResult({ orderNumber: data.order.orderNumber, total: data.order.total });
        setStep('success');
        clearCart();
      } else {
        alert(data.error || 'Đặt hàng thất bại');
      }
    } catch {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    }
    setSubmitting(false);
  };

  // Success page
  if (step === 'success' && orderResult) {
    return (
      <>
        <section className="section-dark relative overflow-hidden" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem'}}>
          <div className="container-custom text-center">
            <h1 className="text-2xl md:text-3xl font-heading font-bold" style={{color:'#FFFFFF'}}>Đặt Hàng Thành Công!</h1>
          </div>
        </section>
        <section style={{paddingTop:'4rem',paddingBottom:'5rem',background:'#FAF6EF'}}>
          <div className="container-custom max-w-lg mx-auto text-center">
            <div className="bg-white rounded-2xl p-8" style={{boxShadow:'0 4px 24px rgba(44,74,62,0.10)',border:'1px solid #E8DDD0'}}>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-heading font-bold mb-2" style={{color:'#2C4A3E'}}>Cảm ơn bạn!</h2>
              <p className="mb-6" style={{color:'#6B7280'}}>Đơn hàng của bạn đã được tạo thành công.</p>

              <div className="rounded-xl p-5 mb-6 text-left space-y-3" style={{background:'#FAF6EF',border:'1px solid #E8DDD0'}}>
                <div className="flex justify-between">
                  <span className="text-sm" style={{color:'#6B7280'}}>Mã đơn hàng</span>
                  <span className="font-mono font-bold" style={{color:'#2C4A3E'}}>#{orderResult.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{color:'#6B7280'}}>Tổng tiền</span>
                  <span className="font-bold" style={{color:'#C4956A'}}>{formatPrice(orderResult.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate">Thanh toán</span>
                  <span className="text-sm font-medium">{paymentMethod === 'cod' ? 'COD (khi nhận hàng)' : paymentMethod.toUpperCase()}</span>
                </div>
              </div>

              <p className="text-xs text-slate mb-6">
                Chúng tôi sẽ liên hệ để xác nhận đơn hàng qua số điện thoại bạn cung cấp.
              </p>

              <div className="flex gap-3 justify-center">
                <Link href="/tra-cuu-don-hang" className="btn-outline">
                  📋 Tra cứu đơn hàng
                </Link>
                <Link href="/san-pham" className="btn-primary">
                  🌿 Tiếp tục mua
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{background:'#FAF6EF'}}>
        <div className="text-center">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-heading font-bold mb-2" style={{color:'#111714'}}>Giỏ hàng trống</h2>
          <p className="mb-6" style={{color:'#6B7280'}}>Hãy khám phá và thêm sản phẩm vào giỏ hàng</p>
          <Link href="/san-pham" className="btn-primary">
            🌿 Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="section-dark" style={{paddingTop:'2.5rem',paddingBottom:'2.5rem'}}>
        <div className="container-custom text-center">
          <h1 className="text-2xl md:text-3xl font-heading font-bold" style={{color:'#FFFFFF'}}>Giỏ Hàng &amp; Thanh Toán</h1>
        </div>
      </section>

      <section style={{paddingTop:'2rem',paddingBottom:'5rem',background:'#FAF6EF'}}>
        <div className="container-custom">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['Giỏ hàng', 'Giao hàng', 'Thanh toán'].map((label, i) => {
              const stepKeys = ['cart', 'shipping', 'payment'] as const;
              const isActive = stepKeys.indexOf(step as typeof stepKeys[number]) >= i;
              return (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-2`} style={{color: isActive ? '#2C4A3E' : 'rgba(107,114,128,0.5)'}}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}
                      style={{ background: isActive ? '#2C4A3E' : '#E5E7EB', color: isActive ? '#FFFFFF' : '#6B7280' }}>{i + 1}</span>
                    <span className="text-sm font-medium hidden sm:inline">{label}</span>
                  </div>
                  {i < 2 && <div className={`w-12 h-0.5`} style={{background: isActive ? '#2C4A3E' : '#E5E7EB'}} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {step === 'cart' && (
                <>
                  {items.map((item, index) => {
                    const price = item.variant?.price ?? item.product.price;
                    return (
                      <div key={`${item.product.id}-${item.variant?.id ?? index}`} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
                        <div className="w-20 h-20 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{background:'#FAF6EF',border:'1px solid #E8DDD0'}}>
                          <img src="/placeholder.png" alt={item.product.name} style={{width:'80%',height:'80%',objectFit:'contain'}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/san-pham/${item.product.slug}`} className="text-sm font-semibold text-charcoal hover:text-forest-deep transition-colors line-clamp-1">
                            {item.product.name}
                          </Link>
                          {item.variant && <p className="text-xs text-slate mt-0.5">{item.variant.name}</p>}
                          <p className="text-base font-bold text-forest-deep mt-1">{formatPrice(price)}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)} className="w-9 h-9 flex items-center justify-center text-base hover:bg-gray-50 transition-colors">−</button>
                              <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold border-x border-gray-200">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)} className="w-9 h-9 flex items-center justify-center text-base hover:bg-gray-50 transition-colors">+</button>
                            </div>
                            <span className="text-sm font-semibold text-charcoal">{formatPrice(price * item.quantity)}</span>
                            <button onClick={() => removeItem(item.product.id, item.variant?.id)} className="ml-auto text-xs px-2 py-1 rounded-md text-danger/60 hover:text-danger hover:bg-red-50 transition-colors">Xóa</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center pt-2">
                    <button onClick={clearCart} className="text-sm text-danger/60 hover:text-danger transition-colors">Xóa tất cả</button>
                    <button onClick={() => setStep('shipping')} className="btn-primary">Tiếp tục →</button>
                  </div>
                </>
              )}

              {step === 'shipping' && (
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-heading font-bold text-charcoal">Thông tin giao hàng</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-charcoal mb-1 block">Họ tên *</label>
                      <input
                        type="text"
                        value={shipping.name}
                        onChange={e => setShipping({ ...shipping, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal mb-1 block">Số điện thoại *</label>
                      <input
                        type="tel"
                        value={shipping.phone}
                        onChange={e => setShipping({ ...shipping, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30"
                        placeholder="0912 345 678"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal mb-1 block">Email</label>
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={e => setShipping({ ...shipping, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-charcoal mb-1 block">Tỉnh/TP *</label>
                      <input
                        type="text"
                        value={shipping.province}
                        onChange={e => setShipping({ ...shipping, province: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30"
                        placeholder="TP. Hồ Chí Minh"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal mb-1 block">Quận/Huyện</label>
                      <input
                        type="text"
                        value={shipping.district}
                        onChange={e => setShipping({ ...shipping, district: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30"
                        placeholder="Quận 1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal mb-1 block">Phường/Xã</label>
                      <input
                        type="text"
                        value={shipping.ward}
                        onChange={e => setShipping({ ...shipping, ward: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30"
                        placeholder="Phường Bến Nghé"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal mb-1 block">Địa chỉ chi tiết *</label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={e => setShipping({ ...shipping, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30"
                      placeholder="Số nhà, tên đường..."
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal mb-1 block">Ghi chú</label>
                    <textarea
                      value={shipping.note}
                      onChange={e => setShipping({ ...shipping, note: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30 resize-none"
                      rows={3}
                      placeholder="Ghi chú cho đơn hàng..."
                    />
                  </div>
                  <div className="flex justify-between pt-4">
                    <button onClick={() => setStep('cart')} className="btn-outline !text-sm">← Quay lại</button>
                    <button
                      onClick={() => {
                        const errors: Record<string, string> = {};
                        if (!shipping.name.trim()) errors.name = 'Vui lòng nhập họ tên';
                        if (!shipping.phone.trim()) errors.phone = 'Vui lòng nhập SĐT';
                        if (!shipping.address.trim()) errors.address = 'Vui lòng nhập địa chỉ';
                        setShippingErrors(errors);
                        if (Object.keys(errors).length > 0) return;
                        setStep('payment');
                      }}
                      className="btn-primary"
                    >
                      Tiếp tục →
                    </button>
                  </div>
                  {Object.keys(shippingErrors).length > 0 && (
                    <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      {Object.values(shippingErrors).map((e, i) => <p key={i}>⚠️ {e}</p>)}
                    </div>
                  )}
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-heading font-bold text-charcoal">Phương thức thanh toán</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: '📦', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
                      { id: 'transfer', label: 'Chuyển khoản ngân hàng', icon: '🏦', desc: 'Chuyển khoản qua tài khoản ngân hàng' },
                      { id: 'vnpay', label: 'VNPay (Thẻ / QR Code)', icon: '💳', desc: 'Thanh toán qua thẻ ATM, Visa, MasterCard' },
                      { id: 'momo', label: 'MoMo', icon: '📱', desc: 'Thanh toán qua ví điện tử MoMo' },
                    ].map(method => (
                      <label
                        key={method.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-forest-deep bg-forest-mist/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="mt-1 accent-forest-deep"
                        />
                        <div>
                          <span className="text-sm font-semibold text-charcoal">{method.icon} {method.label}</span>
                          <p className="text-xs text-slate mt-0.5">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Payment details */}
                  {paymentMethod === 'transfer' && (
                    <div className="rounded-xl p-4" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: '#1E40AF' }}>🏦 Thông tin chuyển khoản</h4>
                      <div className="space-y-1.5 text-sm" style={{ color: '#374151' }}>
                        <p><strong>Ngân hàng:</strong> {paymentInfo['payment.bankName'] || 'Vietcombank'}</p>
                        <p><strong>Số TK:</strong> {paymentInfo['payment.bankAccount'] || '(Chưa cấu hình trong Cài đặt)'}</p>
                        <p><strong>Chủ TK:</strong> {paymentInfo['payment.bankHolder'] || '(Chưa cấu hình trong Cài đặt)'}</p>
                        <p className="text-xs italic mt-2" style={{ color: '#6B7280' }}>Nội dung CK: Đơn hàng + SĐT của bạn</p>
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'momo' && (
                    <div className="rounded-xl p-4" style={{ background: '#FDF2F8', border: '1px solid #FBCFE8' }}>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: '#BE185D' }}>📱 Ví MoMo</h4>
                      <div className="space-y-1.5 text-sm" style={{ color: '#374151' }}>
                        <p><strong>Số điện thoại:</strong> {paymentInfo['payment.momoPhone'] || paymentInfo['store.phone'] || '0901 690 470'}</p>
                        <p><strong>Tên:</strong> {paymentInfo['payment.momoName'] || '(Chưa cấu hình trong Cài đặt)'}</p>
                        <p className="text-xs italic mt-2" style={{ color: '#6B7280' }}>Nội dung CK: Đơn hàng + SĐT của bạn</p>
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'vnpay' && (
                    <div className="rounded-xl p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: '#166534' }}>💳 VNPay</h4>
                      <p className="text-sm" style={{ color: '#374151' }}>Sau khi đặt hàng, bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất.</p>
                    </div>
                  )}

                  {/* Shipping Summary */}
                  <div className="bg-forest-mist/10 rounded-xl p-4 space-y-1.5">
                    <h4 className="text-sm font-semibold text-forest-deep">📍 Giao đến</h4>
                    <p className="text-sm text-charcoal">{shipping.name} — {shipping.phone}</p>
                    <p className="text-xs text-slate">{shipping.address}, {shipping.ward}, {shipping.district}, {shipping.province}</p>
                    {shipping.note && <p className="text-xs text-slate italic">Ghi chú: {shipping.note}</p>}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button onClick={() => setStep('shipping')} className="btn-outline !text-sm">← Quay lại</button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                      className="btn-gold !text-base !px-8 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                          Đang xử lý...
                        </span>
                      ) : (
                        `✅ Đặt Hàng — ${formatPrice(grandTotal)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="font-heading font-bold text-charcoal mb-4">Tóm tắt đơn hàng</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {items.map((item, index) => (
                    <div key={`summary-${item.product.id}-${item.variant?.id ?? index}`} className="flex justify-between text-sm py-1">
                      <span className="text-charcoal/70 truncate pr-4">{item.product.name} x{item.quantity}</span>
                      <span className="font-medium text-charcoal shrink-0">{formatPrice((item.variant?.price ?? item.product.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-3" style={{ borderColor: '#E8DDD0' }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate">Tạm tính</span>
                    <span className="text-charcoal">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate">Phí vận chuyển</span>
                    <span className={shippingFee === 0 ? 'text-forest-light font-medium' : 'text-charcoal'}>
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá ({couponApplied})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4 mt-4 flex justify-between" style={{ borderColor: '#E8DDD0' }}>
                  <span className="font-semibold text-charcoal">Tổng cộng</span>
                  <span className="text-xl font-bold text-forest-deep">{formatPrice(grandTotal)}</span>
                </div>
                {totalPrice < freeThreshold && (
                  <p className="text-xs mt-4 p-3 rounded-lg" style={{ color: '#92400E', background: 'rgba(196,149,106,0.1)' }}>
                    💡 Mua thêm {formatPrice(freeThreshold - totalPrice)} để được <strong>miễn phí vận chuyển</strong>
                  </p>
                )}
                {/* Coupon */}
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Mã giảm giá"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-light/30"
                    />
                    <button onClick={validateCoupon} className="btn-outline !py-2 !px-4 !text-xs">Áp dụng</button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  {couponApplied && <p className="text-xs text-green-600 mt-1">✅ Áp dụng mã {couponApplied} thành công!</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
