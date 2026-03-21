'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { MenuBrowser } from '../components/MenuBrowser';
import { Cart } from '../components/Cart';
import { OrderStatus } from '../components/OrderStatus';
import { FeedbackForm } from '../components/FeedbackForm';
import { LanguageSelector } from '../components/LanguageSelector';
import type { Language } from '@kangwon/shared';
import type { CartItem } from '@kangwon/shared';

type TabletView = 'welcome' | 'menu' | 'cart' | 'order_status' | 'feedback';

// Hero slides
const HERO_SLIDES = [
  { image: 'https://public.readdy.ai/ai/img_res/4abfa58cd95eaf997fe44d1671a597c4.jpg', titleKo: '강원도의 맛을 마닐라에서', titleEn: 'Taste of Gangwon in Manila', subtitleKo: '청정 자연의 신선한 재료로 만든 건강한 한 끼', subtitleEn: 'Healthy meals with fresh natural ingredients' },
  { image: 'https://readdy.ai/api/search-image?query=Authentic%20Korean%20bibimbap%20in%20traditional%20stone%20bowl%20with%20colorful%20fresh%20vegetables%2C%20perfectly%20fried%20egg%20on%20top%2C%20gochujang%20sauce%20on%20side%2C%20served%20on%20wooden%20table%2C%20professional%20food%20photography%2C%20top%20view%2C%20vibrant%20colors%2C%20steam%20rising%2C%20appetizing%20presentation%20with%20Korean%20side%20dishes%2C%20natural%20lighting&width=1920&height=1080&seq=hero2&orientation=landscape', titleKo: '정통 한식의 진수', titleEn: 'Authentic Korean Cuisine', subtitleKo: '한국인 셰프가 직접 조리하는 프리미엄 K-Food', subtitleEn: 'Premium K-Food crafted by Korean chefs' },
  { image: 'https://readdy.ai/api/search-image?query=Korean%20BBQ%20grill%20with%20premium%20marbled%20beef%20cooking%20on%20traditional%20charcoal%20grill%2C%20smoke%20rising%2C%20accompanied%20by%20fresh%20lettuce%20wraps%20and%20various%20Korean%20banchan%20side%20dishes%2C%20professional%20food%20photography%2C%20warm%20lighting%2C%20appetizing%20presentation%2C%20authentic%20Korean%20dining%20experience%2C%20close-up%20shot&width=1920&height=1080&seq=hero3&orientation=landscape', titleKo: '프리미엄 한국식 바비큐', titleEn: 'Premium Korean BBQ', subtitleKo: '숯불에 구워 더욱 깊은 풍미를 경험하세요', subtitleEn: 'Experience the deep flavors of charcoal grilling' },
];

// Popular menu showcase
const POPULAR_MENU = [
  { name: '불고기', nameEn: 'Bulgogi', price: 450, image: 'https://readdy.ai/api/search-image?query=Korean%20bulgogi%20marinated%20grilled%20beef%20with%20caramelized%20edges%20garnished%20with%20sesame%20seeds%20and%20sliced%20green%20onions%20served%20with%20lettuce%20wraps%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20appetizing%20presentation&width=500&height=400&seq=menu2ko&orientation=landscape', rating: 4.8 },
  { name: '삼겹살', nameEn: 'Samgyeopsal', price: 480, image: 'https://readdy.ai/api/search-image?query=Korean%20samgyeopsal%20grilled%20pork%20belly%20slices%20cooking%20on%20grill%20with%20lettuce%20wraps%20ssamjang%20sauce%20various%20side%20dishes%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20sizzling%20appetizing%20presentation&width=500&height=400&seq=menu4ko&orientation=landscape', rating: 4.9 },
  { name: '비빔밥', nameEn: 'Bibimbap', price: 350, image: 'https://readdy.ai/api/search-image?query=traditional%20Korean%20bibimbap%20in%20stone%20pot%20with%20colorful%20fresh%20vegetables%20carrots%20spinach%20bean%20sprouts%20mushrooms%20perfectly%20cooked%20fried%20egg%20on%20top%20gochujang%20sauce%20on%20side%20professional%20food%20photography%20top%20down%20view%20vibrant%20colors%20clean%20white%20background%20centered%20composition%20appetizing%20presentation&width=500&height=400&seq=menu1ko&orientation=landscape', rating: 4.7 },
  { name: '김치찌개', nameEn: 'Kimchi Jjigae', price: 320, image: 'https://readdy.ai/api/search-image?query=Korean%20kimchi%20jjigae%20in%20traditional%20stone%20pot%20bubbling%20hot%20broth%20with%20tofu%20pork%20kimchi%20vibrant%20red%20color%20steam%20rising%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20appetizing%20presentation&width=500&height=400&seq=menu3ko&orientation=landscape', rating: 4.8 },
  { name: '떡볶이', nameEn: 'Tteokbokki', price: 250, image: 'https://readdy.ai/api/search-image?query=Korean%20tteokbokki%20spicy%20rice%20cakes%20in%20red%20gochujang%20sauce%20with%20fish%20cake%20boiled%20egg%20garnished%20with%20sesame%20seeds%20and%20green%20onions%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20vibrant%20red%20color&width=500&height=400&seq=menu6ko&orientation=landscape', rating: 4.6 },
  { name: '잡채', nameEn: 'Japchae', price: 280, image: 'https://readdy.ai/api/search-image?query=Korean%20japchae%20glass%20noodles%20stir%20fried%20with%20colorful%20vegetables%20beef%20sesame%20seeds%20on%20white%20plate%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20appetizing%20presentation&width=500&height=400&seq=menu5ko&orientation=landscape', rating: 4.7 },
];

