'use client';

import { useEffect, useState } from 'react';

interface SettingsData {
  [key: string]: string;
}

function SettingGroup({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="admin-section">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: '#111714', fontFamily: 'var(--font-heading)' }}>
        <span>{icon}</span> {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function SettingField({ label, value, onChange, type = 'text', placeholder, span2 }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; span2?: boolean;
}) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
          style={{ border: '1px solid #E8DDD0' }}
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ border: '1px solid #E8DDD0' }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: '#2C4A3E', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111714', fontFamily: 'var(--font-heading)' }}>Cài Đặt Hệ Thống</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Quản lý thông tin cửa hàng và cấu hình</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          style={{ backgroundColor: '#2C4A3E' }}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : saved ? (
            <>✅ Đã lưu!</>
          ) : (
            <>💾 Lưu Thay Đổi</>
          )}
        </button>
      </div>

      {/* Store Info */}
      <SettingGroup title="Thông Tin Cửa Hàng" icon="🏪">
        <SettingField label="Tên cửa hàng" value={settings['store.name'] || ''} onChange={v => update('store.name', v)} placeholder="Savin Regal" />
        <SettingField label="Số điện thoại" value={settings['store.phone'] || ''} onChange={v => update('store.phone', v)} placeholder="0901 690 470" />
        <SettingField label="Email" value={settings['store.email'] || ''} onChange={v => update('store.email', v)} type="email" placeholder="savin.regal@gmail.com" />
        <SettingField label="Địa chỉ" value={settings['store.address'] || ''} onChange={v => update('store.address', v)} placeholder="Kon Tum, Việt Nam" />
        <SettingField label="Mô tả ngắn" value={settings['store.description'] || ''} onChange={v => update('store.description', v)} span2 placeholder="Dược liệu quý từ núi rừng Ngọc Linh" />
      </SettingGroup>

      {/* Social Media */}
      <SettingGroup title="Mạng Xã Hội" icon="📱">
        <SettingField label="Facebook" value={settings['social.facebook'] || ''} onChange={v => update('social.facebook', v)} placeholder="https://facebook.com/savinregal" />
        <SettingField label="Zalo" value={settings['social.zalo'] || ''} onChange={v => update('social.zalo', v)} placeholder="https://zalo.me/..." />
        <SettingField label="Instagram" value={settings['social.instagram'] || ''} onChange={v => update('social.instagram', v)} placeholder="https://instagram.com/savinregal" />
        <SettingField label="TikTok" value={settings['social.tiktok'] || ''} onChange={v => update('social.tiktok', v)} placeholder="https://tiktok.com/@savinregal" />
      </SettingGroup>

      {/* Shipping */}
      <SettingGroup title="Vận Chuyển" icon="🚚">
        <SettingField label="Miễn phí ship từ (₫)" value={settings['shipping.freeThreshold'] || ''} onChange={v => update('shipping.freeThreshold', v)} type="number" placeholder="500000" />
        <SettingField label="Phí ship mặc định (₫)" value={settings['shipping.defaultFee'] || ''} onChange={v => update('shipping.defaultFee', v)} type="number" placeholder="30000" />
      </SettingGroup>

      {/* Payment */}
      <SettingGroup title="Thanh Toán" icon="💳">
        <SettingField label="Ngân hàng" value={settings['payment.bankName'] || ''} onChange={v => update('payment.bankName', v)} placeholder="Vietcombank" />
        <SettingField label="Số tài khoản" value={settings['payment.bankAccount'] || ''} onChange={v => update('payment.bankAccount', v)} placeholder="0123456789" />
        <SettingField label="Chủ tài khoản" value={settings['payment.bankHolder'] || ''} onChange={v => update('payment.bankHolder', v)} placeholder="NGUYEN VAN A" />
        <SettingField label="Chi nhánh" value={settings['payment.bankBranch'] || ''} onChange={v => update('payment.bankBranch', v)} placeholder="TP. Hồ Chí Minh" />
        <SettingField label="MoMo - SĐT" value={settings['payment.momoPhone'] || ''} onChange={v => update('payment.momoPhone', v)} placeholder="0901 690 470" />
        <SettingField label="MoMo - Tên" value={settings['payment.momoName'] || ''} onChange={v => update('payment.momoName', v)} placeholder="NGUYEN VAN A" />
      </SettingGroup>

      {/* SEO */}
      <SettingGroup title="SEO & Meta" icon="🔍">
        <SettingField label="Meta Title" value={settings['seo.title'] || ''} onChange={v => update('seo.title', v)} span2 placeholder="Savin Regal — Dược Liệu Núi Rừng" />
        <SettingField label="Meta Description" value={settings['seo.description'] || ''} onChange={v => update('seo.description', v)} type="textarea" span2 placeholder="Mô tả SEO cho trang web..." />
        <SettingField label="Keywords" value={settings['seo.keywords'] || ''} onChange={v => update('seo.keywords', v)} span2 placeholder="sâm ngọc linh, dược liệu, kon tum" />
      </SettingGroup>
    </div>
  );
}
