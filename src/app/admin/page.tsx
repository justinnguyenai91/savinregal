'use client';

import { useEffect, useState } from 'react';

interface DashboardData {
  overview: {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    pendingOrders: number;
  };
  monthly: {
    orders: number;
    orderGrowth: string;
    revenue: number;
    revenueGrowth: string;
  };
  recentOrders: {
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    items: string;
  }[];
  alerts: {
    lowStock: { name: string; slug: string; stockQuantity: number }[];
    pendingOrders: number;
  };
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7' },
  confirmed: { label: 'Đã xác nhận', color: '#2563eb', bg: '#dbeafe' },
  processing: { label: 'Đang xử lý', color: '#7c3aed', bg: '#ede9fe' },
  shipping: { label: 'Đang giao', color: '#0891b2', bg: '#cffafe' },
  delivered: { label: 'Đã giao', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Đã hủy', color: '#dc2626', bg: '#fee2e2' },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2C4A3E', borderTopColor: 'transparent' }}></div>
          <p style={{ color: '#6B7280' }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!data) return <p style={{ color: '#DC2626' }}>Lỗi tải dữ liệu</p>;

  const statCards = [
    { label: 'Tổng Sản Phẩm', value: data.overview.totalProducts, icon: '📦', color: '#2C4A3E', change: null },
    { label: 'Đơn Hàng Tháng', value: data.monthly.orders, icon: '🛒', color: '#2563eb', change: data.monthly.orderGrowth },
    { label: 'Doanh Thu Tháng', value: formatCurrency(data.monthly.revenue), icon: '💰', color: '#C4956A', change: data.monthly.revenueGrowth },
    { label: 'Đơn Chờ Xử Lý', value: data.overview.pendingOrders, icon: '⏳', color: '#d97706', change: null },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>Tổng Quan</h1>
        <p className="text-sm mt-1" style={{color:'#6B7280'}}>Chào mừng quay trở lại, Savin Regal Admin!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm" style={{color:'#6B7280'}}>{card.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: card.color }}>
                  {card.value}
                </p>
                {card.change && (
                  <p className="text-xs mt-1 font-medium" style={{color: parseFloat(card.change) >= 0 ? '#15803D' : '#DC2626'}}>
                    {parseFloat(card.change) >= 0 ? '↑' : '↓'} {card.change} so với tháng trước
                  </p>
                )}
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 admin-section" style={{padding:0,overflow:'hidden'}}>
          <div className="flex items-center justify-between p-5 border-b" style={{borderColor:'#E8DDD0'}}>
            <h3 className="font-semibold" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>Đơn Hàng Gần Đây</h3>
            <a href="/admin/orders" className="text-sm font-medium hover:underline" style={{ color: '#2C4A3E' }}>Xem tất cả →</a>
          </div>
          {data.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th className="text-left">Mã đơn</th>
                    <th className="text-left">Sản phẩm</th>
                    <th className="text-left">Tổng</th>
                    <th className="text-left">Trạng thái</th>
                    <th className="text-left">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => {
                    const statusInfo = statusLabels[order.status] || statusLabels.pending;
                    return (
                      <tr key={order.orderNumber}>
                        <td><span className="font-mono text-sm font-semibold" style={{ color: '#2C4A3E' }}>#{order.orderNumber}</span></td>
                        <td style={{maxWidth:'12rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{order.items}</td>
                        <td><span className="font-semibold" style={{ color: '#C4956A' }}>{formatCurrency(order.total)}</span></td>
                        <td>
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td style={{color:'#9CA3AF',fontSize:'0.75rem'}}>{formatDate(order.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center" style={{color:'#9CA3AF'}}>
              <p className="text-3xl mb-2">📋</p>
              <p>Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>

        {/* Alerts & Quick Actions */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="admin-section">
            <h3 className="font-semibold mb-4" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>⚡ Cảnh Báo</h3>
            {data.alerts.pendingOrders > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ backgroundColor: '#FEF3C7', border:'1px solid #FDE68A' }}>
                <span className="text-xl">🔔</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#92400E' }}>{data.alerts.pendingOrders} đơn chờ xác nhận</p>
                  <a href="/admin/orders?status=pending" className="text-xs underline" style={{ color: '#B45309' }}>Xem ngay</a>
                </div>
              </div>
            )}
            {data.alerts.lowStock.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', border:'1px solid #FECACA' }}>
                <span className="text-xl">📉</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#991B1B' }}>{data.alerts.lowStock.length} sản phẩm sắp hết hàng</p>
                  {data.alerts.lowStock.map(p => (
                    <p key={p.slug} className="text-xs mt-0.5" style={{ color: '#B91C1C' }}>• {p.name}: còn {p.stockQuantity}</p>
                  ))}
                </div>
              </div>
            )}
            {data.alerts.pendingOrders === 0 && data.alerts.lowStock.length === 0 && (
              <div className="text-center py-4">
                <p className="text-2xl">✅</p>
                <p className="text-sm mt-1" style={{color:'#9CA3AF'}}>Không có cảnh báo</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="admin-section">
            <h3 className="font-semibold mb-4" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>🚀 Thao Tác Nhanh</h3>
            <div className="space-y-2">
              {[
                { href: '/admin/products', label: 'Thêm sản phẩm mới', icon: '➕' },
                { href: '/admin/orders', label: 'Quản lý đơn hàng', icon: '📋' },
                { href: '/admin/coupons', label: 'Tạo mã giảm giá', icon: '🏷️' },
                { href: '/admin/blog', label: 'Viết bài blog', icon: '✍️' },
              ].map(action => (
                <a key={action.href} href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors group"
                  style={{borderRadius:'0.5rem'}}
                  onMouseEnter={e => (e.currentTarget.style.background='#FAF6EF')}
                  onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm" style={{color:'#374151'}}>{action.label}</span>
                  <span className="ml-auto" style={{color:'#D1D5DB'}}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