// Menu categories
const CATEGORIES = [
  { name: '메인 요리', nameEn: 'Main Dishes', icon: 'solar:chef-hat-bold-duotone', image: 'https://public.readdy.ai/ai/img_res/84b4c68f95329597ff760af882ede6a3.jpg' },
  { name: '바비큐', nameEn: 'BBQ', icon: 'solar:fire-bold-duotone', image: 'https://readdy.ai/api/search-image?query=%ED%95%9C%EA%B5%AD%EC%8B%9D%20%EA%B5%AC%EC%9D%B4%20%EA%B3%A0%EA%B8%B0%2C%20%EC%84%9D%EC%87%A0%20%EC%9C%84%EC%97%90%EC%84%9C%20%EC%A7%80%EA%B8%80%EC%A7%80%EA%B8%80%20%EA%B5%AC%EC%9B%8C%EC%A7%80%EB%8A%94%20%EB%A7%88%EB%B8%94%EB%A7%81%EC%9D%B4%20%EC%A2%8B%EC%9D%80%20%EA%B3%A0%EA%B8%B0%2C%20%EA%B9%94%EB%81%94%ED%95%9C%20%ED%9D%B0%EC%83%89%20%EB%B0%B0%EA%B2%BD%2C%20%EC%B8%A1%EB%A9%B4%20%EA%B0%81%EB%8F%84%2C%20%EC%97%B0%EA%B8%B0%EA%B0%80%20%EC%82%B4%EC%A7%9D%20%EC%98%AC%EB%9D%BC%EC%98%A4%EB%8A%94%20%EB%AA%A8%EC%8A%B5%2C%20%EC%9D%8C%EC%8B%9D%20%EC%82%AC%EC%A7%84%20%EC%8A%A4%ED%83%80%EC%9D%BC%2C%20%EC%9E%90%EC%97%B0%EA%B4%91%2C%20%EA%B3%A0%ED%92%88%EC%A7%88%20%EC%9D%B4%EB%AF%B8%EC%A7%80&width=800&height=600&seq=cat2&orientation=landscape' },
  { name: '국 & 찌개', nameEn: 'Soups & Stews', icon: 'solar:cup-hot-bold-duotone', image: 'https://readdy.ai/api/search-image?query=%ED%95%9C%EA%B5%AD%20%EC%A0%84%ED%86%B5%20%EA%B9%80%EC%B9%98%EC%B0%8C%EA%B0%9C%2C%20%EB%9C%A8%EA%B1%B0%EC%9A%B4%20%EB%8F%8C%EC%86%A5%EC%97%90%20%EB%8B%B4%EA%B8%B4%20%EB%B9%A8%EA%B0%84%20%EA%B5%AD%EB%AC%BC%EC%9D%98%20%EA%B9%80%EC%B9%98%EC%B0%8C%EA%B0%9C%2C%20%EA%B9%80%EC%9D%B4%20%EB%AA%A8%EB%9D%BD%EB%AA%A8%EB%9D%BD%20%EB%82%98%EB%8A%94%20%EB%AA%A8%EC%8A%B5%2C%20%EA%B9%94%EB%81%94%ED%95%9C%20%ED%9D%B0%EC%83%89%20%EB%B0%B0%EA%B2%BD%2C%20%EC%B8%A1%EB%A9%B4%20%EA%B0%81%EB%8F%84%2C%20%EC%9D%8C%EC%8B%9D%20%EC%82%AC%EC%A7%84%20%EC%8A%A4%ED%83%80%EC%9D%BC%2C%20%EC%9E%90%EC%97%B0%EA%B4%91%2C%20%EA%B3%A0%ED%92%88%EC%A7%88%20%EC%9D%B4%EB%AF%B8%EC%A7%80&width=800&height=600&seq=cat3&orientation=landscape' },
  { name: '사이드 & 디저트', nameEn: 'Sides & Dessert', icon: 'solar:donut-bold-duotone', image: 'https://readdy.ai/api/search-image?query=%ED%95%9C%EA%B5%AD%20%EC%A0%84%ED%86%B5%20%EB%B9%99%EC%88%98%2C%20%EB%8B%A4%EC%B1%84%EB%A1%9C%EC%9A%B4%20%EA%B3%BC%EC%9D%BC%EA%B3%BC%20%ED%8C%A5%EC%9D%B4%20%EC%98%AC%EB%A0%A4%EC%A7%84%20%EB%88%88%EC%B2%98%EB%9F%BC%20%EB%B6%80%EB%93%9C%EB%9F%AC%EC%9A%B4%20%EB%B9%99%EC%88%98%2C%20%EA%B9%94%EB%81%94%ED%95%9C%20%ED%9D%B0%EC%83%89%20%EB%B0%B0%EA%B2%BD%2C%20%EC%9C%84%EC%97%90%EC%84%9C%20%EB%82%B4%EB%A0%A4%EB%8B%A4%EB%B3%B8%20%EA%B0%81%EB%8F%84%2C%20%EC%8B%9C%EC%9B%90%ED%95%9C%20%EB%8A%90%EB%82%8C%2C%20%EC%9D%8C%EC%8B%9D%20%EC%82%AC%EC%A7%84%20%EC%8A%A4%ED%83%80%EC%9D%BC%2C%20%EC%9E%90%EC%97%B0%EA%B4%91%2C%20%EA%B3%A0%ED%92%88%EC%A7%88%20%EC%9D%B4%EB%AF%B8%EC%A7%80&width=800&height=600&seq=cat4&orientation=landscape' },
];

