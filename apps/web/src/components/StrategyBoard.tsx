'use client';

import { useState, useEffect } from 'react';
import { Target, ChevronDown, ChevronRight, Zap, TrendingUp, Calendar, User, Plus } from 'lucide-react';
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Strategy Board</h2>
          <p className="text-slate-500 mt-1">OKR 관리 · AI 전략 어드바이저 · 캠페인</p>
        </div>
        <button
          onClick={() => api.generateInsights().then(() => api.getInsights(10).then(setInsights))}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm"
        >
          <Zap size={16} />
          AI 인사이트 생성
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        {[
          { key: 'okr' as const, label: 'OKR (전략 목표)' },
          { key: 'campaigns' as const, label: '캠페인' },
          { key: 'advisor' as const, label: 'AI 어드바이저' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OKR 트리 */}
      {activeTab === 'okr' && (
        <div className="space-y-6">
          {okr.length > 0 ? okr.map(objective => (
            <div key={objective.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Objective */}
              <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={20} className="text-orange-600" />
                      <span className="text-xs font-medium text-orange-600 bg-orange-200 px-2 py-0.5 rounded-full">Objective</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{objective.title}</h3>
                    {objective.description && <p className="text-sm text-slate-500 mt-1">{objective.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">{objective.progress}%</p>
                    {objective.kpiUnit && (
                      <p className="text-xs text-slate-500">
                        {objective.kpiCurrent?.toLocaleString()} / {objective.kpiTarget?.toLocaleString()} {objective.kpiUnit}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 h-3 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${objective.progress}%` }}
                  />
                </div>
              </div>

              {/* Key Results */}
              <div className="divide-y divide-slate-100">
                {objective.children?.map(kr => (
                  <div key={kr.id} className="p-5 pl-12">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Key Result</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            kr.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {kr.status}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-700">{kr.title}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">{kr.progress}%</p>
                        {kr.kpiUnit && (
                          <p className="text-xs text-slate-400">
                            {kr.kpiCurrent?.toLocaleString()} / {kr.kpiTarget?.toLocaleString()} {kr.kpiUnit}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          kr.progress >= 80 ? 'bg-emerald-500' : kr.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${kr.progress}%` }}
                      />
                    </div>

                    {/* Tactics */}
                    {kr.children?.length > 0 && (
                      <div className="mt-3 ml-4 space-y-2">
                        {kr.children.map(tactic => (
                          <div key={tactic.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">Tactic</span>
                            <span className="text-sm text-slate-600 flex-1">{tactic.title}</span>
                            <span className="text-xs text-slate-400">{tactic.progress}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
              <Target size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">OKR 데이터를 불러오는 중...</p>
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
              <div key={campaign.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{campaign.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{campaign.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>{campaign.status}</span>
                      {campaign.targetSegment && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          타겟: {campaign.targetSegment}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">ROI {roi}%</p>
                    <p className="text-xs text-slate-400">
                      투자 ₱{Number(campaign.spent).toLocaleString()} → 매출 ₱{Number(campaign.revenueGenerated).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
              <p className="text-slate-500 mb-4">아직 캠페인이 없습니다</p>
              <button className="flex items-center gap-2 mx-auto px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
                <Plus size={16} /> 첫 캠페인 만들기
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI 어드바이저 */}
      {activeTab === 'advisor' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI 전략 어드바이저</h3>
                <p className="text-slate-400 text-sm">데이터 기반 인사이트와 실행 제안</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              주문, 매출, 고객 피드백, 메뉴 성과 데이터를 종합 분석하여
              전략적 인사이트와 구체적인 실행 방안을 제안합니다.
            </p>
          </div>

          {insights.length > 0 ? insights.map(insight => (
            <div
              key={insight.id}
              className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${
                insight.severity === 'critical' ? 'border-l-red-500' :
                insight.severity === 'warning' ? 'border-l-yellow-500' :
                insight.severity === 'opportunity' ? 'border-l-emerald-500' :
                'border-l-blue-500'
              } border border-slate-200`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      insight.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      insight.severity === 'opportunity' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.severity === 'critical' ? '긴급' : insight.severity === 'warning' ? '주의' : insight.severity === 'opportunity' ? '기회' : '정보'}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{insight.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 mt-2">{insight.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                  {insight.actionSuggestion && (
                    <div className="mt-3 bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-500 mb-1">💡 추천 액션</p>
                      <p className="text-sm text-slate-700">{insight.actionSuggestion}</p>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(insight.createdAt).toLocaleDateString('ko')}
                </span>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <Zap size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">상단의 "AI 인사이트 생성" 버튼을 클릭하여</p>
              <p className="text-slate-500">현재 데이터 기반 인사이트를 생성하세요</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
