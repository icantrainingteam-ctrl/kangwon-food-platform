'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api, type StrategyNode, type CampaignItem, type InsightItem } from '../lib/api';

export function StrategyBoard() {
  const [okr, setOKR] = useState<StrategyNode[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [activeTab, setActiveTab] = useState<'okr' | 'campaigns' | 'advisor'>('okr');

  useEffect(() => {
    api.getOKR().then(setOKR).catch(() => {});
    api.getCampaigns().then(setCampaigns).catch(() => {});
    api.getInsights(10).then(setInsights).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--w-text)' }}>Strategy Board</h2>
          <p className="mt-1" style={{ color: 'var(--w-text-muted)' }}>OKR 관리 · AI 전략 어드바이저 · 캠페인</p>
        </div>
        <button
          onClick={() => api.generateInsights().then(() => api.getInsights(10).then(setInsights))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm ease-premium"
          style={{ background: 'var(--w-accent)', color: '#000' }}
        >
          <Icon icon="solar:bolt-bold" width={16} />
          AI 인사이트 생성
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--w-surface)' }}>
        {[
          { key: 'okr' as const, label: 'OKR (전략 목표)' },
          { key: 'campaigns' as const, label: '캠페인' },
          { key: 'advisor' as const, label: 'AI 어드바이저' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium ease-premium"
            style={{
              background: activeTab === tab.key ? 'var(--w-elevated)' : 'transparent',
              color: activeTab === tab.key ? 'var(--w-text)' : 'var(--w-text-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OKR 트리 */}
      {activeTab === 'okr' && (
        <div className="space-y-6">
          {okr.length > 0 ? okr.map(objective => (
            <div key={objective.id} className="rounded-2xl border overflow-hidden" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
              {/* Objective */}
              <div className="p-6" style={{ background: 'var(--w-accent-dim)', borderBottom: '1px solid var(--w-border)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon="solar:target-bold" width={20} style={{ color: 'var(--w-accent)' }} />
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--w-accent)', color: '#000' }}>Objective</span>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--w-text)' }}>{objective.title}</h3>
                    {objective.description && <p className="text-sm mt-1" style={{ color: 'var(--w-text-dim)' }}>{objective.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: 'var(--w-accent)' }}>{objective.progress}%</p>
                    {objective.kpiUnit && (
                      <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
                        {objective.kpiCurrent?.toLocaleString()} / {objective.kpiTarget?.toLocaleString()} {objective.kpiUnit}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 h-3 rounded-full overflow-hidden" style={{ background: 'var(--w-surface)' }}>
                  <div
                    className="h-full rounded-full ease-premium"
                    style={{ width: `${objective.progress}%`, background: 'var(--w-accent)' }}
                  />
                </div>
              </div>

              {/* Key Results */}
              <div>
                {objective.children?.map(kr => (
                  <div key={kr.id} className="p-5 pl-12" style={{ borderBottom: '1px solid var(--w-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--w-info-dim)', color: 'var(--w-info)' }}>Key Result</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: kr.status === 'active' ? 'var(--w-success-dim)' : 'var(--w-surface)',
                              color: kr.status === 'active' ? 'var(--w-success)' : 'var(--w-text-muted)',
                            }}
                          >
                            {kr.status}
                          </span>
                        </div>
                        <h4 className="font-medium" style={{ color: 'var(--w-text-dim)' }}>{kr.title}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ color: 'var(--w-info)' }}>{kr.progress}%</p>
                        {kr.kpiUnit && (
                          <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
                            {kr.kpiCurrent?.toLocaleString()} / {kr.kpiTarget?.toLocaleString()} {kr.kpiUnit}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--w-bg)' }}>
                      <div
                        className="h-full rounded-full ease-premium"
                        style={{
                          width: `${kr.progress}%`,
                          background: kr.progress >= 80 ? 'var(--w-success)' : kr.progress >= 50 ? 'var(--w-info)' : 'var(--w-warning)',
                        }}
                      />
                    </div>

                    {/* Tactics */}
                    {kr.children?.length > 0 && (
                      <div className="mt-3 ml-4 space-y-2">
                        {kr.children.map(tactic => (
                          <div key={tactic.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--w-bg)' }}>
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--w-purple-dim)', color: 'var(--w-purple)' }}>Tactic</span>
                            <span className="text-sm flex-1" style={{ color: 'var(--w-text-dim)' }}>{tactic.title}</span>
                            <span className="text-xs" style={{ color: 'var(--w-text-muted)' }}>{tactic.progress}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="rounded-2xl p-12 border text-center" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
              <Icon icon="solar:target-bold" width={48} className="mx-auto mb-4" style={{ color: 'var(--w-text-muted)' }} />
              <p style={{ color: 'var(--w-text-dim)' }}>OKR 데이터를 불러오는 중...</p>
            </div>
          )}
        </div>
      )}

      {/* 캠페인 */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.length > 0 ? campaigns.map(campaign => {
            const roi = Number(campaign.spent) > 0
              ? ((Number(campaign.revenueGenerated) - Number(campaign.spent)) / Number(campaign.spent) * 100).toFixed(0)
              : '0';
            return (
              <div key={campaign.id} className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--w-text)' }}>{campaign.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--w-info-dim)', color: 'var(--w-info)' }}>{campaign.type}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: campaign.status === 'active' ? 'var(--w-success-dim)' : 'var(--w-surface)',
                          color: campaign.status === 'active' ? 'var(--w-success)' : 'var(--w-text-muted)',
                        }}
                      >{campaign.status}</span>
                      {campaign.targetSegment && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--w-purple-dim)', color: 'var(--w-purple)' }}>
                          타겟: {campaign.targetSegment}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: 'var(--w-success)' }}>ROI {roi}%</p>
                    <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
                      투자 ₱{Number(campaign.spent).toLocaleString()} → 매출 ₱{Number(campaign.revenueGenerated).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="rounded-2xl p-12 border text-center" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
              <p className="mb-4" style={{ color: 'var(--w-text-dim)' }}>아직 캠페인이 없습니다</p>
              <button
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'var(--w-accent)', color: '#000' }}
              >
                <Icon icon="solar:add-circle-bold" width={16} /> 첫 캠페인 만들기
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI 어드바이저 */}
      {activeTab === 'advisor' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--w-elevated)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--w-accent)' }}>
                <Icon icon="solar:bolt-bold" width={20} style={{ color: '#000' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--w-text)' }}>AI 전략 어드바이저</h3>
                <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>데이터 기반 인사이트와 실행 제안</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--w-text-dim)' }}>
              주문, 매출, 고객 피드백, 메뉴 성과 데이터를 종합 분석하여
              전략적 인사이트와 구체적인 실행 방안을 제안합니다.
            </p>
          </div>

          {insights.length > 0 ? insights.map(insight => {
            const severityColor = insight.severity === 'critical' ? 'var(--w-danger)'
              : insight.severity === 'warning' ? 'var(--w-warning)'
              : insight.severity === 'opportunity' ? 'var(--w-success)'
              : 'var(--w-info)';
            const severityDim = insight.severity === 'critical' ? 'var(--w-danger-dim)'
              : insight.severity === 'warning' ? 'var(--w-warning-dim)'
              : insight.severity === 'opportunity' ? 'var(--w-success-dim)'
              : 'var(--w-info-dim)';

            return (
              <div
                key={insight.id}
                className="rounded-2xl p-6 border"
                style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)', borderLeftWidth: '4px', borderLeftColor: severityColor }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: severityDim, color: severityColor }}
                      >
                        {insight.severity === 'critical' ? '긴급' : insight.severity === 'warning' ? '주의' : insight.severity === 'opportunity' ? '기회' : '정보'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--w-bg)', color: 'var(--w-text-muted)' }}>{insight.category}</span>
                    </div>
                    <h4 className="font-bold mt-2" style={{ color: 'var(--w-text)' }}>{insight.title}</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--w-text-dim)' }}>{insight.description}</p>
                    {insight.actionSuggestion && (
                      <div className="mt-3 rounded-xl p-3" style={{ background: 'var(--w-bg)' }}>
                        <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--w-text-muted)' }}>
                          <Icon icon="solar:lightbulb-bold" width={12} /> 추천 액션
                        </p>
                        <p className="text-sm" style={{ color: 'var(--w-text-dim)' }}>{insight.actionSuggestion}</p>
                      </div>
                    )}
                  </div>
                  <span className="text-xs whitespace-nowrap" style={{ color: 'var(--w-text-muted)' }}>
                    {new Date(insight.createdAt).toLocaleDateString('ko')}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="rounded-2xl p-8 text-center border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
              <Icon icon="solar:bolt-bold" width={40} className="mx-auto mb-3" style={{ color: 'var(--w-text-muted)' }} />
              <p style={{ color: 'var(--w-text-dim)' }}>상단의 "AI 인사이트 생성" 버튼을 클릭하여</p>
              <p style={{ color: 'var(--w-text-dim)' }}>현재 데이터 기반 인사이트를 생성하세요</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