export default function TabletPage() {
  const [view, setView] = useState<TabletView>('welcome');
  const [lang, setLang] = useState<Language>('ko');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [tableNumber] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hero slide auto-rotate
  useEffect(() => {
    if (view !== 'welcome') return;
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, [view]);

  // Scroll detection for sticky header
  useEffect(() => {
    if (view !== 'welcome') return;
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 60);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [view]);

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

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  // =============================================
  // WELCOME — Restaurant Landing Page
  // =============================================
  if (view === 'welcome') {
    const slide = HERO_SLIDES[heroIndex];
    return (
      <div ref={scrollRef} className="min-h-screen overflow-y-auto" style={{ backgroundColor: '#0a0a0a' }}>

        {/* Sticky Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-3 flex items-center justify-between transition-all duration-500 ease-premium glass"
             style={{ backgroundColor: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="flex items-center gap-2">
            <Icon icon="solar:chef-hat-heart-bold-duotone" width={20} style={{ color: 'var(--color-gold)' }} />
            <span className="font-bold text-sm text-white tracking-tight">강원</span>
            <span className="text-[10px] text-white/40 tracking-wider">KANGWON</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector lang={lang} onChange={setLang} />
            <button onClick={() => setView('menu')}
              className="ml-2 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--color-gold)' }}>
              {t('주문하기', 'Order Now')}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          {HERO_SLIDES.map((s, i) => (
            <div key={i}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: heroIndex === i ? 1 : 0 }}>
              <img src={s.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(10,10,10,1) 100%)' }} />
            </div>
          ))}

          <div className="absolute bottom-16 left-0 right-0 px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight animate-fade-in-up"
                key={`title-${heroIndex}`}>
              {lang === 'ko' ? slide.titleKo : slide.titleEn}
            </h1>
            <p className="text-sm text-white/60 mt-3 max-w-md mx-auto animate-fade-in-up stagger-1"
               key={`sub-${heroIndex}`}>
              {lang === 'ko' ? slide.subtitleKo : slide.subtitleEn}
            </p>

            <div className="flex items-center justify-center gap-3 mt-8 animate-fade-in-up stagger-2">
              <button onClick={() => setView('menu')}
                className="px-8 py-3.5 rounded-2xl text-sm font-bold text-black transition-all duration-500 ease-premium hover:scale-[1.04] active:scale-[0.97]"
                style={{ backgroundColor: 'var(--color-gold)' }}>
                <span className="flex items-center gap-2">
                  <Icon icon="solar:book-2-bold-duotone" width={18} />
                  {t('메뉴 보기', 'Browse Menu')}
                </span>
              </button>
              <button onClick={() => {}}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold text-white/80 border transition-all duration-500 ease-premium hover:scale-[1.04] active:scale-[0.97]"
                style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <span className="flex items-center gap-2">
                  <Icon icon="solar:bell-bold-duotone" width={16} style={{ color: 'var(--color-gold)' }} />
                  {t('직원 호출', 'Call Staff')}
                </span>
              </button>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setHeroIndex(i)}
                className="transition-all duration-500 rounded-full"
                style={{
                  width: heroIndex === i ? 24 : 6, height: 6,
                  backgroundColor: heroIndex === i ? 'var(--color-gold)' : 'rgba(255,255,255,0.25)',
                }} />
            ))}
          </div>
        </section>

        {/* Category Cards */}
        <section className="px-6 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white tracking-tight">{t('메뉴 카테고리', 'Menu Categories')}</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button key={cat.name} onClick={() => setView('menu')}
                className="group rounded-2xl overflow-hidden relative aspect-[3/2] transition-all duration-500 ease-premium hover:scale-[1.03] active:scale-[0.97] animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}>
                <img src={cat.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <Icon icon={cat.icon} width={18} className="mb-1" style={{ color: 'var(--color-gold)' }} />
                  <p className="font-bold text-white text-sm">{lang === 'ko' ? cat.name : cat.nameEn}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Popular Menu */}
        <section className="px-6 py-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('인기 메뉴', 'Popular Menu')}</h2>
              <p className="text-xs text-white/40 mt-1">{t('고객이 가장 많이 찾는 메뉴', 'Our most loved dishes')}</p>
            </div>
            <button onClick={() => setView('menu')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300"
              style={{ color: 'var(--color-gold)', backgroundColor: 'rgba(196,146,58,0.1)' }}>
              {t('전체보기', 'View All')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {POPULAR_MENU.map((item, i) => (
              <button key={item.name} onClick={() => setView('menu')}
                className="group rounded-2xl overflow-hidden text-left transition-all duration-500 ease-premium hover:scale-[1.03] active:scale-[0.97] animate-fade-in-up"
                style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${i * 0.06}s` }}>
                <div className="aspect-square overflow-hidden relative">
                  <img src={item.image} alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md text-black"
                    style={{ backgroundColor: 'var(--color-gold)' }}>
                    {t('인기', 'BEST')}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  <p className="text-[11px] text-white/40">{item.nameEn}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>₱{item.price}</span>
                    <div className="flex items-center gap-1">
                      <Icon icon="solar:star-bold" width={11} style={{ color: 'var(--color-gold)' }} />
                      <span className="text-[11px] text-white/50 tabular-nums">{item.rating}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* How to Order */}
        <section className="px-6 py-10">
          <h2 className="text-xl font-bold text-white tracking-tight text-center mb-2">{t('주문 방법', 'How to Order')}</h2>
          <p className="text-xs text-white/40 text-center mb-8">{t('간편한 3단계로 주문하세요', 'Order in 3 simple steps')}</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: 1, icon: 'solar:book-2-bold-duotone', titleKo: '메뉴 선택', titleEn: 'Browse Menu', descKo: '다양한 한식 메뉴를 둘러보세요', descEn: 'Explore our Korean dishes' },
              { step: 2, icon: 'solar:bag-3-bold-duotone', titleKo: '장바구니 담기', titleEn: 'Add to Cart', descKo: '원하는 메뉴와 수량을 선택하세요', descEn: 'Select items and quantities' },
              { step: 3, icon: 'solar:check-circle-bold-duotone', titleKo: '주문 확인', titleEn: 'Place Order', descKo: '주문 후 직원이 직접 서빙합니다', descEn: 'Our staff will serve your table' },
            ].map((s, i) => (
              <div key={s.step}
                className="rounded-2xl p-5 text-center animate-fade-in-up"
                style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(196,146,58,0.1)' }}>
                  <Icon icon={s.icon} width={24} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div className="w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-[11px] font-bold"
                  style={{ backgroundColor: 'var(--color-gold)', color: '#000' }}>
                  {s.step}
                </div>
                <h3 className="font-bold text-white text-sm">{lang === 'ko' ? s.titleKo : s.titleEn}</h3>
                <p className="text-[11px] text-white/40 mt-1">{lang === 'ko' ? s.descKo : s.descEn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Restaurant Story */}
        <section className="px-6 py-10">
          <div className="rounded-3xl overflow-hidden relative"
            style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="grid grid-cols-2">
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-px" style={{ backgroundColor: 'var(--color-gold)' }} />
                  <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--color-gold)' }}>OUR STORY</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
                  {t('한국인이 직접 서빙하는\n진정한 K-Food 경험', 'Authentic K-Food\nServed by Korean Staff')}
                </h2>
                <p className="text-xs text-white/50 leading-relaxed mb-5">
                  {t(
                    '강원은 한국 강원도의 청정 자연에서 영감을 받은 프리미엄 한식 레스토랑입니다. 한국인 셰프가 직접 조리하고, 한국인 직원이 음식 문화를 전달하며 서빙합니다. 단순한 식사가 아닌, 진정한 K-Food 체험을 선사합니다.',
                    'Kangwon is a premium Korean restaurant inspired by the pristine nature of Gangwon-do. Our Korean chefs cook every dish, and Korean staff serve your table while sharing the culture behind each meal.'
                  )}
                </p>
                <div className="flex gap-6">
                  {[
                    { value: '26+', label: t('메뉴', 'Menu Items') },
                    { value: '4.8', label: t('평점', 'Rating') },
                    { value: '100%', label: t('한국인 셰프', 'Korean Chefs') },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className="text-xl font-bold" style={{ color: 'var(--color-gold)' }}>{stat.value}</p>
                      <p className="text-[10px] text-white/40">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img src="https://readdy.ai/api/search-image?query=Korean%20chef%20in%20professional%20kitchen%20preparing%20traditional%20Korean%20dishes%20with%20passion%20and%20precision%20warm%20lighting%20authentic%20atmosphere%20professional%20photography&width=600&height=500&seq=chef1&orientation=landscape" alt=""
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #141414 0%, transparent 30%)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="px-6 py-8 text-center">
          <button onClick={() => setView('menu')}
            className="px-10 py-4 rounded-2xl text-base font-bold text-black transition-all duration-500 ease-premium hover:scale-[1.04] active:scale-[0.97]"
            style={{ backgroundColor: 'var(--color-gold)' }}>
            <span className="flex items-center gap-2">
              <Icon icon="solar:book-2-bold-duotone" width={20} />
              {t('지금 주문하기', 'Order Now')}
            </span>
          </button>
        </section>

        {/* Footer Info */}
        <footer className="px-6 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="solar:chef-hat-heart-bold-duotone" width={18} style={{ color: 'var(--color-gold)' }} />
                <span className="font-bold text-white text-sm">강원 KANGWON</span>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed">
                {t('강원도의 청정 자연, 그 순수한 맛을 마닐라에서 만나보세요.', 'Experience the pure taste of Gangwon-do right here in Manila.')}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white/50 mb-2 tracking-wider">HOURS</p>
              <p className="text-[11px] text-white/30">{t('월-금', 'Mon-Fri')} 11:00 AM - 10:00 PM</p>
              <p className="text-[11px] text-white/30">{t('토-일', 'Sat-Sun')} 10:00 AM - 11:00 PM</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white/50 mb-2 tracking-wider">CONTACT</p>
              <p className="text-[11px] text-white/30">Manila, Philippines</p>
              <p className="text-[11px] text-white/30">kangwonfood@ican.ph</p>
            </div>
          </div>
          <div className="mt-6 pt-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[10px] text-white/20">Table {tableNumber} · 강원푸드 iCAN Platform</p>
          </div>
        </footer>
      </div>
    );
  }

  // --- Menu ---
  if (view === 'menu') {
    return (
      <MenuBrowser lang={lang} cart={cart} onAddToCart={addToCart}
        onViewCart={() => setView('cart')} onBack={() => setView('welcome')}
        cartItemCount={cart.reduce((sum, c) => sum + c.quantity, 0)} />
    );
  }

  // --- Cart ---
  if (view === 'cart') {
    return (
      <Cart lang={lang} items={cart} onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart} onBack={() => setView('menu')}
        onOrder={(id) => { setOrderId(id); setCart([]); setView('order_status'); }}
        tableNumber={tableNumber} />
    );
  }

  // --- Order Status ---
  if (view === 'order_status' && orderId) {
    return (
      <OrderStatus orderId={orderId} lang={lang}
        onAddMore={() => setView('menu')} onFeedback={() => setView('feedback')} />
    );
  }

  // --- Feedback ---
  if (view === 'feedback') {
    return (
      <FeedbackForm orderId={orderId!} lang={lang}
        onComplete={() => { setOrderId(null); setView('welcome'); }} />
    );
  }

  return null;
}
