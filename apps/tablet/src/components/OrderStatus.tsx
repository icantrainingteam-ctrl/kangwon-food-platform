'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import type { Language } from '@kangwon/shared';

interface OrderStatusProps {
  orderId: string;
  lang: Language;
  onAddMore: () => void;
  onFeedback: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const STATUS_STEPS = [
  { key: 'confirmed', icon: 'solar:check-circle-bold-duotone', ko: '주문 접수', en: 'Confirmed' },
  { key: 'preparing', icon: 'solar:chef-hat-bold-duotone', ko: '조리 중', en: 'Preparing' },
  { key: 'ready', icon: 'solar:bell-bing-bold-duotone', ko: '서빙 준비', en: 'Ready' },
  { key: 'served', icon: 'solar:heart-bold-duotone', ko: '서빙 완료', en: 'Served' },
];

export function OrderStatus({ orderId, lang, onAddMore, onFeedback }: OrderStatusProps) {
  const [status, setStatus] = useState('confirmed');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/ws?role=tablet`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.payload?.orderId === orderId) {
          if (data.type === 'order:preparing') setStatus('preparing');
          if (data.type === 'order:ready') setStatus('ready');
          if (data.type === 'order:served') setStatus('served');
        }
      } catch { /* ignore */ }
    };
    return () => eventSource.close();
  }, [orderId]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === status);
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
         style={{ backgroundColor: 'var(--color-surface)' }}>

      {/* Decorative background circles */}
      <div className="absolute top-20 left-10 w-40 h-40 rounded-full opacity-[0.03] animate-float"
           style={{ backgroundColor: 'var(--color-gold)' }} />
      <div className="absolute bottom-32 right-8 w-28 h-28 rounded-full opacity-[0.04] animate-float"
           style={{ backgroundColor: 'var(--color-primary)', animationDelay: '1.5s' }} />

      {/* Main Status Indicator */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6"
             style={{ backgroundColor: status === 'served' ? '#ecfdf5' : 'var(--color-gold-light)' }}>
          {status === 'preparing' && (
            <div className="absolute inset-0 rounded-3xl animate-pulse"
                 style={{ backgroundColor: 'var(--color-gold-light)', opacity: 0.5 }} />
          )}
          {status === 'ready' && (
            <div className="absolute -inset-2 rounded-[28px] border-2 animate-ping opacity-20"
                 style={{ borderColor: 'var(--color-gold)' }} />
          )}
          <Icon icon={STATUS_STEPS[currentStepIndex]?.icon ?? 'solar:check-circle-bold-duotone'}
                width={44}
                className="relative z-10"
                style={{ color: status === 'served' ? '#10b981' : 'var(--color-gold)' }} />
        </div>

        <h2 className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}>
          {STATUS_STEPS[currentStepIndex]?.[lang === 'ko' ? 'ko' : 'en']}
        </h2>

        <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full"
             style={{ backgroundColor: 'var(--color-surface-warm)' }}>
          <Icon icon="solar:clock-circle-linear" width={14} style={{ color: 'var(--color-text-tertiary)' }} />
          <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="w-full max-w-xs mb-10 animate-fade-in-up stagger-2">
        <div className="flex items-start justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-5 right-5 h-0.5"
               style={{ backgroundColor: 'var(--color-border-light)' }}>
            <div className="h-full transition-all duration-700 ease-premium rounded-full"
                 style={{
                   backgroundColor: 'var(--color-gold)',
                   width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                 }} />
          </div>

          {STATUS_STEPS.map((step, i) => {
            const isActive = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: '25%' }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-premium ${isCurrent ? 'scale-110' : ''}`}
                     style={{
                       backgroundColor: isActive ? 'var(--color-gold-light)' : 'var(--color-surface-warm)',
                       border: isCurrent ? '2px solid var(--color-gold)' : '1px solid transparent',
                     }}>
                  <Icon icon={step.icon} width={18}
                        style={{ color: isActive ? 'var(--color-gold)' : 'var(--color-border)' }} />
                </div>
                <span className="text-[10px] mt-2 text-center font-medium leading-tight"
                      style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                  {lang === 'ko' ? step.ko : step.en}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Messages */}
      {status === 'ready' && (
        <div className="rounded-2xl p-5 text-center mb-6 animate-fade-in-up"
             style={{ backgroundColor: 'var(--color-gold-light)', border: '1px solid var(--color-gold)' }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon icon="solar:hand-stars-bold-duotone" width={20} style={{ color: 'var(--color-gold)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {lang === 'ko' ? '곧 서빙됩니다' : 'Coming right up!'}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {lang === 'ko'
              ? '한국인 직원이 직접 서빙해드립니다'
              : 'Our Korean staff will serve you shortly'}
          </p>
        </div>
      )}

      {status === 'served' && (
        <div className="rounded-2xl p-5 text-center mb-6 animate-fade-in-up"
             style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon icon="solar:heart-bold-duotone" width={20} style={{ color: '#10b981' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {lang === 'ko' ? '맛있게 드세요' : 'Enjoy your meal!'}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {lang === 'ko'
              ? '반찬 리필은 직원에게 말씀해주세요'
              : 'Ask our staff for side dish refills'}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full max-w-xs space-y-3 animate-fade-in-up stagger-3">
        {status !== 'served' && (
          <button
            onClick={onAddMore}
            className="w-full py-4 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <Icon icon="solar:add-circle-bold-duotone" width={18} style={{ color: 'var(--color-gold)' }} />
            {lang === 'ko' ? '추가 주문' : 'Add More Items'}
          </button>
        )}

        {status === 'served' && (
          <button
            onClick={onFeedback}
            className="w-full py-4 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-text-primary)' }}
          >
            <Icon icon="solar:star-bold-duotone" width={18} style={{ color: 'var(--color-gold)' }} />
            {lang === 'ko' ? '리뷰 남기기' : 'Leave a Review'}
          </button>
        )}
      </div>
    </div>
  );
}
