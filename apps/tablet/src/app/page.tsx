'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
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
  const [tableNumber] = useState(1);

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

  // --- Welcome Screen ---
  if (view === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
           style={{ backgroundColor: 'var(--color-surface)' }}>
        {/* Decorative elements */}
        <div className="absolute top-12 left-8 w-24 h-24 rounded-full opacity-[0.04] animate-float"
             style={{ backgroundColor: 'var(--color-gold)' }} />
        <div className="absolute bottom-24 right-12 w-32 h-32 rounded-full opacity-[0.03] animate-float"
             style={{ backgroundColor: 'var(--color-gold)', animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-8 w-16 h-16 rounded-full opacity-[0.05] animate-float"
             style={{ backgroundColor: 'var(--color-primary)', animationDelay: '1s' }} />

        {/* Brand */}
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-sm"
               style={{ backgroundColor: 'var(--color-gold-light)' }}>
            <Icon icon="solar:chef-hat-heart-bold-duotone" width={40}
                  style={{ color: 'var(--color-gold)' }} />
          </div>
          <h1 className="text-5xl font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}>
            강원
          </h1>
          <p className="text-sm font-semibold tracking-[0.2em] mt-2"
             style={{ color: 'var(--color-gold)' }}>
            KANGWON
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-8 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Authentic K-Food
            </p>
            <div className="w-8 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3 animate-fade-in-up stagger-2">
          <button
            onClick={() => setView('menu')}
            className="group w-full py-5 text-white text-lg font-bold rounded-2xl transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-text-primary)' }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Icon icon="solar:book-2-bold-duotone" width={22} />
              {lang === 'ko' ? '메뉴 보기' : lang === 'en' ? 'Browse Menu' : 'Tingnan ang Menu'}
            </span>
          </button>

          <button
            onClick={() => {/* TODO: staff call */}}
            className="group w-full py-4 text-sm font-semibold rounded-2xl transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98] border"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <Icon icon="solar:bell-bold-duotone" width={18}
                    style={{ color: 'var(--color-gold)' }} />
              {lang === 'ko' ? '직원 호출' : lang === 'en' ? 'Call Staff' : 'Tumawag ng Staff'}
            </span>
          </button>
        </div>

        {/* Language */}
        <div className="mt-10 animate-fade-in-up stagger-3">
          <LanguageSelector lang={lang} onChange={setLang} />
        </div>

        {/* Footer */}
        <p className="mt-14 text-[11px] tracking-wide"
           style={{ color: 'var(--color-text-tertiary)' }}>
          Table {tableNumber} · 강원푸드
        </p>
      </div>
    );
  }

  // --- Menu ---
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

  // --- Cart ---
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

  // --- Order Status ---
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

  // --- Feedback ---
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
