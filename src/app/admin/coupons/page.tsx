'use client';

import { useEffect, useState } from 'react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minOrderAmount: '',
    usageLimit: '',
    expiresAt: '',
  });

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons');
    const data = await res.json();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', maxDiscount: '', minOrderAmount: '', usageLimit: '', expiresAt: '' });
        fetchCoupons();
      }
    } catch (err) {
      console.error('Create coupon error:', err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: '#2C4A3E', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>Mã Giảm Giá</h1>
          <p className="text-sm mt-1" style={{color:'#6B7280'}}>{coupons.length} mã</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#2C4A3E' }}
        >
          {showForm ? '✕ Đóng' : '➕ Tạo mã mới'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-section space-y-4">
          <h3 className="font-semibold mb-2" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>Tạo Mã Giảm Giá Mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Mã giảm giá *</label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2" style={{border:'1px solid #E8DDD0'}}
                placeholder="VD: GIAM20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Mô tả</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2" style={{border:'1px solid #E8DDD0'}}
                placeholder="Giảm 20% cho đơn đầu tiên"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Loại giảm giá *</label>
              <select
                value={form.discountType}
                onChange={e => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2" style={{border:'1px solid #E8DDD0'}}
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>
                Giá trị giảm * {form.discountType === 'percentage' ? '(%)' : '(₫)'}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={e => setForm({ ...form, discountValue: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2" style={{border:'1px solid #E8DDD0'}}
                placeholder={form.discountType === 'percentage' ? '20' : '100000'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Giảm tối đa (₫)</label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2" style={{border:'1px solid #E8DDD0'}}
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Đơn hàng tối thiểu (₫)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2" style={{border:'1px solid #E8DDD0'}}
                placeholder="1000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Giới hạn lượt dùng</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2" style={{border:'1px solid #E8DDD0'}}
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{color:'#374151'}}>Ngày hết hạn</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2" style={{border:'1px solid #E8DDD0'}}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm transition-colors" style={{color:'#6B7280'}}>
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: '#C4956A' }}
            >
              {saving ? 'Đang tạo...' : 'Tạo Mã'}
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="admin-section" style={{padding:0,overflow:'hidden'}}>
        {coupons.length > 0 ? (
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="text-left">Mã</th>
                <th className="text-left">Mô tả</th>
                <th className="text-left">Giảm giá</th>
                <th className="text-center">Đã dùng</th>
                <th className="text-center">Hết hạn</th>
                <th className="text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => {
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                const isUsedUp = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
                return (
                  <tr key={coupon.id}>
                    <td>
                      <span className="font-mono text-sm font-bold px-2 py-1 rounded" style={{ backgroundColor: '#FAF6EF', color: '#2C4A3E' }}>
                        {coupon.code}
                      </span>
                    </td>
                    <td style={{color:'#6B7280',fontSize:'0.875rem'}}>{coupon.description || '—'}</td>
                    <td>
                      <span className="text-sm font-semibold" style={{ color: '#C4956A' }}>
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%${coupon.maxDiscount ? ` (tối đa ${formatCurrency(coupon.maxDiscount)})` : ''}`
                        : formatCurrency(coupon.discountValue)
                      }
                      </span>
                      {coupon.minOrderAmount && (
                        <span className="block text-xs font-normal" style={{color:'#9CA3AF'}}>
                          Đơn tối thiểu: {formatCurrency(coupon.minOrderAmount)}
                        </span>
                      )}
                    </td>
                    <td style={{textAlign:'center',fontSize:'0.875rem'}}>
                      {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                    </td>
                    <td style={{textAlign:'center',fontSize:'0.75rem',color:'#9CA3AF'}}>
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString('vi-VN')
                        : 'Không giới hạn'}
                    </td>
                    <td style={{textAlign:'center'}}>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={{
                        background: !coupon.isActive || isExpired || isUsedUp ? '#FEE2E2' : '#DCFCE7',
                        color: !coupon.isActive || isExpired || isUsedUp ? '#DC2626' : '#16A34A'
                      }}>
                        {!coupon.isActive ? 'Tắt' : isExpired ? 'Hết hạn' : isUsedUp ? 'Hết lượt' : 'Hoạt động'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🏷️</p>
            <p style={{color:'#9CA3AF'}}>Chưa có mã giảm giá nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-medium hover:underline"
              style={{ color: '#2C4A3E' }}
            >
              Tạo mã giảm giá đầu tiên →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
