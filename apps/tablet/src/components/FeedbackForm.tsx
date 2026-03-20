'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {lang === 'ko' ? '감사합니다!' : 'Thank you!'}
        </h2>
        <p className="text-slate-600 mb-4">
          {lang === 'ko'
            ? '다음 방문 시 사용 가능한 할인 쿠폰이 발급되었습니다.'
            : 'A discount coupon has been issued for your next visit.'}
        </p>
        <div className="bg-white border-2 border-dashed border-orange-300 rounded-xl p-4 mt-2">
          <p className="text-orange-600 font-bold text-lg">
            {rating >= 4 ? '10% OFF' : '5% OFF'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ko' ? '다음 방문 시 · 30일 유효' : 'Next visit · Valid 30 days'}
          </p>
        </div>
        <p className="mt-8 text-sm text-slate-400">
          {lang === 'ko' ? '강원에 또 오세요! 👋' : 'See you again at Kangwon! 👋'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        {lang === 'ko' ? '식사는 어떠셨나요?' : 'How was your meal?'}
      </h2>
      <p className="text-slate-500 mb-8">
        {lang === 'ko' ? '별점을 눌러주세요' : 'Tap to rate'}
      </p>

      {/* 별점 */}
      <div className="flex gap-3 mb-8">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="transition-transform active:scale-110"
          >
            <Star
              size={48}
              className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
            />
          </button>
        ))}
      </div>

      {/* 한줄 리뷰 */}
      {rating > 0 && (
        <div className="w-full max-w-md animate-fade-in">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={lang === 'ko' ? '한 줄 리뷰를 남겨주세요 (선택)' : 'Leave a quick review (optional)'}
            className="w-full p-4 border border-slate-200 rounded-xl text-sm resize-none h-24 mb-4"
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white text-lg font-bold rounded-2xl"
          >
            {isSubmitting
              ? (lang === 'ko' ? '제출 중...' : 'Submitting...')
              : (lang === 'ko' ? '제출하기' : 'Submit')}
          </button>
        </div>
      )}

      <button onClick={onComplete} className="mt-6 text-slate-400 text-sm">
        {lang === 'ko' ? '건너뛰기' : 'Skip'}
      </button>
    </div>
  );
}
