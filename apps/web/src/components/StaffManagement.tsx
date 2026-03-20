'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Star, Clock, TrendingUp, Award, BookOpen } from 'lucide-react';
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
  { min: 0, label: '루키', emoji: '🥉', color: 'bg-slate-100 text-slate-700' },
  { min: 100, label: '프로', emoji: '🥈', color: 'bg-blue-100 text-blue-700' },
  { min: 500, label: '마스터', emoji: '🥇', color: 'bg-yellow-100 text-yellow-700' },
  { min: 1000, label: '소믈리에', emoji: '⭐', color: 'bg-purple-100 text-purple-700' },
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
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">직원 관리</h2>
        <p className="text-slate-500 mt-1">서빙 실적 · 등급 시스템 · 교육 관리</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'performance' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
        >
          서빙 실적 & 등급
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'training' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
        >
          서빙 교육 체크리스트
        </button>
      </div>

      {activeTab === 'performance' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {staffPerf.length > 0 ? staffPerf.map(s => {
            const grade = getGrade(s.ordersServed);
            return (
              <div key={s.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl font-bold text-orange-600">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{s.name}</h4>
                    <p className="text-xs text-slate-500">{ROLE_LABELS[s.role] ?? s.role}</p>
                  </div>
                </div>

                {/* 등급 */}
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-4 ${grade.color}`}>
                  {grade.emoji} {grade.label}
                </div>

                {/* 지표 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-1"><ShoppingCart size={14} /> 서빙 건수</span>
                    <span className="text-sm font-bold">{s.ordersServed}건</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-1"><Star size={14} /> 평균 평점</span>
                    <span className={`text-sm font-bold ${Number(s.avgRating) >= 4.5 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {Number(s.avgRating) > 0 ? `${s.avgRating}점` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-1"><TrendingUp size={14} /> 관련 매출</span>
                    <span className="text-sm font-bold">₱{Number(s.totalRevenue).toLocaleString()}</span>
                  </div>
                </div>

                {/* 다음 등급까지 */}
                {(() => {
                  const nextGrade = GRADE_CONFIG.find(g => g.min > s.ordersServed);
                  if (!nextGrade) return null;
                  const progress = Math.min(100, (s.ordersServed / nextGrade.min) * 100);
                  return (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>다음 등급: {nextGrade.emoji} {nextGrade.label}</span>
                        <span>{s.ordersServed}/{nextGrade.min}건</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          }) : (
            <div className="col-span-full bg-white rounded-xl p-12 text-center border">
              <p className="text-slate-400">직원 데이터를 불러오는 중...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <BookOpen size={18} className="text-orange-500" />
            한국인 직원 서빙 7단계 교육 체크리스트
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            K-Food 서빙 가이드 기반 · 시스템이 자동으로 직원 약점을 분석하여 맞춤 교육을 배정합니다
          </p>

          <div className="space-y-4">
            {SERVING_TRAINING_CHECKLIST.map((item, i) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{item.category}</span>
                    {item.required && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">필수</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1">{item.item}</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-orange-500 mt-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingCart({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}
