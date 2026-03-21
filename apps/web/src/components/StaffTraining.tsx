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
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'modules' | 'guide'>('overview');
  const [guideSection, setGuideSection] = useState<string | null>(null);

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
          { key: 'guide' as const, label: '서빙 가이드', icon: 'solar:document-text-bold-duotone' },
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

      {/* Tab: Serving Guide */}
      {activeTab === 'guide' && (
        <ServingGuideView guideSection={guideSection} setGuideSection={setGuideSection} />
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

// ========================================
// K-Food 서빙 가이드 뷰어
// ========================================

const GUIDE_SECTIONS = [
  {
    id: 'philosophy',
    title: '운영 철학',
    subtitle: '국대떡볶이 모델 x 한국 정통 서빙 하이브리드',
    icon: 'solar:star-bold-duotone',
    color: 'var(--w-accent)',
    content: [
      { type: 'heading', text: '국대떡볶이의 성공 공식' },
      { type: 'list', items: [
        '카운터 주문 + 진동벨 + 셀프 픽업 → 인건비 절감, 회전율 극대화',
        '오픈 키친 → 조리 과정이 보이는 투명성, 라이브 엔터테인먼트 효과',
        '세트 메뉴 중심 → 주문 간소화, 객단가 안정화',
      ]},
      { type: 'heading', text: '강원 하이브리드 모델' },
      { type: 'comparison', items: [
        { before: '카운터 주문', after: '카운터 OR 태블릿 주문 (선택)' },
        { before: '셀프 픽업', after: '한국인 직원이 직접 서빙' },
        { before: '진동벨', after: '진동벨 + 서빙 알림 시스템' },
        { before: '셀프 반찬', after: '직원이 반찬 상태 관리 + 리필 안내' },
      ]},
      { type: 'highlight', text: '핵심 차별화: 한국인 직원이 서빙하면서 "이렇게 드시면 됩니다"라고 음식 문화를 직접 전달합니다.' },
    ],
  },
  {
    id: 'service_modes',
    title: '서비스 모드 (3가지)',
    subtitle: '시간대별 최적 운영 방식',
    icon: 'solar:layers-bold-duotone',
    color: 'var(--w-info)',
    content: [
      { type: 'mode', label: 'MODE A', name: '카운터 주문', when: '런치 타임', flow: '고객 입장 → 카운터 주문 → 선결제 → 진동벨 → 조리 → 직원 서빙', pros: '빠른 회전율, 주문 에러 최소화' },
      { type: 'mode', label: 'MODE B', name: '태블릿 주문', when: '디너 타임', flow: '고객 착석 → QR 스캔 → 태블릿 메뉴 → 주문 → 직원 서빙 + 음식 설명', pros: '높은 객단가, 추가 주문 유도, 데이터 수집' },
      { type: 'mode', label: 'MODE C', name: '직원 주문', when: 'VIP/룸', flow: '고객 착석 → 직원 메뉴 추천 → 주문 접수 → POS 입력 → 직원 서빙 + 상세 설명', pros: '최고 고객 경험, 업셀링' },
    ],
  },
  {
    id: 'serving_7steps',
    title: '서빙 7단계 체크리스트',
    subtitle: '한국인 직원 서빙 표준 프로세스',
    icon: 'solar:checklist-bold-duotone',
    color: 'var(--w-success)',
    content: [
      { type: 'step', num: 1, name: '맞이', action: '입구에서 인사', ko: '어서오세요! 강원입니다', en: 'Welcome to Kangwon!', system: '테이블 배정' },
      { type: 'step', num: 2, name: '안내', action: '테이블 안내 + 주문방법 설명', ko: '메뉴는 태블릿으로 보실 수 있습니다', en: 'You can browse the menu on the tablet', system: '세션 시작' },
      { type: 'step', num: 3, name: '추천', action: '오늘의 추천 메뉴 안내', ko: '오늘 셰프 추천은 아도보 비빔밥입니다', en: "Today's chef pick is Adobo Bibimbap", system: 'AI 추천 기반' },
      { type: 'step', num: 4, name: '서빙', action: '음식 전달 + 먹는법 설명', ko: '비빔밥은 고추장 넣고 비벼서 드세요', en: 'Mix the bibimbap with gochujang sauce', system: 'KDS 알림' },
      { type: 'step', num: 5, name: '확인', action: '서빙 2분 후 테이블 방문', ko: '맛은 괜찮으세요?', en: 'How is everything?', system: '타이머 알림' },
      { type: 'step', num: 6, name: '리필', action: '반찬/물 상태 수시 확인', ko: '반찬 더 드릴까요?', en: 'Would you like more side dishes?', system: '리필 트래킹' },
      { type: 'step', num: 7, name: '인사', action: '퇴장 시 감사 인사', ko: '감사합니다! 또 오세요', en: 'Thank you! See you again!', system: '피드백 안내' },
    ],
  },
  {
    id: 'food_scripts',
    title: 'K-Food 문화 전달 스크립트',
    subtitle: '메뉴별 필수 설명 한/영',
    icon: 'solar:chat-round-dots-bold-duotone',
    color: 'var(--w-warning)',
    content: [
      { type: 'script', menu: '찌개류', ko: '찌개는 뚜껑을 열고 뜨거울 때 밥이랑 같이 드시면 됩니다. 국물에 밥을 말아서 드셔도 맛있어요.', en: "Enjoy the stew while it's hot with rice. You can also put rice into the soup — that's the Korean way!" },
      { type: 'script', menu: '삼겹살/구이류', ko: '고기는 쌈장 찍어서 상추에 싸서 드시면 됩니다. 마늘이랑 고추도 같이 싸서 드세요.', en: "Wrap the meat in lettuce with ssamjang sauce. Add garlic and chili — we call this 'Ssam' in Korea!" },
      { type: 'script', menu: '비빔밥', ko: '고추장을 넣고 숟가락으로 잘 비벼서 드세요. 골고루 섞을수록 맛있습니다.', en: 'Add gochujang and mix everything together with a spoon. The more you mix, the better it tastes!' },
      { type: 'script', menu: '소주', ko: '소주는 한 잔에 다 따르지 않고, 서로 따라주는 게 한국 문화입니다. 건배!', en: 'In Korean culture, we pour drinks for each other. Cheers — Geonbae!' },
    ],
  },
  {
    id: 'grade_system',
    title: '직원 등급 시스템',
    subtitle: '시스템 자동 추적 · 4단계 성장 경로',
    icon: 'solar:medal-ribbons-star-bold-duotone',
    color: 'var(--w-purple)',
    content: [
      { type: 'grade', level: '루키 (Rookie)', condition: '입사 1개월 미만', role: '물/반찬 서빙, 테이블 정리', training: '선임 직원 동행 서빙', color: 'var(--w-text-muted)' },
      { type: 'grade', level: '프로 (Professional)', condition: '서빙 100회+, 평점 4.0+', role: '독립 서빙, 메뉴 추천', training: '팁 정산 +10%', color: 'var(--w-info)' },
      { type: 'grade', level: '마스터 (Master)', condition: '서빙 500회+, 평점 4.5+', role: 'VIP/룸 전담, 신입 교육', training: '팁 정산 +20%, 메뉴 개발 참여', color: 'var(--w-warning)' },
      { type: 'grade', level: '소믈리에 (Sommelier)', condition: '마스터 + 주류 교육 이수', role: '주류 페어링 추천, 고급 서비스', training: '별도 인센티브', color: 'var(--w-accent)' },
    ],
  },
  {
    id: 'banchan',
    title: '반찬 관리 시스템',
    subtitle: '기본 반찬 세트 & 리필 트래킹',
    icon: 'solar:bowl-bold-duotone',
    color: 'var(--w-success)',
    content: [
      { type: 'banchan', name: '배추김치', refill: true, cost: 15, note: '신선도 2시간 체크' },
      { type: 'banchan', name: '깍두기', refill: true, cost: 12, note: '신선도 2시간 체크' },
      { type: 'banchan', name: '콩나물무침', refill: true, cost: 8, note: '4시간마다 교체' },
      { type: 'banchan', name: '시금치나물', refill: true, cost: 10, note: '4시간마다 교체' },
      { type: 'banchan', name: '계란찜', refill: false, cost: 25, note: '추가 ₱80 · 주문 메뉴에 따라 기본 제공' },
    ],
  },
  {
    id: 'daily_routine',
    title: '직원 일일 루틴',
    subtitle: '시간대별 업무 가이드',
    icon: 'solar:clock-circle-bold-duotone',
    color: 'var(--w-info)',
    content: [
      { type: 'routine', time: '10:00~11:00', label: '오픈 준비', tasks: ['테이블 세팅 (태블릿 충전, 반찬 접시)', '반찬 준비 상태 확인', '오늘의 추천 메뉴 확인 (AI 추천 체크)', '진동벨 작동 테스트', '유니폼 착용, 서빙 도구 준비', '조회: 어제 피드백 리뷰 + 오늘 목표 공유'] },
      { type: 'routine', time: '11:00~14:00', label: '런치 (MODE A)', tasks: ['카운터 주문 접수 + 진동벨 배부', '빠른 서빙 (목표: 조리 완료 후 1분 이내)', '반찬 바 상태 수시 확인', '혼잡 시간 테이블 회전 관리'] },
      { type: 'routine', time: '14:00~17:00', label: '브레이크', tasks: ['테이블 정리 및 세팅 복구', '반찬 재준비', '직원 교육/미팅 (주 2회)', '시스템 데이터 확인 (매니저)'] },
      { type: 'routine', time: '17:00~22:00', label: '디너 (MODE B/C)', tasks: ['태블릿 주문 + 직접 서빙', '메뉴 추천 적극 수행 (AI 기반)', '주류 서빙 시 문화 설명', '서빙 2분 후 확인 방문 필수', '피드백 안내 (결제 전)'] },
      { type: 'routine', time: '22:00~23:00', label: '마감', tasks: ['일일 마감 실행 (시스템)', '오늘의 피드백 리뷰', '반찬 재고 확인 + 내일 필요량 기록', '매장 청소 및 정리', '태블릿 충전 거치'] },
    ],
  },
  {
    id: 'kpi',
    title: 'KPI & 인센티브',
    subtitle: '직원 개인 KPI · 팀 인센티브',
    icon: 'solar:chart-2-bold-duotone',
    color: 'var(--w-accent)',
    content: [
      { type: 'kpi', metric: '평균 서빙 시간', target: '< 2분', method: 'KDS → 서빙 완료 시간' },
      { type: 'kpi', metric: '고객 평점', target: '4.5+', method: '피드백 시스템' },
      { type: 'kpi', metric: '일일 서빙 건수', target: '런치 20+ / 디너 15+', method: '주문 시스템' },
      { type: 'kpi', metric: '업셀링 성공률', target: '20%+', method: '추천 메뉴 주문 비율' },
      { type: 'kpi', metric: '반찬 리필 응답', target: '< 3분', method: '리필 요청 → 완료 시간' },
    ],
  },
  {
    id: 'incentive',
    title: '팀 보상 체계',
    subtitle: '월간/주간 달성 조건별 보상',
    icon: 'solar:gift-bold-duotone',
    color: 'var(--w-warning)',
    content: [
      { type: 'reward', condition: '월간 고객 평점 4.5+', reward: '팀 보너스 ₱5,000' },
      { type: 'reward', condition: '월매출 목표 달성', reward: '팀 보너스 ₱10,000' },
      { type: 'reward', condition: '0건 클레임 주간', reward: '팀 식사 제공' },
      { type: 'reward', condition: '베스트 서버 (월간)', reward: '개인 보너스 ₱3,000' },
    ],
  },
  {
    id: 'checklists',
    title: '품질 관리 체크리스트',
    subtitle: '일일 · 주간 · 월간 점검 항목',
    icon: 'solar:clipboard-check-bold-duotone',
    color: 'var(--w-success)',
    content: [
      { type: 'checklist', period: '일일 (매니저)', items: ['모든 태블릿 정상 작동', '진동벨 30개 충전 상태', 'KDS 화면 정상', '반찬 준비 완료', '직원 복장 및 위생', '오늘의 피드백 알림 설정'] },
      { type: 'checklist', period: '주간 (매니저)', items: ['직원 KPI 리뷰', '고객 피드백 트렌드 분석', '메뉴 성과 리뷰 (Menu Matrix)', '식자재 원가 변동 확인', '경쟁사 동향 체크', '전략 보드 KPI 업데이트'] },
      { type: 'checklist', period: '월간 (경영진)', items: ['OKR 진척도 리뷰', '캠페인 ROI 분석', 'RFM 고객 세그먼트 변화', '직원 등급 업데이트', '신메뉴 도입 검토', 'AI 인사이트 종합 리뷰'] },
    ],
  },
];

function ServingGuideView({ guideSection, setGuideSection }: { guideSection: string | null; setGuideSection: (s: string | null) => void }) {
  return (
    <div className="space-y-2">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 mb-4"
        style={{ backgroundColor: 'var(--w-surface)', border: '1px solid var(--w-border)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--w-accent-dim)' }}>
            <Icon icon="solar:document-text-bold-duotone" width={22} style={{ color: 'var(--w-accent)' }} />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--w-text)' }}>
              K-Food 서빙 시스템 & 직원 교육 가이드
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--w-text-muted)' }}>
              강원푸드 iCAN 사업부 · 한국형 요식사업 운영 매뉴얼 v1.0
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--w-text-dim)' }}>
          "한국인이 직접 서빙하는 진정한 K-Food 경험" — 섹션을 클릭하여 상세 내용을 확인하세요.
        </p>
      </div>

      {/* Accordion Sections */}
      {GUIDE_SECTIONS.map((section, i) => {
        const isOpen = guideSection === section.id;
        return (
          <div key={section.id}
            className="rounded-2xl overflow-hidden transition-all duration-300 ease-premium animate-fade-in-up"
            style={{
              backgroundColor: 'var(--w-surface)',
              border: isOpen ? `1px solid ${section.color}` : '1px solid var(--w-border)',
              animationDelay: `${i * 0.03}s`,
            }}>
            {/* Section Header */}
            <button
              onClick={() => setGuideSection(isOpen ? null : section.id)}
              className="w-full px-5 py-4 flex items-center justify-between transition-all duration-300 ease-premium hover:opacity-80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: isOpen ? section.color : 'var(--w-elevated)', opacity: isOpen ? 0.15 : 1 }}>
                  <Icon icon={section.icon} width={18}
                    style={{ color: isOpen ? section.color : 'var(--w-text-muted)', position: 'relative' }} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm" style={{ color: isOpen ? section.color : 'var(--w-text)' }}>
                    {section.title}
                  </h4>
                  <p className="text-[11px]" style={{ color: 'var(--w-text-muted)' }}>{section.subtitle}</p>
                </div>
              </div>
              <Icon icon={isOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                width={16} style={{ color: 'var(--w-text-muted)' }} />
            </button>

            {/* Section Content */}
            {isOpen && (
              <div className="px-5 pb-5 animate-fade-in-up">
                <div className="space-y-3" style={{ borderTop: '1px solid var(--w-border)', paddingTop: '16px' }}>
                  {section.content.map((item: any, ci: number) => {
                    if (item.type === 'heading') return (
                      <h5 key={ci} className="font-bold text-xs mt-2" style={{ color: 'var(--w-text)' }}>{item.text}</h5>
                    );
                    if (item.type === 'list') return (
                      <ul key={ci} className="space-y-1.5 ml-1">
                        {item.items.map((li: string, li2: number) => (
                          <li key={li2} className="text-xs flex items-start gap-2" style={{ color: 'var(--w-text-dim)' }}>
                            <Icon icon="solar:arrow-right-linear" width={12} className="mt-0.5 flex-shrink-0" style={{ color: section.color }} />
                            {li}
                          </li>
                        ))}
                      </ul>
                    );
                    if (item.type === 'highlight') return (
                      <div key={ci} className="rounded-xl p-3" style={{ backgroundColor: 'var(--w-accent-dim)', borderLeft: `3px solid ${section.color}` }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--w-accent)' }}>{item.text}</p>
                      </div>
                    );
                    if (item.type === 'comparison') return (
                      <div key={ci} className="space-y-1.5">
                        {item.items.map((c: any, c2: number) => (
                          <div key={c2} className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--w-elevated)', color: 'var(--w-text-muted)' }}>{c.before}</span>
                            <Icon icon="solar:arrow-right-linear" width={12} style={{ color: section.color }} />
                            <span className="font-medium" style={{ color: 'var(--w-text)' }}>{c.after}</span>
                          </div>
                        ))}
                      </div>
                    );
                    if (item.type === 'mode') return (
                      <div key={ci} className="rounded-xl p-4" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--w-info-dim)', color: 'var(--w-info)' }}>{item.label}</span>
                          <span className="font-bold text-sm" style={{ color: 'var(--w-text)' }}>{item.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md ml-auto" style={{ backgroundColor: 'var(--w-accent-dim)', color: 'var(--w-accent)' }}>{item.when}</span>
                        </div>
                        <p className="text-[11px] mb-2 leading-relaxed" style={{ color: 'var(--w-text-dim)' }}>{item.flow}</p>
                        <p className="text-[10px]" style={{ color: 'var(--w-success)' }}>장점: {item.pros}</p>
                      </div>
                    );
                    if (item.type === 'step') return (
                      <div key={ci} className="rounded-xl p-4 flex gap-4" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: 'var(--w-success-dim)', color: 'var(--w-success)' }}>{item.num}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm" style={{ color: 'var(--w-text)' }}>{item.name}</span>
                            <span className="text-[10px]" style={{ color: 'var(--w-text-muted)' }}>{item.action}</span>
                          </div>
                          <p className="text-xs mb-0.5" style={{ color: 'var(--w-accent)' }}>KO: "{item.ko}"</p>
                          <p className="text-xs mb-1" style={{ color: 'var(--w-info)' }}>EN: "{item.en}"</p>
                          <span className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--w-purple-dim)', color: 'var(--w-purple)' }}>{item.system}</span>
                        </div>
                      </div>
                    );
                    if (item.type === 'script') return (
                      <div key={ci} className="rounded-xl p-4" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <h5 className="font-bold text-sm mb-2" style={{ color: 'var(--w-text)' }}>{item.menu}</h5>
                        <div className="space-y-2">
                          <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--w-accent-dim)' }}>
                            <span className="text-[10px] font-bold" style={{ color: 'var(--w-accent)' }}>KO</span>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--w-text-dim)' }}>"{item.ko}"</p>
                          </div>
                          <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--w-info-dim)' }}>
                            <span className="text-[10px] font-bold" style={{ color: 'var(--w-info)' }}>EN</span>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--w-text-dim)' }}>"{item.en}"</p>
                          </div>
                        </div>
                      </div>
                    );
                    if (item.type === 'grade') return (
                      <div key={ci} className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon icon="solar:medal-ribbons-star-bold" width={18} style={{ color: item.color }} />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm" style={{ color: item.color }}>{item.level}</h5>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--w-text-muted)' }}>조건: {item.condition}</p>
                          <p className="text-[11px]" style={{ color: 'var(--w-text-dim)' }}>역할: {item.role}</p>
                          <p className="text-[11px]" style={{ color: 'var(--w-success)' }}>{item.training}</p>
                        </div>
                      </div>
                    );
                    if (item.type === 'banchan') return (
                      <div key={ci} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <div className="flex items-center gap-3">
                          <Icon icon="solar:bowl-bold-duotone" width={16} style={{ color: section.color }} />
                          <span className="font-medium text-sm" style={{ color: 'var(--w-text)' }}>{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span style={{ color: item.refill ? 'var(--w-success)' : 'var(--w-warning)' }}>{item.refill ? '무제한 리필' : '유료 추가'}</span>
                          <span style={{ color: 'var(--w-text-muted)' }}>원가 ₱{item.cost}/인</span>
                          <span style={{ color: 'var(--w-text-muted)' }}>{item.note}</span>
                        </div>
                      </div>
                    );
                    if (item.type === 'routine') return (
                      <div key={ci} className="rounded-xl p-4" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums" style={{ backgroundColor: 'var(--w-info-dim)', color: 'var(--w-info)' }}>{item.time}</span>
                          <span className="font-bold text-sm" style={{ color: 'var(--w-text)' }}>{item.label}</span>
                        </div>
                        <ul className="space-y-1">
                          {item.tasks.map((t: string, ti: number) => (
                            <li key={ti} className="text-xs flex items-start gap-2" style={{ color: 'var(--w-text-dim)' }}>
                              <Icon icon="solar:check-circle-linear" width={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--w-success)' }} />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                    if (item.type === 'kpi') return (
                      <div key={ci} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <span className="font-medium text-sm" style={{ color: 'var(--w-text)' }}>{item.metric}</span>
                        <div className="flex items-center gap-4 text-[11px]">
                          <span className="font-bold" style={{ color: 'var(--w-accent)' }}>{item.target}</span>
                          <span style={{ color: 'var(--w-text-muted)' }}>{item.method}</span>
                        </div>
                      </div>
                    );
                    if (item.type === 'reward') return (
                      <div key={ci} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <span className="text-sm" style={{ color: 'var(--w-text)' }}>{item.condition}</span>
                        <span className="font-bold text-sm" style={{ color: 'var(--w-warning)' }}>{item.reward}</span>
                      </div>
                    );
                    if (item.type === 'checklist') return (
                      <div key={ci} className="rounded-xl p-4" style={{ backgroundColor: 'var(--w-elevated)', border: '1px solid var(--w-border)' }}>
                        <h5 className="font-bold text-sm mb-2" style={{ color: 'var(--w-text)' }}>{item.period}</h5>
                        <ul className="space-y-1.5">
                          {item.items.map((t: string, ti: number) => (
                            <li key={ti} className="text-xs flex items-center gap-2" style={{ color: 'var(--w-text-dim)' }}>
                              <div className="w-4 h-4 rounded border flex-shrink-0" style={{ borderColor: 'var(--w-border-light)' }} />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
