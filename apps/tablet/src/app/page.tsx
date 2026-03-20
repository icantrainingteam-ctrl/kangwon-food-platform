'use client';

import { useState } from 'react';
import { MenuBrowser } from '../components/MenuBrowser';
import { Cart } from '../components/Cart';
import { OrderStatus } from '../components/OrderStatus';
import { FeedbackForm } from '../components/FeedbackForm';
import { LanguageSelector } from '../components/LanguageSelector';
import type { Language } from '@kangwon/shared';
import type { CartItem } from '@kangwon/shared';

type TabletView = 'welcome' | 'menu' | 'cart' | 'order_status' | 'feedback';

export default function TabletPage() {
  const [view, setView] = useState<TabletView>('welcome');
  const [lang, setLang] = useState<Language>('ko');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [tableNumber] = useState(1); // QR 스캔으로 결정

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.menuItem.id);
      if (existing) {
        return prev.map(c =>
          c.menuItem.id === item.menuItem.id
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(menuItemId);
    setCart(prev => prev.map(c =>
      c.menuItem.id === menuItemId ? { ...c, quantity } : c
    ));
  };

  // --- 환영 화면 ---
  if (view === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white p-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-slate-800 mb-2">강원</h1>
          <p className="text-xl text-orange-600 font-medium">KANGWON</p>
          <p className="text-sm text-slate-500 mt-1">K-Food Restaurant</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => setView('menu')}
            className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-all active:scale-95"
          >
            🍽️ 메뉴 보기 / Browse Menu
          </button>

          <button
            onClick={() => {/* TODO: 직원 호출 */}}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 text-lg font-medium rounded-2xl hover:border-orange-300 transition-all"
          >
            🙋 직원 호출 / Call Staff
          </button>
        </div>

        <div className="mt-8">
          <LanguageSelector lang={lang} onChange={setLang} />
        </div>

        <p className="mt-12 text-xs text-slate-400">
          Table #{tableNumber} · Powered by 강원푸드 iCAN Platform
        </p>
      </div>
    );
  }

  // --- 메뉴 브라우징 ---
  if (view === 'menu') {
    return (
      <MenuBrowser
        lang={lang}
        cart={cart}
        onAddToCart={addToCart}
        onViewCart={() => setView('cart')}
        onBack={() => setView('welcome')}
        cartItemCount={cart.reduce((sum, c) => sum + c.quantity, 0)}
      />
    );
  }

  // --- 장바구니 ---
  if (view === 'cart') {
    return (
      <Cart
        lang={lang}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onBack={() => setView('menu')}
        onOrder={(id) => {
          setOrderId(id);
          setCart([]);
          setView('order_status');
        }}
        tableNumber={tableNumber}
      />
    );
  }

  // --- 주문 상태 ---
  if (view === 'order_status' && orderId) {
    return (
      <OrderStatus
        orderId={orderId}
        lang={lang}
        onAddMore={() => setView('menu')}
        onFeedback={() => setView('feedback')}
      />
    );
  }

  // --- 피드백 ---
  if (view === 'feedback') {
    return (
      <FeedbackForm
        orderId={orderId!}
        lang={lang}
        onComplete={() => {
          setOrderId(null);
          setView('welcome');
        }}
      />
    );
  }

  return null;
}
