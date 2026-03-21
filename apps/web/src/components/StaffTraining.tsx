'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api, type TrainingRecommendationsData, type TrainingHeatmapEntry, type TrainingStaffRecommendation } from '../lib/api';

const RISK_CONFIG = {
  critical: { label: '긴급', icon: 'solar:danger-triangle-bold', color: 'var(--w-danger)', dimColor: 'var(--w-danger-dim)' },
  warning: { label: '주의', icon: 'solar:shield-warning-bold', color: 'var(--w-warning)', dimColor: 'var(--w-warning-dim)' },
  watch: { label: '관찰', icon: 'solar:eye-bold', color: 'var(--w-info)', dimColor: 'var(--w-info-dim)' },
  good: { label: '양호', icon: 'solar:check-circle-bold', color: 'var(--w-success)', dimColor: 'var(--w-success-dim)' },
};

const PRIORITY_CONFIG: Record<string, { color: string; dimColor: string }> = {
  critical: { color: 'var(--w-danger)', dimColor: 'var(--w-danger-dim)' },
  high: { color: 'var(--w-accent)', dimColor: 'var(--w-accent-dim)' },
  medium: { color: 'var(--w-warning)', dimColor: 'var(--w-warning-dim)' },
  low: { color: 'var(--w-info)', dimColor: 'var(--w-info-dim)' },
};

const ROLE_LABELS: Record<string, string> = {
  manager: '점장', chef: '셰프', server: '서버', cashier: '캐셔',
  procurement: '구매', marketing: '마케팅', part_time: '파트타임',
};

