'use client';

import { useState, useEffect } from 'react';
import { Clock, ChefHat, CheckCircle2, Truck, Plus } from 'lucide-react';
import type { Language } from '@kangwon/shared';

interface OrderStatusProps {
  orderId: string;
  lang: Language;
  onAddMore: () => void;
  onFeedback: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const STATUS_STEPS = [
  { key: 'confirmed', icon: CheckCircle2, ko: '주문 접수', en: 'Confirmed' },
  { key: 'preparing', icon: ChefHat, ko: '조리 중', en: 'Preparing' },
  { key: 'ready', icon: Truck, ko: '서빙 준비', en: 'Ready' },
  { key: 'served', icon: CheckCircle2, ko: '서빙 완료', en: 'Served' },
];

export function OrderStatus({ orderId, lang, onAddMore, onFeedback }: OrderStatusProps) {
  const [status, setStatus] = useState('confirmed');
  const [elapsed, setElapsed] = useState(0);

  // SSE 실시간 업데이트 구독
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

  // 경과 시간 카운터
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === status);
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-8">
      {/* 메인 상태 */}
      <div className="text-center mb-8">
        {status === 'preparing' && (
          <div className="text-6xl mb-4 animate-bounce">👨‍🍳</div>
        )}
        {status === 'confirmed' && (
          <div className="text-6xl mb-4">✅</div>
        )}
        {status === 'ready' && (
          <div className="text-6xl mb-4 animate-pulse">🔔</div>
        )}
        {status === 'served' && (
          <div className="text-6xl mb-4">🎉</div>
        )}

        <h2 className="text-2xl font-bold text-slate-800">
          {STATUS_STEPS[currentStepIndex]?.[lang === 'ko' ? 'ko' : 'en']}
        </h2>

        <div className="flex items-center justify-center gap-2 mt-3 text-slate-500">
          <Clock size={16} />
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* 진행 단계 */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i <= currentStepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'text-orange-600 font-medium' : 'text-slate-400'}`}>
                  {lang === 'ko' ? step.ko : step.en}
                </span>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 w-full mt-0 ${isActive ? 'bg-orange-500' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 서빙 안내 메시지 */}
      {status === 'ready' && (
        <div className="bg-orange-100 border border-orange-300 rounded-2xl p-4 text-center mb-6 animate-pulse">
          <p className="text-orange-700 font-bold">
            {lang === 'ko'
              ? '🙋 한국인 직원이 곧 서빙해드립니다!'
              : '🙋 Our Korean staff will serve you shortly!'}
          </p>
        </div>
      )}

      {status === 'served' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-center mb-6">
          <p className="text-emerald-700 font-bold">
            {lang === 'ko'
              ? '🥢 맛있게 드세요! 반찬 리필은 직원에게 말씀해주세요.'
              : '🥢 Enjoy your meal! Ask our staff for side dish refills.'}
          </p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="w-full max-w-sm space-y-3">
        {status !== 'served' && (
          <button
            onClick={onAddMore}
            className="w-full py-4 bg-white border-2 border-orange-300 text-orange-600 font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {lang === 'ko' ? '추가 주문' : 'Add More Items'}
          </button>
        )}

        {status === 'served' && (
          <button
            onClick={onFeedback}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl"
          >
            {lang === 'ko' ? '⭐ 리뷰 남기기' : '⭐ Leave a Review'}
          </button>
        )}
      </div>
    </div>
  );
}
