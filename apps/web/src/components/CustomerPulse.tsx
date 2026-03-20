'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api, type RFMData, type SentimentTimelineData, type FeedbackStats } from '../lib/api';

const SEGMENT_CONFIG: Record<string, { label: string; icon: string; color: string; dimColor: string; desc: string }> = {
  vip: { label: 'VIP', icon: 'solar:crown-bold', color: 'var(--w-warning)', dimColor: 'var(--w-warning-dim)', desc: '빈번한 방문 + 높은 소비' },
  loyal: { label: '충성 고객', icon: 'solar:diamond-bold', color: 'var(--w-info)', dimColor: 'var(--w-info-dim)', desc: '꾸준한 방문' },
  regular: { label: '일반 고객', icon: 'solar:user-check-bold', color: 'var(--w-success)', dimColor: 'var(--w-success-dim)', desc: '보통 빈도 방문' },
  new: { label: '신규 고객', icon: 'solar:user-plus-bold', color: 'var(--w-purple)', dimColor: 'var(--w-purple-dim)', desc: '최근 첫 방문' },
  at_risk: { label: '이탈 위험', icon: 'solar:danger-triangle-bold', color: 'var(--w-warning)', dimColor: 'var(--w-warning-dim)', desc: '방문 감소 추세' },
  dormant: { label: '이탈 고객', icon: 'solar:sleeping-bold', color: 'var(--w-danger)', dimColor: 'var(--w-danger-dim)', desc: '60일 이상 미방문' },
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
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--w-text)' }}>Customer Pulse</h2>
        <p className="mt-1" style={{ color: 'var(--w-text-muted)' }}>고객 세그먼트 · 감성 분석 · 만족도 추적</p>
      </div>

      {/* 상단 요약 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="총 고객 수"
          value={rfm?.totalCustomers?.toString() ?? '0'}
          sublabel="명"
          icon="solar:users-group-rounded-bold"
          color="var(--w-info)"
          dimColor="var(--w-info-dim)"
        />
        <SummaryCard
          label="평균 평점"
          value={feedbackStats?.avgRating?.toString() ?? '-'}
          sublabel={`/ 5.0 (${feedbackStats?.totalCount ?? 0}건)`}
          icon="solar:star-bold"
          color="var(--w-warning)"
          dimColor="var(--w-warning-dim)"
        />
        <SummaryCard
          label="긍정 리뷰"
          value={feedbackStats ? `${Math.round(((feedbackStats.rating5 + feedbackStats.rating4) / (feedbackStats.totalCount || 1)) * 100)}%` : '-'}
          sublabel="4점 이상"
          icon="solar:heart-bold"
          color="var(--w-success)"
          dimColor="var(--w-success-dim)"
        />
        <SummaryCard
          label="긴급 대응"
          value={sentiment?.criticalFeedbacks?.length?.toString() ?? '0'}
          sublabel="미해결 부정 리뷰"
          icon="solar:danger-triangle-bold"
          color="var(--w-danger)"
          dimColor="var(--w-danger-dim)"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* RFM 세그먼트 분포 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
            <Icon icon="solar:users-group-rounded-bold" width={18} style={{ color: 'var(--w-info)' }} />
            고객 세그먼트 (RFM)
          </h3>
          <div className="space-y-3">
            {rfm?.segments && rfm.segments.length > 0 ? rfm.segments.map(seg => {
              const config = SEGMENT_CONFIG[seg.segment] ?? SEGMENT_CONFIG.regular;
              const total = rfm.totalCustomers || 1;
              const percent = Math.round((seg.count / total) * 100);
              return (
                <div key={seg.segment} className="flex items-center gap-3">
                  <span
                    className="px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1"
                    style={{ background: config.dimColor, color: config.color, borderColor: config.color }}
                  >
                    <Icon icon={config.icon} width={12} /> {config.label}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--w-text-dim)' }}>{seg.count}명 ({percent}%)</span>
                      <span style={{ color: 'var(--w-text-muted)' }}>평균 ₱{Number(seg.avgSpent).toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--w-bg)' }}>
                      <div className="h-full rounded-full ease-premium" style={{ width: `${percent}%`, background: config.color }} />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>고객 데이터 수집 중...</p>
            )}
          </div>
        </div>

        {/* 평점 분포 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
            <Icon icon="solar:star-bold" width={18} style={{ color: 'var(--w-warning)' }} />
            평점 분포
          </h3>
          {feedbackStats && feedbackStats.totalCount > 0 ? (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = feedbackStats[`rating${rating}` as keyof FeedbackStats] as number;
                const percent = Math.round((count / feedbackStats.totalCount) * 100);
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-4" style={{ color: 'var(--w-text-dim)' }}>{rating}</span>
                    <Icon icon="solar:star-bold" width={14} style={{ color: 'var(--w-warning)' }} />
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--w-bg)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          background: rating >= 4 ? 'var(--w-success)' : rating === 3 ? 'var(--w-warning)' : 'var(--w-danger)',
                        }}
                      />
                    </div>
                    <span className="text-sm w-16 text-right" style={{ color: 'var(--w-text-dim)' }}>{count}건 ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>피드백 데이터 수집 중...</p>
          )}
        </div>
      </div>

      {/* 감성 타임라인 */}
      <div className="rounded-2xl p-6 border mb-6" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
        <h3 className="font-bold mb-4" style={{ color: 'var(--w-text)' }}>감성 분석 타임라인 (최근 14일)</h3>
        {sentiment?.timeline && sentiment.timeline.length > 0 ? (
          <div className="flex items-end gap-2 h-32">
            {sentiment.timeline.map(day => {
              const maxCount = Math.max(...sentiment.timeline.map(d => d.count), 1);
              const height = (day.count / maxCount) * 100;
              const color = day.avgRating >= 4 ? 'var(--w-success)' : day.avgRating >= 3 ? 'var(--w-warning)' : 'var(--w-danger)';
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full rounded-t ease-premium" style={{ height: `${height}%`, background: color }} />
                  <span className="text-[9px]" style={{ color: 'var(--w-text-muted)' }}>{day.date.slice(5)}</span>
                  <div
                    className="hidden group-hover:block absolute -top-16 text-xs rounded-lg p-2 whitespace-nowrap z-10"
                    style={{ background: 'var(--w-elevated)', color: 'var(--w-text)', border: '1px solid var(--w-border)' }}
                  >
                    {day.date} · 평점 {day.avgRating} · {day.count}건
                    <br />긍정 {day.positive} · 부정 {day.negative}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm" style={{ color: 'var(--w-text-muted)' }}>
            피드백 데이터가 쌓이면 타임라인이 표시됩니다
          </div>
        )}
      </div>

      {/* 긴급 대응 필요 리뷰 */}
      {sentiment?.criticalFeedbacks && sentiment.criticalFeedbacks.length > 0 && (
        <div className="rounded-2xl p-6 border mb-6" style={{ background: 'var(--w-danger-dim)', borderColor: 'var(--w-danger)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--w-danger)' }}>
            <Icon icon="solar:danger-triangle-bold" width={18} />
            긴급 대응 필요 ({sentiment.criticalFeedbacks.length}건)
          </h3>
          <div className="space-y-3">
            {sentiment.criticalFeedbacks.map((fb: any) => (
              <div key={fb.id} className="rounded-xl p-4 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon
                        key={i}
                        icon="solar:star-bold"
                        width={14}
                        style={{ color: i < fb.rating ? 'var(--w-danger)' : 'var(--w-border)' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--w-text-muted)' }}>{new Date(fb.createdAt).toLocaleDateString('ko')}</span>
                </div>
                {fb.comment && <p className="text-sm" style={{ color: 'var(--w-text-dim)' }}>{fb.comment}</p>}
                <button className="mt-2 text-xs font-medium" style={{ color: 'var(--w-danger)' }}>
                  대응 기록 →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 리뷰 */}
      <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
          <Icon icon="solar:chat-round-dots-bold" width={18} style={{ color: 'var(--w-info)' }} />
          최근 피드백
        </h3>
        <div className="space-y-3">
          {recentFeedbacks.length > 0 ? recentFeedbacks.slice(0, 10).map((fb: any) => (
            <div key={fb.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--w-bg)' }}>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    icon="solar:star-bold"
                    width={12}
                    style={{ color: i < fb.rating ? 'var(--w-warning)' : 'var(--w-border)' }}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: 'var(--w-text-dim)' }}>{fb.comment || '(코멘트 없음)'}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--w-text-muted)' }}>{new Date(fb.createdAt).toLocaleString('ko')}</p>
              </div>
              {fb.sentiment && (
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: fb.sentiment === 'positive' || fb.sentiment === 'very_positive'
                      ? 'var(--w-success-dim)' : fb.sentiment === 'negative' || fb.sentiment === 'very_negative'
                      ? 'var(--w-danger-dim)' : 'var(--w-surface)',
                    color: fb.sentiment === 'positive' || fb.sentiment === 'very_positive'
                      ? 'var(--w-success)' : fb.sentiment === 'negative' || fb.sentiment === 'very_negative'
                      ? 'var(--w-danger)' : 'var(--w-text-dim)',
                  }}
                >
                  {fb.sentiment}
                </span>
              )}
            </div>
          )) : (
            <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>아직 피드백이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sublabel, icon, color, dimColor }: {
  label: string; value: string; sublabel: string; icon: string;
  color: string; dimColor: string;
}) {
  return (
    <div className="rounded-2xl p-5 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm" style={{ color: 'var(--w-text-muted)' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: dimColor }}>
          <Icon icon={icon} width={20} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--w-text-muted)' }}>{sublabel}</p>
    </div>
  );
}
