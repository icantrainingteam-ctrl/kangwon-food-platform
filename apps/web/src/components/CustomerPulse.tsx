'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Star, AlertTriangle, Heart, MessageCircle } from 'lucide-react';
import { api, type RFMData, type SentimentTimelineData, type FeedbackStats } from '../lib/api';

const SEGMENT_CONFIG: Record<string, { label: string; emoji: string; color: string; desc: string }> = {
  vip: { label: 'VIP', emoji: '👑', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', desc: '빈번한 방문 + 높은 소비' },
  loyal: { label: '충성 고객', emoji: '💎', color: 'bg-blue-100 text-blue-800 border-blue-300', desc: '꾸준한 방문' },
  regular: { label: '일반 고객', emoji: '😊', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: '보통 빈도 방문' },
  new: { label: '신규 고객', emoji: '🆕', color: 'bg-purple-100 text-purple-800 border-purple-300', desc: '최근 첫 방문' },
  at_risk: { label: '이탈 위험', emoji: '⚠️', color: 'bg-orange-100 text-orange-800 border-orange-300', desc: '방문 감소 추세' },
  dormant: { label: '이탈 고객', emoji: '💤', color: 'bg-red-100 text-red-800 border-red-300', desc: '60일 이상 미방문' },
};

export function CustomerPulse() {
  const [rfm, setRFM] = useState<RFMData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentTimelineData | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    api.getRFMSegments().then(setRFM).catch(() => {});
    api.getSentimentTimeline(14).then(setSentiment).catch(() => {});
    api.getFeedbackStats().then(setFeedbackStats).catch(() => {});
    api.getRecentFeedbacks().then(setRecentFeedbacks).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Customer Pulse</h2>
        <p className="text-slate-500 mt-1">고객 세그먼트 · 감성 분석 · 만족도 추적</p>
      </div>

      {/* 상단 요약 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="총 고객 수"
          value={rfm?.totalCustomers?.toString() ?? '0'}
          sublabel="명"
          icon={<Users size={20} />}
          color="blue"
        />
        <SummaryCard
          label="평균 평점"
          value={feedbackStats?.avgRating?.toString() ?? '-'}
          sublabel={`/ 5.0 (${feedbackStats?.totalCount ?? 0}건)`}
          icon={<Star size={20} />}
          color="yellow"
        />
        <SummaryCard
          label="긍정 리뷰"
          value={feedbackStats ? `${Math.round(((feedbackStats.rating5 + feedbackStats.rating4) / (feedbackStats.totalCount || 1)) * 100)}%` : '-'}
          sublabel="4점 이상"
          icon={<Heart size={20} />}
          color="emerald"
        />
        <SummaryCard
          label="긴급 대응"
          value={sentiment?.criticalFeedbacks?.length?.toString() ?? '0'}
          sublabel="미해결 부정 리뷰"
          icon={<AlertTriangle size={20} />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* RFM 세그먼트 분포 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            고객 세그먼트 (RFM)
          </h3>
          <div className="space-y-3">
            {rfm?.segments && rfm.segments.length > 0 ? rfm.segments.map(seg => {
              const config = SEGMENT_CONFIG[seg.segment] ?? SEGMENT_CONFIG.regular;
              const total = rfm.totalCustomers || 1;
              const percent = Math.round((seg.count / total) * 100);
              return (
                <div key={seg.segment} className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                    {config.emoji} {config.label}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{seg.count}명 ({percent}%)</span>
                      <span className="text-slate-400">평균 ₱{Number(seg.avgSpent).toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-400">고객 데이터 수집 중...</p>
            )}
          </div>
        </div>

        {/* 평점 분포 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            평점 분포
          </h3>
          {feedbackStats && feedbackStats.totalCount > 0 ? (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = feedbackStats[`rating${rating}` as keyof FeedbackStats] as number;
                const percent = Math.round((count / feedbackStats.totalCount) * 100);
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 w-4">{rating}</span>
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rating >= 4 ? 'bg-emerald-400' : rating === 3 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-16 text-right">{count}건 ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">피드백 데이터 수집 중...</p>
          )}
        </div>
      </div>

      {/* 감성 타임라인 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">감성 분석 타임라인 (최근 14일)</h3>
        {sentiment?.timeline && sentiment.timeline.length > 0 ? (
          <div className="flex items-end gap-2 h-32">
            {sentiment.timeline.map(day => {
              const maxCount = Math.max(...sentiment.timeline.map(d => d.count), 1);
              const height = (day.count / maxCount) * 100;
              const color = day.avgRating >= 4 ? 'bg-emerald-400' : day.avgRating >= 3 ? 'bg-yellow-400' : 'bg-red-400';
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className={`w-full ${color} rounded-t transition-all`} style={{ height: `${height}%` }} />
                  <span className="text-[9px] text-slate-400">{day.date.slice(5)}</span>
                  <div className="hidden group-hover:block absolute -top-16 bg-slate-900 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10">
                    {day.date} · 평점 {day.avgRating} · {day.count}건
                    <br />긍정 {day.positive} · 부정 {day.negative}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
            피드백 데이터가 쌓이면 타임라인이 표시됩니다
          </div>
        )}
      </div>

      {/* 긴급 대응 필요 리뷰 */}
      {sentiment?.criticalFeedbacks && sentiment.criticalFeedbacks.length > 0 && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200 mb-6">
          <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} />
            긴급 대응 필요 ({sentiment.criticalFeedbacks.length}건)
          </h3>
          <div className="space-y-3">
            {sentiment.criticalFeedbacks.map((fb: any) => (
              <div key={fb.id} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < fb.rating ? 'text-red-400 fill-red-400' : 'text-slate-200'} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleDateString('ko')}</span>
                </div>
                {fb.comment && <p className="text-sm text-slate-700">{fb.comment}</p>}
                <button className="mt-2 text-xs text-red-600 font-medium hover:underline">
                  대응 기록 →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 리뷰 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageCircle size={18} className="text-blue-500" />
          최근 피드백
        </h3>
        <div className="space-y-3">
          {recentFeedbacks.length > 0 ? recentFeedbacks.slice(0, 10).map((fb: any) => (
            <div key={fb.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700">{fb.comment || '(코멘트 없음)'}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(fb.createdAt).toLocaleString('ko')}</p>
              </div>
              {fb.sentiment && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  fb.sentiment === 'positive' || fb.sentiment === 'very_positive'
                    ? 'bg-emerald-100 text-emerald-700'
                    : fb.sentiment === 'negative' || fb.sentiment === 'very_negative'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {fb.sentiment}
                </span>
              )}
            </div>
          )) : (
            <p className="text-sm text-slate-400">아직 피드백이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sublabel, icon, color }: {
  label: string; value: string; sublabel: string; icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'emerald' | 'red';
}) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
  };
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className={`text-2xl font-bold ${colorMap[color].split(' ')[0]}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sublabel}</p>
    </div>
  );
}
