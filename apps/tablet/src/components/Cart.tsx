'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { Language, CartItem } from '@kangwon/shared';
import { getMenuImage } from '../lib/menuImages';

interface CartProps {
  lang: Language;
  items: CartItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemove: (menuItemId: string) => void;
  onBack: () => void;
  onOrder: (orderId: string) => void;
  tableNumber: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function Cart({ lang, items, onUpdateQuantity, onRemove, onBack, onOrder, tableNumber }: CartProps) {
  const [isOrdering, setIsOrdering] = useState(false);
  const [specialRequest, setSpecialRequest] = useState('');

  const total = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const handleOrder = async () => {
    setIsOrdering(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceMode: 'table_tablet',
          items: items.map(item => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            specialRequest: item.specialRequest,
          })),
          specialRequest: specialRequest || undefined,
        }),
      });
      const order = await res.json();
      onOrder(order.id);
    } catch (err) {
      console.error('Order failed:', err);
    } finally {
      setIsOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8"
           style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 animate-float"
             style={{ backgroundColor: 'var(--color-surface-warm)' }}>
          <Icon icon="solar:bag-3-bold-duotone" width={36} style={{ color: 'var(--color-border)' }} />
        </div>
        <p className="text-base font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
          {lang === 'ko' ? '아직 담은 메뉴가 없어요' : 'Your cart is empty'}
        </p>
        <button
          onClick={onBack}
          className="mt-8 px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: 'var(--color-text-primary)', color: '#ffffff' }}
        >
          {lang === 'ko' ? '메뉴 보기' : 'Browse Menu'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3 sticky top-0 z-10 glass"
              style={{ backgroundColor: 'rgba(250, 248, 245, 0.85)', borderBottom: '1px solid var(--color-border-light)' }}>
        <button onClick={onBack}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border-light)' }}>
          <Icon icon="solar:arrow-left-linear" width={20} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {lang === 'ko' ? '주문 확인' : 'Your Order'}
          </h1>
          <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {items.length} {lang === 'ko' ? '개 메뉴' : 'items'}
          </p>
        </div>
      </header>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {items.map((item, i) => (
          <div key={item.menuItem.id}
               className="rounded-2xl p-4 flex items-center gap-4 animate-fade-in-up transition-all duration-300"
               style={{
                 backgroundColor: 'var(--color-card)',
                 border: '1px solid var(--color-border-light)',
                 animationDelay: `${i * 0.05}s`,
               }}>
            <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden"
                 style={{ backgroundColor: 'var(--color-surface-warm)' }}>
              {getMenuImage(item.menuItem.name) ? (
                <img src={getMenuImage(item.menuItem.name)!} alt={item.menuItem.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon icon="solar:bowl-bold-duotone" width={24} style={{ color: 'var(--color-border)' }} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                {item.menuItem.name}
              </h3>
              <p className="font-bold text-sm mt-1" style={{ color: 'var(--color-gold)' }}>
                ₱{(item.menuItem.price * item.quantity).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}
              >
                {item.quantity === 1
                  ? <Icon icon="solar:trash-bin-minimalistic-linear" width={15} style={{ color: '#dc2626' }} />
                  : <Icon icon="solar:minus-circle-linear" width={15} style={{ color: 'var(--color-text-secondary)' }} />
                }
              </button>
              <span className="font-bold text-sm w-5 text-center tabular-nums"
                    style={{ color: 'var(--color-text-primary)' }}>
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-gold-light)' }}
              >
                <Icon icon="solar:add-circle-linear" width={15} style={{ color: 'var(--color-gold)' }} />
              </button>
            </div>
          </div>
        ))}

        {/* Special Request */}
        <div className="mt-3 animate-fade-in-up stagger-3">
          <label className="text-xs font-semibold mb-2 block tracking-wide"
                 style={{ color: 'var(--color-text-tertiary)' }}>
            {lang === 'ko' ? '요청사항' : 'Special Request'}
          </label>
          <textarea
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            placeholder={lang === 'ko' ? '예: 덜 맵게 해주세요' : 'e.g., Less spicy please'}
            className="w-full p-4 rounded-2xl text-sm resize-none h-20 transition-all duration-300 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border-light)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Bottom Order Section */}
      <div className="sticky bottom-0 p-4 space-y-4 glass"
           style={{ backgroundColor: 'rgba(250, 248, 245, 0.92)', borderTop: '1px solid var(--color-border-light)' }}>
        <div className="flex justify-between items-center px-1">
          <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            {lang === 'ko' ? '합계' : 'Total'}
          </span>
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            ₱{total.toLocaleString()}
          </span>
        </div>
        <button
          onClick={handleOrder}
          disabled={isOrdering}
          className="w-full py-4 text-white text-base font-bold rounded-2xl transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
          style={{ backgroundColor: 'var(--color-text-primary)' }}
        >
          {isOrdering
            ? <span className="flex items-center justify-center gap-2">
                <Icon icon="solar:refresh-bold" width={18} className="animate-spin" />
                {lang === 'ko' ? '주문 처리 중' : 'Ordering...'}
              </span>
            : <span className="flex items-center justify-center gap-2">
                <Icon icon="solar:check-circle-bold" width={20} />
                {lang === 'ko' ? `주문하기 · Table ${tableNumber}` : `Place Order · Table ${tableNumber}`}
              </span>
          }
        </button>
      </div>
    </div>
  );
}
