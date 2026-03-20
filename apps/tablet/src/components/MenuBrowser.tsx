'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus, Star, Clock, Flame } from 'lucide-react';
import type { Language, MenuItemView, CartItem } from '@kangwon/shared';

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 바 */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">강원</h1>
        <button
          onClick={onViewCart}
          className="relative p-2 hover:bg-orange-50 rounded-full"
        >
          <ShoppingCart size={24} className="text-orange-500" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </header>

      {/* 카테고리 탭 */}
      <div className="bg-white border-b border-slate-100 overflow-x-auto">
        <div className="flex px-2 py-2 gap-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* 메뉴 그리드 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {currentCategory?.items.map(item => (
            <button
              key={item.id}
              onClick={() => { setSelectedItem(item); setQuantity(1); }}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden text-left hover:shadow-md transition-all active:scale-95"
            >
              {/* 이미지 영역 */}
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center relative">
                <span className="text-4xl">🍽️</span>
                {item.isPopular && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Flame size={10} /> HOT
                  </span>
                )}
                {item.tags?.includes('new') && (
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.nameEn}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-orange-600 font-bold">₱{item.price}</span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Clock size={12} />
                    <span>{item.prepTimeMinutes}분</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 메뉴 상세 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              {/* 드래그 핸들 */}
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6" />

              <h2 className="text-2xl font-bold text-slate-800">{selectedItem.name}</h2>
              <p className="text-slate-500 mt-1">{selectedItem.nameEn}</p>

              {selectedItem.description && (
                <p className="text-slate-600 mt-3 text-sm">{selectedItem.description}</p>
              )}

              {/* 먹는 방법 (K-Food 교육) */}
              <div className="mt-4 bg-orange-50 rounded-xl p-4">
                <h4 className="font-bold text-orange-700 text-sm mb-1">🥢 이렇게 드세요 / How to Enjoy</h4>
                <p className="text-xs text-orange-600">
                  {lang === 'ko'
                    ? '밥과 함께 비벼서 드시면 더욱 맛있습니다. 반찬은 리필 가능합니다.'
                    : 'Mix with rice for the best taste. Side dishes are free refill!'}
                </p>
              </div>

              {/* 알레르기 정보 */}
              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="mt-3 flex gap-1">
                  {selectedItem.allergens.map(a => (
                    <span key={a} className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              )}

              {/* 수량 및 가격 */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-2xl font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  ₱{(selectedItem.price * quantity).toLocaleString()}
                </span>
              </div>

              {/* 장바구니 담기 */}
              <button
                onClick={() => {
                  onAddToCart({ menuItem: selectedItem, quantity });
                  setSelectedItem(null);
                }}
                className="w-full mt-6 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95"
              >
                장바구니 담기 / Add to Cart
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full mt-2 py-3 text-slate-500 text-sm"
              >
                닫기 / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 장바구니 바 */}
      {cartItemCount > 0 && !selectedItem && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
          <button
            onClick={onViewCart}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            장바구니 보기 ({cartItemCount}개) · ₱{cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0).toLocaleString()}
          </button>
        </div>
      )}
    </div>
  );
}
