'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import type { Language, MenuItemView, CartItem } from '@kangwon/shared';
import { getMenuImage } from '../lib/menuImages';

interface MenuBrowserProps {
  lang: Language;
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onViewCart: () => void;
  onBack: () => void;
  cartItemCount: number;
}

interface MenuCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  items: MenuItemView[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function MenuBrowser({ lang, cart, onAddToCart, onViewCart, onBack, cartItemCount }: MenuBrowserProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemView | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/menu`)
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].id);
      })
      .catch(console.error);
  }, []);

  const currentCategory = categories.find(c => c.id === activeCategory);

  const getLabel = (item: { name: string; nameEn?: string; nameTl?: string }) => {
    if (lang === 'en') return item.nameEn ?? item.name;
    return item.name;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 z-10 glass"
              style={{ backgroundColor: 'rgba(250, 248, 245, 0.85)', borderBottom: '1px solid var(--color-border-light)' }}>
        <button onClick={onBack}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border-light)' }}>
          <Icon icon="solar:arrow-left-linear" width={20} style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        <div className="text-center">
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            강원
          </h1>
        </div>

        <button
          onClick={onViewCart}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border-light)' }}
        >
          <Icon icon="solar:bag-3-bold-duotone" width={20} style={{ color: 'var(--color-text-primary)' }} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-gold)' }}>
              {cartItemCount}
            </span>
          )}
        </button>
      </header>

      {/* Category Tabs */}
      <div className="overflow-x-auto sticky top-[65px] z-10 glass"
           style={{ backgroundColor: 'rgba(250, 248, 245, 0.85)' }}>
        <div className="flex px-4 py-3 gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-premium"
              style={activeCategory === cat.id ? {
                backgroundColor: 'var(--color-text-primary)',
                color: '#ffffff',
              } : {
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              {getLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {currentCategory?.items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { setSelectedItem(item); setQuantity(1); }}
              className="rounded-2xl overflow-hidden text-left transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border-light)',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {/* Image Area */}
              <div className="aspect-[4/3] relative overflow-hidden"
                   style={{ backgroundColor: 'var(--color-surface-warm)' }}>
                {getMenuImage(item.name) ? (
                  <img src={getMenuImage(item.name)!} alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon icon="solar:bowl-bold-duotone" width={40}
                          style={{ color: 'var(--color-border)', opacity: 0.5 }} />
                  </div>
                )}
                {item.isPopular && (
                  <span className="absolute top-2.5 left-2.5 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                        style={{ backgroundColor: 'var(--color-primary)' }}>
                    <Icon icon="solar:fire-bold" width={10} />
                    BEST
                  </span>
                )}
                {item.tags?.includes('new') && (
                  <span className="absolute top-2.5 right-2.5 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: 'var(--color-accent)' }}>
                    NEW
                  </span>
                )}
              </div>

              <div className="p-3.5">
                <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                  {item.name}
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  {item.nameEn}
                </p>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>
                    ₱{item.price}
                  </span>
                  <div className="flex items-center gap-1 text-[11px]"
                       style={{ color: 'var(--color-text-tertiary)' }}>
                    <Icon icon="solar:clock-circle-linear" width={12} />
                    <span>{item.prepTimeMinutes}min</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end animate-fade-in"
             style={{ backgroundColor: 'rgba(26, 23, 20, 0.4)' }}
             onClick={(e) => e.target === e.currentTarget && setSelectedItem(null)}>
          <div className="w-full rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up"
               style={{ backgroundColor: 'var(--color-card)' }}>
            <div className="p-6">
              {/* Drag Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: 'var(--color-border)' }} />

              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                {selectedItem.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                {selectedItem.nameEn}
              </p>

              {selectedItem.description && (
                <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedItem.description}
                </p>
              )}

              {/* How to Enjoy */}
              <div className="mt-5 rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface-warm)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="solar:hand-stars-bold-duotone" width={18} style={{ color: 'var(--color-gold)' }} />
                  <h4 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {lang === 'ko' ? '이렇게 드세요' : 'How to Enjoy'}
                  </h4>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {lang === 'ko'
                    ? '밥과 함께 비벼서 드시면 더욱 맛있습니다. 반찬은 리필 가능합니다.'
                    : 'Mix with rice for the best taste. Side dishes are free refill!'}
                </p>
              </div>

              {/* Allergens */}
              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="mt-3 flex gap-1.5 flex-wrap">
                  {selectedItem.allergens.map(a => (
                    <span key={a} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {/* Quantity & Price */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}
                  >
                    <Icon icon="solar:minus-circle-linear" width={20} style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                  <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
                    style={{ backgroundColor: 'var(--color-gold-light)', border: '1px solid transparent' }}
                  >
                    <Icon icon="solar:add-circle-linear" width={20} style={{ color: 'var(--color-gold)' }} />
                  </button>
                </div>
                <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  ₱{(selectedItem.price * quantity).toLocaleString()}
                </span>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => {
                  onAddToCart({ menuItem: selectedItem, quantity });
                  setSelectedItem(null);
                }}
                className="w-full mt-6 py-4 text-white text-base font-bold rounded-2xl transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-text-primary)' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon icon="solar:bag-3-bold-duotone" width={20} />
                  {lang === 'ko' ? '담기' : lang === 'en' ? 'Add to Cart' : 'Idagdag'}
                </span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full mt-2 py-3 text-sm transition-colors duration-300"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {lang === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Cart Bar */}
      {cartItemCount > 0 && !selectedItem && (
        <div className="sticky bottom-0 p-4 glass animate-slide-up"
             style={{ backgroundColor: 'rgba(250, 248, 245, 0.9)', borderTop: '1px solid var(--color-border-light)' }}>
          <button
            onClick={onViewCart}
            className="w-full py-4 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-text-primary)' }}
          >
            <Icon icon="solar:bag-3-bold-duotone" width={20} />
            <span>
              {lang === 'ko' ? '장바구니' : 'Cart'} ({cartItemCount})
            </span>
            <span className="w-px h-4 bg-white/20" />
            <span>₱{cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0).toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}
