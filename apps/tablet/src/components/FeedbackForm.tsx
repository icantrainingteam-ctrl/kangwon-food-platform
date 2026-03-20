'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { Language } from '@kangwon/shared';

interface FeedbackFormProps {
  orderId: string;
  lang: Language;
  onComplete: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function FeedbackForm({ orderId, lang, onComplete }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, rating, comment: comment || undefined }),
      });
      setIsComplete(true);
      setTimeout(onComplete, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
           style={{ backgroundColor: 'var(--color-surface)' }}>
        {/* Decorative */}
        <div className="absolute top-16 right-12 w-24 h-24 rounded-full opacity-[0.04] animate-float"
             style={{ backgroundColor: '#10b981' }} />

        <div className="animate-fade-in-up">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
               style={{ backgroundColor: '#ecfdf5' }}>
            <Icon icon="solar:gift-bold-duotone" width={40} style={{ color: '#10b981' }} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2"
              style={{ color: 'var(--color-text-primary)' }}>
            {lang === 'ko' ? '감사합니다' : 'Thank you!'}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {lang === 'ko'
              ? '다음 방문 시 사용 가능한 쿠폰이 발급되었습니다'
              : 'A discount coupon has been issued for your next visit.'}
          </p>

          {/* Coupon Card */}
          <div className="rounded-2xl p-5 mx-auto max-w-[240px]"
               style={{ backgroundColor: 'var(--color-card)', border: '2px dashed var(--color-gold)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-gold)' }}>
              {rating >= 4 ? '10% OFF' : '5% OFF'}
            </p>
            <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
              {lang === 'ko' ? '다음 방문 시 · 30일 유효' : 'Next visit · Valid 30 days'}
            </p>
          </div>

          <p className="mt-10 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            {lang === 'ko' ? '강원에 또 오세요' : 'See you again at Kangwon'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
         style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Decorative */}
      <div className="absolute bottom-20 left-8 w-32 h-32 rounded-full opacity-[0.03] animate-float"
           style={{ backgroundColor: 'var(--color-gold)' }} />

      <div className="animate-fade-in-up text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
             style={{ backgroundColor: 'var(--color-gold-light)' }}>
          <Icon icon="solar:chat-round-like-bold-duotone" width={32} style={{ color: 'var(--color-gold)' }} />
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: 'var(--color-text-primary)' }}>
          {lang === 'ko' ? '식사는 어떠셨나요?' : 'How was your meal?'}
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
          {lang === 'ko' ? '별점을 눌러주세요' : 'Tap to rate'}
        </p>
      </div>

      {/* Stars */}
      <div className="flex gap-2 mb-10 animate-fade-in-up stagger-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="transition-all duration-300 ease-premium hover:scale-110 active:scale-90"
          >
            <Icon
              icon={star <= rating ? 'solar:star-bold' : 'solar:star-linear'}
              width={44}
              style={{ color: star <= rating ? '#f59e0b' : 'var(--color-border)' }}
            />
          </button>
        ))}
      </div>

      {/* Review Input */}
      {rating > 0 && (
        <div className="w-full max-w-md animate-fade-in-up">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={lang === 'ko' ? '한 줄 리뷰를 남겨주세요 (선택)' : 'Leave a quick review (optional)'}
            className="w-full p-4 rounded-2xl text-sm resize-none h-24 mb-4 focus:outline-none focus:ring-2 transition-all duration-300"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border-light)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 text-white text-base font-bold rounded-2xl transition-all duration-500 ease-premium hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-text-primary)' }}
          >
            {isSubmitting
              ? <span className="flex items-center justify-center gap-2">
                  <Icon icon="solar:refresh-bold" width={18} className="animate-spin" />
                  {lang === 'ko' ? '제출 중' : 'Submitting...'}
                </span>
              : <span className="flex items-center justify-center gap-2">
                  <Icon icon="solar:check-circle-bold" width={20} />
                  {lang === 'ko' ? '제출하기' : 'Submit'}
                </span>
            }
          </button>
        </div>
      )}

      <button onClick={onComplete}
              className="mt-8 text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-tertiary)' }}>
        {lang === 'ko' ? '건너뛰기' : 'Skip'}
      </button>
    </div>
  );
}
