'use client';

import React from 'react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/data';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-bark/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-stone z-[70] shadow-2xl flex flex-col"
        style={{ animation: 'slideInRight 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-fog flex items-center justify-between bg-white">
          <div>
            <h3 className="font-heading font-bold text-lg text-bark">
              Giỏ hàng
            </h3>
            <p className="text-xs text-silver-dark mt-0.5">{totalItems} sản phẩm</p>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-fog rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-bark-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-fog flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-silver-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-silver-dark text-sm mb-1">Giỏ hàng trống</p>
              <p className="text-silver-mist text-xs mb-5">Hãy thêm sản phẩm yêu thích</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary !text-sm"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const price = item.variant?.price ?? item.product.price;
                return (
                  <div key={`${item.product.id}-${item.variant?.id ?? index}`} className="flex gap-3 p-3 bg-white rounded-2xl border border-fog/50">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{background:'#FAF6EF',border:'1px solid #E8DDD0'}}>
                      <img src="/placeholder.png" alt={item.product.name} style={{width:'80%',height:'80%',objectFit:'contain'}} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-bark line-clamp-2 leading-snug">{item.product.name}</h4>
                      {item.variant && (
                        <p className="text-[11px] text-silver-dark mt-0.5">{item.variant.name}</p>
                      )}
                      <p className="text-sm font-bold text-earth-deep mt-1">{formatPrice(price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                          className="w-7 h-7 rounded-full border border-silver-light flex items-center justify-center text-sm text-bark-light hover:bg-fog transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center text-bark">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                          className="w-7 h-7 rounded-full border border-silver-light flex items-center justify-center text-sm text-bark-light hover:bg-fog transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id, item.variant?.id)}
                          className="ml-auto text-danger/50 hover:text-danger text-xs transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-fog space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm text-silver-dark">Tạm tính</span>
              <span className="text-lg font-bold text-earth-deep font-heading">{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href="/gio-hang"
              onClick={() => setIsCartOpen(false)}
              className="btn-accent w-full text-center block !py-3"
            >
              Xem giỏ hàng & Thanh toán
            </Link>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-center text-sm text-silver-dark hover:text-mountain-deep transition-colors py-1.5"
            >
              ← Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
}
