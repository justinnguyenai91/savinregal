'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  product: { name: string; slug: string };
  variant: { name: string } | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  guestAddress: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7' },
  confirmed: { label: 'Đã xác nhận', color: '#2563eb', bg: '#dbeafe' },
  processing: { label: 'Đang xử lý', color: '#7c3aed', bg: '#ede9fe' },
  shipping: { label: 'Đang giao', color: '#0891b2', bg: '#cffafe' },
  delivered: { label: 'Đã giao', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Đã hủy', color: '#dc2626', bg: '#fee2e2' },
};

const paymentLabels: Record<string, string> = {
  cod: 'COD',
  vnpay: 'VNPay',
  momo: 'MoMo',
  transfer: 'Chuyển khoản',
};

const nextStatusActions: Record<string, { label: string; next: string; color: string }[]> = {
  pending: [
    { label: '✅ Xác nhận', next: 'confirmed', color: '#2563eb' },
    { label: '❌ Hủy', next: 'cancelled', color: '#dc2626' },
  ],
  confirmed: [
    { label: '⚙️ Xử lý', next: 'processing', color: '#7c3aed' },
    { label: '❌ Hủy', next: 'cancelled', color: '#dc2626' },
  ],
  processing: [
    { label: '🚚 Giao hàng', next: 'shipping', color: '#0891b2' },
    { label: '❌ Hủy', next: 'cancelled', color: '#dc2626' },
  ],
  shipping: [
    { label: '✅ Đã giao', next: 'delivered', color: '#16a34a' },
  ],
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  // Default: last 30 days
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchOrders = async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    const url = `/api/orders?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFrom, dateTo]);

  const handleStatusUpdate = async (orderNumber: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Update error:', err);
    }
    setUpdating(false);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>Quản Lý Đơn Hàng</h1>
          <p className="text-sm mt-1" style={{color:'#6B7280'}}>{orders.length} đơn hàng</p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: '', label: 'Tất cả' },
            { value: 'pending', label: 'Chờ xác nhận' },
            { value: 'confirmed', label: 'Đã xác nhận' },
            { value: 'processing', label: 'Đang xử lý' },
            { value: 'shipping', label: 'Đang giao' },
            { value: 'delivered', label: 'Đã giao' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={statusFilter === filter.value
                ? { backgroundColor: '#2C4A3E', color: '#FFFFFF', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                : { backgroundColor: '#FFFFFF', color: '#6B7280', border: '1px solid #E8DDD0' }
              }
              onMouseEnter={e => { if (statusFilter !== filter.value) e.currentTarget.style.backgroundColor = '#FAF6EF'; }}
              onMouseLeave={e => { if (statusFilter !== filter.value) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Từ:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs"
            style={{ border: '1px solid #E8DDD0' }}
          />
          <span className="text-xs font-medium" style={{ color: '#6B7280' }}>đến:</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs"
            style={{ border: '1px solid #E8DDD0' }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-section" style={{padding:0,overflow:'hidden'}}>
        {orders.length > 0 ? (
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="text-left">Mã đơn</th>
                <th className="text-left">Khách hàng</th>
                <th className="text-left">Sản phẩm</th>
                <th className="text-left">Tổng tiền</th>
                <th className="text-left">Thanh toán</th>
                <th className="text-left">Trạng thái</th>
                <th className="text-left">Ngày tạo</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const statusInfo = statusLabels[order.status] || statusLabels.pending;
                const actions = nextStatusActions[order.status] || [];
                return (
                  <tr key={order.id}>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-mono text-sm font-medium hover:underline"
                        style={{ color: '#2C4A3E' }}
                      >
                        #{order.orderNumber}
                      </button>
                    </td>
                    <td>
                      <p className="text-sm font-medium" style={{color:'#111714'}}>{order.guestName}</p>
                      <p className="text-xs" style={{color:'#9CA3AF'}}>{order.guestPhone}</p>
                    </td>
                    <td style={{maxWidth:'10rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#6B7280',fontSize:'0.875rem'}}>
                      {order.items.map(i => `${i.product.name}${i.variant ? ` (${i.variant.name})` : ''} x${i.quantity}`).join(', ')}
                    </td>
                    <td>
                      <span className="text-sm font-semibold" style={{ color: '#C4956A' }}>{formatCurrency(order.total)}</span>
                    </td>
                    <td style={{color:'#6B7280',fontSize:'0.75rem'}}>
                      {paymentLabels[order.paymentMethod] || order.paymentMethod}
                    </td>
                    <td>
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={{color:'#9CA3AF',fontSize:'0.75rem'}}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td>
                      <div className="flex gap-1 justify-center">
                        {actions.map(action => (
                          <button
                            key={action.next}
                            onClick={() => handleStatusUpdate(order.orderNumber, action.next)}
                            disabled={updating}
                            className="px-2 py-1 rounded text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ backgroundColor: action.color }}
                            title={action.label}
                          >
                            {action.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p style={{color:'#9CA3AF'}}>Không có đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" style={{border:'1px solid #E8DDD0'}} onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex items-center justify-between p-5 rounded-t-2xl" style={{borderBottom:'1px solid #E8DDD0'}}>
              <h3 className="font-bold text-lg" style={{color:'#111714',fontFamily:'var(--font-heading)'}}>
                Đơn hàng #{selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-xl transition-colors" style={{color:'#9CA3AF'}} onMouseEnter={e=>(e.currentTarget.style.color='#374151')} onMouseLeave={e=>(e.currentTarget.style.color='#9CA3AF')}>✕</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Customer */}
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{color:'#6B7280'}}>THÔNG TIN KHÁCH HÀNG</h4>
                <p className="text-sm"><strong>Tên:</strong> {selectedOrder.guestName}</p>
                <p className="text-sm"><strong>SĐT:</strong> {selectedOrder.guestPhone}</p>
                {selectedOrder.guestEmail && <p className="text-sm"><strong>Email:</strong> {selectedOrder.guestEmail}</p>}
                <p className="text-sm"><strong>Địa chỉ:</strong> {selectedOrder.guestAddress}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{color:'#6B7280'}}>SẢN PHẨM</h4>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 last:border-0" style={{borderBottom:'1px solid #F3F4F6'}}>
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      {item.variant && <p className="text-xs" style={{color:'#9CA3AF'}}>{item.variant.name}</p>}
                      <p className="text-xs" style={{color:'#9CA3AF'}}>x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#C4956A' }}>
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="rounded-lg p-4 space-y-1.5" style={{background:'#FAF6EF'}}>
                <div className="flex justify-between text-sm">
                  <span style={{color:'#6B7280'}}>Tạm tính</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{color:'#6B7280'}}>Phí vận chuyển</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'Miễn phí' : formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm" style={{color:'#16A34A'}}>
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2" style={{borderTop:'1px solid #E8DDD0'}}>
                  <span>Tổng cộng</span>
                  <span style={{ color: '#C4956A' }}>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Actions */}
              {nextStatusActions[selectedOrder.status]?.length > 0 && (
                <div className="flex gap-2">
                  {nextStatusActions[selectedOrder.status].map(action => (
                    <button
                      key={action.next}
                      onClick={() => handleStatusUpdate(selectedOrder.orderNumber, action.next)}
                      disabled={updating}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: action.color }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
