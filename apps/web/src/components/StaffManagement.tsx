'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api, type StaffPerformanceData } from '../lib/api';
import { SERVING_TRAINING_CHECKLIST } from '@kangwon/shared';

const ROLE_LABELS: Record<string, string> = {
  manager: '점장',
  chef: '셰프',
  server: '서버',
  cashier: '캐셔',
  procurement: '구매 담당',
  marketing: '마케팅',
  part_time: '아르바이트',
};

const GRADE_CONFIG = [
  { min: 0, label: '루키', icon: 'solar:medal-ribbons-star-bold', color: 'var(--w-text-dim)', dimColor: 'var(--w-surface)' },
  { min: 100, label: '프로', icon: 'solar:medal-star-bold', color: 'var(--w-info)', dimColor: 'var(--w-info-dim)' },
  { min: 500, label: '마스터', icon: 'solar:cup-star-bold', color: 'var(--w-warning)', dimColor: 'var(--w-warning-dim)' },
  { min: 1000, label: '소믈리에', icon: 'solar:star-bold', color: 'var(--w-purple)', dimColor: 'var(--w-purple-dim)' },
];

function getGrade(ordersServed: number) {
  for (let i = GRADE_CONFIG.length - 1; i >= 0; i--) {
    if (ordersServed >= GRADE_CONFIG[i].min) return GRADE_CONFIG[i];
  }
  return GRADE_CONFIG[0];
}

export function StaffManagement() {
  const [staffPerf, setStaffPerf] = useState<StaffPerformanceData[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'performance' | 'training'>('performance');

  useEffect(() => {
    api.getStaffPerformance(30).then(setStaffPerf).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--w-text)' }}>직원 관리</h2>
        <p className="mt-1" style={{ color: 'var(--w-text-muted)' }}>서빙 실적 · 등급 시스템 · 교육 관리</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--w-surface)' }}>
        <button
          onClick={() => setActiveTab('performance')}
          className="px-4 py-2 rounded-lg text-sm font-medium ease-premium"
          style={{
            background: activeTab === 'performance' ? 'var(--w-elevated)' : 'transparent',
            color: activeTab === 'performance' ? 'var(--w-text)' : 'var(--w-text-muted)',
          }}
        >
          서빙 실적 & 등급
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className="px-4 py-2 rounded-lg text-sm font-medium ease-premium"
          style={{
            background: activeTab === 'training' ? 'var(--w-elevated)' : 'transparent',
            color: activeTab === 'training' ? 'var(--w-text)' : 'var(--w-text-muted)',
          }}
        >
          서빙 교육 체크리스트
        </button>
      </div>

      {activeTab === 'performance' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {staffPerf.length > 0 ? staffPerf.map(s => {
            const grade = getGrade(s.ordersServed);
            return (
              <div key={s.id} className="rounded-2xl p-6 border ease-premium" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'var(--w-accent-dim)', color: 'var(--w-accent)' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--w-text)' }}>{s.name}</h4>
                    <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>{ROLE_LABELS[s.role] ?? s.role}</p>
                  </div>
                </div>

                {/* 등급 */}
                <div
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-4"
                  style={{ background: grade.dimColor, color: grade.color }}
                >
                  <Icon icon={grade.icon} width={16} /> {grade.label}
                </div>

                {/* 지표 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1" style={{ color: 'var(--w-text-dim)' }}>
                      <Icon icon="solar:cart-large-2-bold" width={14} /> 서빙 건수
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--w-text)' }}>{s.ordersServed}건</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1" style={{ color: 'var(--w-text-dim)' }}>
                      <Icon icon="solar:star-bold" width={14} /> 평균 평점
                    </span>
                    <span className="text-sm font-bold" style={{ color: Number(s.avgRating) >= 4.5 ? 'var(--w-success)' : 'var(--w-text)' }}>
                      {Number(s.avgRating) > 0 ? `${s.avgRating}점` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1" style={{ color: 'var(--w-text-dim)' }}>
                      <Icon icon="solar:graph-up-bold" width={14} /> 관련 매출
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--w-text)' }}>₱{Number(s.totalRevenue).toLocaleString()}</span>
                  </div>
                </div>

                {/* 다음 등급까지 */}
                {(() => {
                  const nextGrade = GRADE_CONFIG.find(g => g.min > s.ordersServed);
                  if (!nextGrade) return null;
                  const progress = Math.min(100, (s.ordersServed / nextGrade.min) * 100);
                  return (
                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--w-border)' }}>
                      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--w-text-muted)' }}>
                        <span className="flex items-center gap-1">다음 등급: <Icon icon={nextGrade.icon} width={12} /> {nextGrade.label}</span>
                        <span>{s.ordersServed}/{nextGrade.min}건</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--w-bg)' }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--w-accent)' }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          }) : (
            <div className="col-span-full rounded-2xl p-12 text-center border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
              <p style={{ color: 'var(--w-text-muted)' }}>직원 데이터를 불러오는 중...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
            <Icon icon="solar:book-2-bold" width={18} style={{ color: 'var(--w-accent)' }} />
            한국인 직원 서빙 7단계 교육 체크리스트
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--w-text-dim)' }}>
            K-Food 서빙 가이드 기반 · 시스템이 자동으로 직원 약점을 분석하여 맞춤 교육을 배정합니다
          </p>

          <div className="space-y-4">
            {SERVING_TRAINING_CHECKLIST.map((item, i) => (
              <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: 'var(--w-bg)' }}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'var(--w-accent-dim)', color: 'var(--w-accent)' }}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--w-surface)', color: 'var(--w-text-dim)' }}>{item.category}</span>
                    {item.required && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--w-danger-dim)', color: 'var(--w-danger)' }}>필수</span>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-1" style={{ color: 'var(--w-text-dim)' }}>{item.item}</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded mt-1"
                  style={{ accentColor: 'var(--w-accent)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
