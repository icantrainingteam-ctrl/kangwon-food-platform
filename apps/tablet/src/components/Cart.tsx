'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import type { Language, CartItem } from '@kangwon/shared';

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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <ShoppingCart size={64} className="text-slate-300 mb-4" />
        <p className="text-slate-500 text-lg">
          {lang === 'ko' ? '장바구니가 비어있습니다' : 'Your cart is empty'}
        </p>
        <button
          onClick={onBack}
          className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium"
        >
          {lang === 'ko' ? '메뉴 보기' : 'Browse Menu'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">
          {lang === 'ko' ? '장바구니' : 'Cart'} ({items.length})
        </h1>
      </header>

      {/* 아이템 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map(item => (
          <div key={item.menuItem.id} className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              🍽️
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-sm truncate">{item.menuItem.name}</h3>
              <p className="text-orange-600 font-bold text-sm mt-1">
                ₱{(item.menuItem.price * item.quantity).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center"
              >
                {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
              </button>
              <span className="font-bold text-slate-800 w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
              >
                <Plus size={14} className="text-orange-600" />
              </button>
            </div>
          </div>
        ))}

        {/* 특별 요청 */}
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            {lang === 'ko' ? '요청사항 (선택)' : 'Special Request (optional)'}
          </label>
          <textarea
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            placeholder={lang === 'ko' ? '예: 덜 맵게 해주세요' : 'e.g., Less spicy please'}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none h-20"
          />
        </div>
      </div>

      {/* 하단 결제 */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">{lang === 'ko' ? '합계' : 'Total'}</span>
          <span className="text-2xl font-bold text-orange-600">₱{total.toLocaleString()}</span>
        </div>
        <button
          onClick={handleOrder}
          disabled={isOrdering}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95"
        >
          {isOrdering
            ? (lang === 'ko' ? '주문 중...' : 'Ordering...')
            : (lang === 'ko' ? `주문하기 (Table #${tableNumber})` : `Place Order (Table #${tableNumber})`)}
        </button>
      </div>
    </div>
  );
}