export function StaffTraining() {
  const [data, setData] = useState<TrainingRecommendationsData | null>(null);
  const [heatmap, setHeatmap] = useState<TrainingHeatmapEntry[]>([]);
  const [days, setDays] = useState(30);
  const [selectedStaff, setSelectedStaff] = useState<TrainingStaffRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'modules'>('overview');

  useEffect(() => {
    api.getTrainingRecommendations(days).then(setData).catch(() => {});
    api.getTrainingHeatmap(14).then(setHeatmap).catch(() => {});
  }, [days]);

  // 히트맵 데이터 가공
  const heatmapByStaff = heatmap.reduce<Record<string, TrainingHeatmapEntry[]>>((acc, entry) => {
    if (!acc[entry.staffName]) acc[entry.staffName] = [];
    acc[entry.staffName].push(entry);
    return acc;
  }, {});

  const uniqueDates = [...new Set(heatmap.map(h => h.date))].sort();

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--w-text)' }}>
            직원 교육 관리
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--w-text-muted)' }}>
            성과 분석 기반 맞춤 교육 추천 시스템
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--w-surface)' }}>
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-premium"
                style={days === d ? { backgroundColor: 'var(--w-accent)', color: '#fff' }
                  : { color: 'var(--w-text-muted)' }}>
                {d}일
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: '대상 직원', value: data?.totalStaff ?? 0, icon: 'solar:users-group-rounded-bold-duotone', color: 'var(--w-info)', dimColor: 'var(--w-info-dim)' },
          { label: '교육 필요', value: data?.atRisk ?? 0, icon: 'solar:danger-triangle-bold-duotone', color: 'var(--w-danger)', dimColor: 'var(--w-danger-dim)' },
          { label: '긴급 대응', value: data?.recommendations.filter(r => r.riskLevel === 'critical').length ?? 0, icon: 'solar:shield-warning-bold-duotone', color: 'var(--w-warning)', dimColor: 'var(--w-warning-dim)' },
          { label: '양호', value: data?.recommendations.filter(r => r.riskLevel === 'good').length ?? 0, icon: 'solar:check-circle-bold-duotone', color: 'var(--w-success)', dimColor: 'var(--w-success-dim)' },
        ].map((card, i) => (
          <div key={card.label}
            className="rounded-2xl p-5 transition-all duration-300 ease-premium hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--w-surface)', border: '1px solid var(--w-border)', animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>{card.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.dimColor }}>
                <Icon icon={card.icon} width={18} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ backgroundColor: 'var(--w-surface)' }}>
        {[
          { key: 'overview' as const, label: '직원별 교육 추천', icon: 'solar:user-check-bold-duotone' },
          { key: 'heatmap' as const, label: '일자별 만족도 추이', icon: 'solar:chart-square-bold-duotone' },
          { key: 'modules' as const, label: '교육 모듈 목록', icon: 'solar:book-2-bold-duotone' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ease-premium"
            style={activeTab === tab.key
              ? { backgroundColor: 'var(--w-elevated)', color: 'var(--w-text)' }
              : { color: 'var(--w-text-muted)' }}>
            <Icon icon={tab.icon} width={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data?.recommendations.map((rec, i) => {
            const risk = RISK_CONFIG[rec.riskLevel];
            return (
              <div key={rec.staff.id}
                className="rounded-2xl overflow-hidden transition-all duration-300 ease-premium hover:scale-[1.01] cursor-pointer animate-fade-in-up"
                style={{
                  backgroundColor: 'var(--w-surface)',
                  border: `1px solid ${rec.riskLevel === 'critical' ? 'var(--w-danger)' : 'var(--w-border)'}`,
                  animationDelay: `${i * 0.04}s`,
                }}
                onClick={() => setSelectedStaff(rec)}>

                {/* Header */}
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--w-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: risk.dimColor, color: risk.color }}>
                      {rec.staff.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: 'var(--w-text)' }}>{rec.staff.name}</h4>
                      <p className="text-[11px]" style={{ color: 'var(--w-text-muted)' }}>
                        {ROLE_LABELS[rec.staff.role] ?? rec.staff.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                      style={{ backgroundColor: risk.dimColor, color: risk.color }}>
                      <Icon icon={risk.icon} width={13} />
                      {risk.label}
                    </span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="px-5 py-3 grid grid-cols-4 gap-3">
                  {[
                    { label: '서빙', value: `${rec.performance.ordersServed}건` },
                    { label: '평점', value: rec.performance.avgRating > 0 ? `${rec.performance.avgRating}` : '-' },
                    { label: '부정', value: `${rec.performance.negativeFeedbacks}`, danger: rec.performance.negativeFeedbacks > 0 },
                    { label: '긍정', value: `${rec.performance.positiveFeedbacks}` },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <p className="text-[10px] mb-0.5" style={{ color: 'var(--w-text-muted)' }}>{m.label}</p>
                      <p className="text-sm font-bold tabular-nums"
                        style={{ color: m.danger ? 'var(--w-danger)' : 'var(--w-text)' }}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recommended Training */}
                {rec.recommendedTraining.length > 0 && (
                  <div className="px-5 pb-4">
                    <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--w-text-muted)' }}>
                      추천 교육 ({rec.recommendedTraining.length}개)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.recommendedTraining.slice(0, 3).map(mod => {
                        const pConfig = PRIORITY_CONFIG[mod.priority] ?? PRIORITY_CONFIG.medium;
                        return (
                          <span key={mod.id}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
                            style={{ backgroundColor: pConfig.dimColor, color: pConfig.color }}>
                            {mod.name}
                          </span>
                        );
                      })}
                      {rec.recommendedTraining.length > 3 && (
                        <span className="text-[10px] px-2 py-1 rounded-lg"
                          style={{ backgroundColor: 'var(--w-elevated)', color: 'var(--w-text-muted)' }}>
                          +{rec.recommendedTraining.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {rec.recommendedTraining.length === 0 && rec.riskLevel === 'good' && (
                  <div className="px-5 pb-4">
                    <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--w-success)' }}>
                      <Icon icon="solar:check-circle-bold" width={14} />
                      추가 교육 불필요 — 우수 성과 유지 중
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {(!data || data.recommendations.length === 0) && (
            <div className="col-span-full rounded-2xl p-12 text-center"
              style={{ backgroundColor: 'var(--w-surface)', border: '1px solid var(--w-border)' }}>
              <Icon icon="solar:user-check-bold-duotone" width={40}
                style={{ color: 'var(--w-border-light)' }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>
                직원 서빙 데이터가 쌓이면 교육 추천이 생성됩니다
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--w-surface)', border: '1px solid var(--w-border)' }}>
          <div className="p-5" style={{ borderBottom: '1px solid var(--w-border)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--w-text)' }}>
              일자별 직원 고객 만족도 히트맵
            </h3>
            <p className="text-[11px] mt-1" style={{ color: 'var(--w-text-muted)' }}>
              최근 14일 · 셀 색상이 진할수록 높은 평점
            </p>
          </div>

          {Object.keys(heatmapByStaff).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold sticky left-0"
                      style={{ backgroundColor: 'var(--w-surface)', color: 'var(--w-text-muted)' }}>
                      직원
                    </th>
                    {uniqueDates.map(date => (
                      <th key={date} className="px-2 py-3 text-center font-medium"
                        style={{ color: 'var(--w-text-muted)' }}>
                        {date.slice(5)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(heatmapByStaff).map(([name, entries]) => (
                    <tr key={name} style={{ borderTop: '1px solid var(--w-border)' }}>
                      <td className="px-4 py-3 font-semibold sticky left-0"
                        style={{ backgroundColor: 'var(--w-surface)', color: 'var(--w-text)' }}>
                        {name}
                      </td>
                      {uniqueDates.map(date => {
                        const entry = entries.find(e => e.date === date);
                        if (!entry) return <td key={date} className="px-2 py-3 text-center" style={{ color: 'var(--w-text-muted)' }}>-</td>;

                        const rating = entry.avgRating;
                        let bgColor = 'var(--w-danger-dim)';
                        let textColor = 'var(--w-danger)';
                        if (rating >= 4.5) { bgColor = 'var(--w-success-dim)'; textColor = 'var(--w-success)'; }
                        else if (rating >= 3.5) { bgColor = 'rgba(34,197,94,0.06)'; textColor = 'var(--w-success)'; }
                        else if (rating >= 3) { bgColor = 'var(--w-warning-dim)'; textColor = 'var(--w-warning)'; }

                        return (
                          <td key={date} className="px-1 py-2 text-center">
                            <div className="mx-auto w-10 py-1 rounded-lg text-[11px] font-bold tabular-nums"
                              style={{ backgroundColor: bgColor, color: textColor }}>
                              {rating}
                            </div>
                            <p className="text-[9px] mt-0.5" style={{ color: 'var(--w-text-muted)' }}>
                              {entry.totalFeedbacks}건
                            </p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Icon icon="solar:chart-square-bold-duotone" width={40}
                style={{ color: 'var(--w-border-light)' }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>
                피드백 데이터가 쌓이면 히트맵이 표시됩니다
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="px-5 py-3 flex items-center gap-4" style={{ borderTop: '1px solid var(--w-border)' }}>
            <span className="text-[10px] font-medium" style={{ color: 'var(--w-text-muted)' }}>범례:</span>
            {[
              { label: '4.5+', color: 'var(--w-success)', bg: 'var(--w-success-dim)' },
              { label: '3.5+', color: 'var(--w-success)', bg: 'rgba(34,197,94,0.06)' },
              { label: '3.0+', color: 'var(--w-warning)', bg: 'var(--w-warning-dim)' },
              { label: '<3.0', color: 'var(--w-danger)', bg: 'var(--w-danger-dim)' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="w-5 h-3 rounded" style={{ backgroundColor: l.bg }} />
                <span className="text-[10px]" style={{ color: l.color }}>{l.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Modules */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data?.availableModules.map((mod, i) => {
            const pConfig = PRIORITY_CONFIG[mod.priority] ?? PRIORITY_CONFIG.medium;
            return (
              <div key={mod.id}
                className="rounded-2xl p-5 animate-fade-in-up transition-all duration-300 ease-premium hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--w-surface)',
                  border: '1px solid var(--w-border)',
                  animationDelay: `${i * 0.04}s`,
                }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: pConfig.dimColor, color: pConfig.color }}>
                    {mod.priority === 'critical' ? '필수' : mod.priority === 'high' ? '높음' : mod.priority === 'medium' ? '보통' : '선택'}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--w-text-muted)' }}>
                    {mod.duration}
                  </span>
                </div>
                <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--w-text)' }}>{mod.name}</h4>
                <p className="text-[11px] mb-3" style={{ color: 'var(--w-text-muted)' }}>{mod.category}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--w-text-dim)' }}>
                  {mod.description}
                </p>
              </div>
            );
          })}

          {(!data || data.availableModules.length === 0) && (
            <div className="col-span-full rounded-2xl p-12 text-center"
              style={{ backgroundColor: 'var(--w-surface)', border: '1px solid var(--w-border)' }}>
              <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>교육 모듈 로딩 중...</p>
            </div>
          )}
        </div>
      )}

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => e.target === e.currentTarget && setSelectedStaff(null)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl animate-fade-in-up"
            style={{ backgroundColor: 'var(--w-surface)', border: '1px solid var(--w-border)' }}>

            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--w-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: RISK_CONFIG[selectedStaff.riskLevel].dimColor,
                    color: RISK_CONFIG[selectedStaff.riskLevel].color,
                  }}>
                  {selectedStaff.staff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--w-text)' }}>
                    {selectedStaff.staff.name}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
                    {ROLE_LABELS[selectedStaff.staff.role] ?? selectedStaff.staff.role} · 맞춤 교육 계획
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedStaff(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-premium hover:scale-110"
                style={{ backgroundColor: 'var(--w-elevated)' }}>
                <Icon icon="solar:close-circle-linear" width={18} style={{ color: 'var(--w-text-muted)' }} />
              </button>
            </div>

            {/* Performance Summary */}
            <div className="p-6 grid grid-cols-4 gap-3" style={{ borderBottom: '1px solid var(--w-border)' }}>
              {[
                { label: '서빙 건수', value: `${selectedStaff.performance.ordersServed}건`, color: 'var(--w-text)' },
                { label: '평균 평점', value: selectedStaff.performance.avgRating > 0 ? `${selectedStaff.performance.avgRating}점` : '-', color: selectedStaff.performance.avgRating >= 4 ? 'var(--w-success)' : selectedStaff.performance.avgRating >= 3 ? 'var(--w-warning)' : 'var(--w-danger)' },
                { label: '부정 리뷰', value: `${selectedStaff.performance.negativeFeedbacks}건`, color: selectedStaff.performance.negativeFeedbacks > 0 ? 'var(--w-danger)' : 'var(--w-text)' },
                { label: '긍정 리뷰', value: `${selectedStaff.performance.positiveFeedbacks}건`, color: 'var(--w-success)' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-[10px] mb-1" style={{ color: 'var(--w-text-muted)' }}>{m.label}</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Recommended Training Modules */}
            <div className="p-6">
              <h4 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
                <Icon icon="solar:book-2-bold-duotone" width={16} style={{ color: 'var(--w-accent)' }} />
                추천 교육 프로그램
              </h4>

              {selectedStaff.recommendedTraining.length > 0 ? (
                <div className="space-y-3">
                  {selectedStaff.recommendedTraining.map((mod, i) => {
                    const pConfig = PRIORITY_CONFIG[mod.priority] ?? PRIORITY_CONFIG.medium;
                    return (
                      <div key={mod.id}
                        className="rounded-xl p-4"
                        style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: pConfig.color }}>
                              {i + 1}.
                            </span>
                            <h5 className="font-bold text-sm" style={{ color: 'var(--w-text)' }}>{mod.name}</h5>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: pConfig.dimColor, color: pConfig.color }}>
                            {mod.duration}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--w-text-dim)' }}>
                          {mod.description}
                        </p>
                        {mod.reason && (
                          <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--w-warning)' }}>
                            <Icon icon="solar:info-circle-linear" width={12} />
                            {mod.reason}
                          </p>
                        )}
                        {mod.matchedKeywords.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <span className="text-[10px]" style={{ color: 'var(--w-text-muted)' }}>키워드:</span>
                            {mod.matchedKeywords.map(kw => (
                              <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: 'var(--w-danger-dim)', color: 'var(--w-danger)' }}>
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl p-6 text-center"
                  style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                  <Icon icon="solar:check-circle-bold" width={32} style={{ color: 'var(--w-success)' }} className="mx-auto mb-2" />
                  <p className="text-sm font-medium" style={{ color: 'var(--w-success)' }}>
                    추가 교육이 필요하지 않습니다
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--w-text-muted)' }}>
                    현재 우수한 서비스 성과를 유지하고 있습니다
                  </p>
                </div>
              )}
            </div>

            {/* Negative Comments */}
            {selectedStaff.negativeComments.length > 0 && (
              <div className="p-6" style={{ borderTop: '1px solid var(--w-border)' }}>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
                  <Icon icon="solar:chat-round-warning-bold-duotone" width={16} style={{ color: 'var(--w-danger)' }} />
                  부정 피드백 원문 ({selectedStaff.negativeComments.length}건)
                </h4>
                <div className="space-y-2">
                  {selectedStaff.negativeComments.map((c, i) => (
                    <div key={i} className="rounded-lg p-3"
                      style={{ backgroundColor: 'var(--w-danger-dim)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Icon key={si}
                              icon={si < c.rating ? 'solar:star-bold' : 'solar:star-linear'}
                              width={11}
                              style={{ color: si < c.rating ? 'var(--w-warning)' : 'var(--w-border)' }} />
                          ))}
                        </div>
                        {c.sentiment && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'var(--w-elevated)', color: 'var(--w-text-muted)' }}>
                            {c.sentiment}
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--w-text-dim)' }}>{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
