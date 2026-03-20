'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useRealtimeKPI } from '../hooks/useRealtimeKPI';
import { api, type InsightItem, type MenuRankingItem } from '../lib/api';

export function CommandCenter() {
  const { kpi, loading } = useRealtimeKPI(10000);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [menuRanking, setMenuRanking] = useState<MenuRankingItem[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    api.getInsights(5).then(setInsights).catch(() => {});
    api.getMenuRanking(7, 5).then(setMenuRanking).catch(() => {});
    api.getTables().then(setTables).catch(() => {});
  }, []);

  const formatCurrency = (n: number) => `₱${n.toLocaleString()}`;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-10">
        <h2
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--w-text)' }}
        >
          Command Center
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--w-text-muted)' }}>
          강원 실시간 운영 현황
          {loading && (
            <span
              className="ml-2 inline-flex items-center gap-1.5"
              style={{ color: 'var(--w-accent)' }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--w-accent)' }}
              />
              동기화 중
            </span>
          )}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <KPICard
          label="오늘 매출"
          value={formatCurrency(kpi?.todayRevenue ?? 0)}
          change={kpi?.revenueChangePercent ?? 0}
          icon="solar:chart-bold-duotone"
          color="accent"
          stagger="stagger-1"
        />
        <KPICard
          label="주문 건수"
          value={`${kpi?.todayOrders ?? 0}건`}
          sublabel="오늘 결제 완료"
          icon="solar:cart-large-2-bold-duotone"
          color="info"
          stagger="stagger-2"
        />
        <KPICard
          label="평균 객단가"
          value={formatCurrency(kpi?.avgOrderAmount ?? 0)}
          sublabel={`평균 조리 ${kpi?.avgPrepTime ?? 0}분`}
          icon="solar:clock-circle-bold-duotone"
          color="warning"
          stagger="stagger-3"
        />
        <KPICard
          label="고객 만족도"
          value={kpi?.customerSatisfaction ? `${kpi.customerSatisfaction}점` : '-'}
          sublabel={`${kpi?.feedbackCount ?? 0}건 피드백`}
          icon="solar:star-bold-duotone"
          color="purple"
          stagger="stagger-4"
        />
      </div>

      {/* Middle Row: 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hourly Revenue Chart */}
        <div
          className="rounded-2xl p-6 border animate-fade-in-up stagger-2 ease-premium transition-colors duration-300"
          style={{
            background: 'var(--w-surface)',
            borderColor: 'var(--w-border)',
            boxShadow: '0 4px 24px rgba(249, 115, 22, 0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold" style={{ color: 'var(--w-text)' }}>
              시간대별 매출
            </h3>
            <Icon
              icon="solar:chart-2-bold-duotone"
              width={20}
              style={{ color: 'var(--w-text-muted)' }}
            />
          </div>
          {kpi?.hourlyRevenue && kpi.hourlyRevenue.length > 0 ? (
            <div className="flex items-end gap-1.5 h-44">
              {Array.from({ length: 14 }, (_, i) => i + 10).map(hour => {
                const data = kpi.hourlyRevenue.find(h => h.hour === hour);
                const maxRev = Math.max(...kpi.hourlyRevenue.map(h => h.revenue), 1);
                const height = data ? (data.revenue / maxRev * 100) : 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-md relative overflow-hidden"
                      style={{ height: '130px', background: 'var(--w-elevated)' }}
                    >
                      <div
                        className="absolute bottom-0 w-full rounded-md ease-premium transition-all duration-700"
                        style={{
                          height: `${height}%`,
                          background: height > 70
                            ? 'var(--w-accent)'
                            : height > 30
                            ? 'var(--w-warning)'
                            : 'var(--w-text-muted)',
                          boxShadow: height > 50
                            ? '0 -4px 12px rgba(249, 115, 22, 0.25)'
                            : 'none',
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: 'var(--w-text-muted)' }}
                    >
                      {hour}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="h-44 flex items-center justify-center text-sm rounded-xl"
              style={{ color: 'var(--w-text-muted)', background: 'var(--w-elevated)' }}
            >
              주문 데이터가 쌓이면 차트가 표시됩니다
            </div>
          )}
        </div>

        {/* Table Status */}
        <div
          className="rounded-2xl p-6 border animate-fade-in-up stagger-3 ease-premium transition-colors duration-300"
          style={{
            background: 'var(--w-surface)',
            borderColor: 'var(--w-border)',
            boxShadow: '0 4px 24px rgba(249, 115, 22, 0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold" style={{ color: 'var(--w-text)' }}>
              테이블 현황
            </h3>
            <Icon
              icon="solar:sofa-2-bold-duotone"
              width={20}
              style={{ color: 'var(--w-text-muted)' }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {(tables.length > 0 ? tables : Array.from({ length: 12 }, (_, i) => ({
              number: i + 1,
              name: i < 8 ? `홀 ${i + 1}` : `룸 ${String.fromCharCode(65 + i - 8)}`,
              status: 'available',
              seats: i < 8 ? 4 : 6,
            }))).map((table: any) => {
              const statusStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
                occupied: {
                  bg: 'var(--w-accent-dim)',
                  border: 'rgba(249, 115, 22, 0.3)',
                  text: 'var(--w-accent)',
                  glow: '0 0 12px rgba(249, 115, 22, 0.15)',
                },
                reserved: {
                  bg: 'var(--w-info-dim)',
                  border: 'rgba(59, 130, 246, 0.3)',
                  text: 'var(--w-info)',
                  glow: '0 0 12px rgba(59, 130, 246, 0.10)',
                },
                cleaning: {
                  bg: 'var(--w-warning-dim)',
                  border: 'rgba(234, 179, 8, 0.3)',
                  text: 'var(--w-warning)',
                  glow: 'none',
                },
                available: {
                  bg: 'var(--w-success-dim)',
                  border: 'rgba(34, 197, 94, 0.25)',
                  text: 'var(--w-success)',
                  glow: 'none',
                },
              };
              const s = statusStyles[table.status] ?? statusStyles.available;

              return (
                <div
                  key={table.number}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center border ease-premium transition-all duration-300 hover:scale-[1.04] cursor-default"
                  style={{
                    background: s.bg,
                    borderColor: s.border,
                    color: s.text,
                    boxShadow: s.glow,
                  }}
                >
                  <span className="text-lg font-bold">{table.number}</span>
                  <span className="text-[10px] opacity-70">{table.name ?? `T${table.number}`}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-5 mt-4 text-xs" style={{ color: 'var(--w-text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--w-success)' }} />
              빈 테이블
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--w-accent)' }} />
              사용 중
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--w-info)' }} />
              예약
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--w-warning)' }} />
              정리 중
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Menu Ranking */}
        <div
          className="rounded-2xl p-6 border animate-fade-in-up stagger-3 ease-premium transition-colors duration-300"
          style={{
            background: 'var(--w-surface)',
            borderColor: 'var(--w-border)',
            boxShadow: '0 4px 24px rgba(249, 115, 22, 0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold" style={{ color: 'var(--w-text)' }}>
              인기 메뉴 TOP 5
            </h3>
            <Icon
              icon="solar:cup-star-bold-duotone"
              width={20}
              style={{ color: 'var(--w-text-muted)' }}
            />
          </div>
          <div className="space-y-3.5">
            {menuRanking.length > 0 ? menuRanking.map((item, i) => {
              const rankColors = [
                { bg: 'var(--w-accent)', text: '#fff' },
                { bg: 'var(--w-text-muted)', text: '#fff' },
                { bg: 'var(--w-warning)', text: 'var(--w-bg)' },
              ];
              const rc = rankColors[i] ?? {
                bg: 'var(--w-elevated)',
                text: 'var(--w-text-muted)',
              };

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 group"
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: rc.bg, color: rc.text }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--w-text)' }}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
                      {item.totalOrders}건 · ₱{Number(item.totalRevenue).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>
                주문 데이터 수집 중...
              </p>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div
          className="rounded-2xl p-6 border animate-fade-in-up stagger-3 ease-premium transition-colors duration-300"
          style={{
            background: 'var(--w-surface)',
            borderColor: 'var(--w-border)',
            boxShadow: '0 4px 24px rgba(249, 115, 22, 0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3
              className="font-semibold flex items-center gap-2"
              style={{ color: 'var(--w-text)' }}
            >
              <Icon
                icon="solar:magic-stick-3-bold-duotone"
                width={18}
                style={{ color: 'var(--w-accent)' }}
              />
              AI 인사이트
            </h3>
          </div>
          <div className="space-y-2.5">
            {insights.length > 0 ? insights.map(insight => {
              const severityMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
                critical: {
                  bg: 'var(--w-danger-dim)',
                  border: 'rgba(239, 68, 68, 0.25)',
                  text: 'var(--w-danger)',
                  icon: 'solar:danger-triangle-bold-duotone',
                },
                warning: {
                  bg: 'var(--w-warning-dim)',
                  border: 'rgba(234, 179, 8, 0.25)',
                  text: 'var(--w-warning)',
                  icon: 'solar:shield-warning-bold-duotone',
                },
                opportunity: {
                  bg: 'var(--w-success-dim)',
                  border: 'rgba(34, 197, 94, 0.25)',
                  text: 'var(--w-success)',
                  icon: 'solar:lightbulb-bolt-bold-duotone',
                },
                info: {
                  bg: 'var(--w-info-dim)',
                  border: 'rgba(59, 130, 246, 0.25)',
                  text: 'var(--w-info)',
                  icon: 'solar:info-circle-bold-duotone',
                },
              };
              const sev = severityMap[insight.severity] ?? severityMap.info;

              return (
                <div
                  key={insight.id}
                  className="rounded-xl p-3.5 border ease-premium transition-all duration-200"
                  style={{
                    background: sev.bg,
                    borderColor: sev.border,
                  }}
                >
                  <p
                    className="text-sm font-medium flex items-center gap-1.5"
                    style={{ color: sev.text }}
                  >
                    {insight.severity === 'critical' && (
                      <Icon icon={sev.icon} width={15} className="shrink-0" />
                    )}
                    {insight.title}
                  </p>
                </div>
              );
            }) : (
              <div
                className="rounded-xl p-4 border"
                style={{
                  background: 'var(--w-accent-dim)',
                  borderColor: 'rgba(249, 115, 22, 0.2)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--w-accent)' }}>
                  데이터 수집 대기 중
                </p>
                <p className="text-xs mt-1.5" style={{ color: 'var(--w-text-muted)' }}>
                  주문이 쌓이면 AI가 자동 분석합니다
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div
          className="rounded-2xl p-6 border animate-fade-in-up stagger-4 ease-premium transition-colors duration-300"
          style={{
            background: 'var(--w-surface)',
            borderColor: 'var(--w-border)',
            boxShadow: '0 4px 24px rgba(249, 115, 22, 0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold" style={{ color: 'var(--w-text)' }}>
              빠른 현황
            </h3>
            <Icon
              icon="solar:graph-new-bold-duotone"
              width={20}
              style={{ color: 'var(--w-text-muted)' }}
            />
          </div>
          <div className="space-y-4">
            <QuickStat
              label="오늘 신규 고객"
              value="-"
              icon="solar:user-plus-bold-duotone"
            />
            <QuickStat
              label="평균 서빙 시간"
              value={kpi?.avgPrepTime ? `${kpi.avgPrepTime}분` : '-'}
              icon="solar:delivery-bold-duotone"
            />
            <QuickStat
              label="테이블 가동률"
              value={
                tables.length > 0
                  ? `${Math.round(tables.filter((t: any) => t.status === 'occupied').length / tables.length * 100)}%`
                  : '-'
              }
              icon="solar:chair-bold-duotone"
            />
            <QuickStat
              label="어제 대비"
              value={
                kpi?.revenueChangePercent
                  ? `${kpi.revenueChangePercent > 0 ? '+' : ''}${kpi.revenueChangePercent}%`
                  : '-'
              }
              icon="solar:transfer-vertical-bold-duotone"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, change, sublabel, icon, color, stagger }: {
  label: string;
  value: string;
  change?: number;
  sublabel?: string;
  icon: string;
  color: 'accent' | 'info' | 'warning' | 'purple';
  stagger?: string;
}) {
  const colorMap: Record<string, { primary: string; dim: string }> = {
    accent: { primary: 'var(--w-accent)', dim: 'var(--w-accent-dim)' },
    info: { primary: 'var(--w-info)', dim: 'var(--w-info-dim)' },
    warning: { primary: 'var(--w-warning)', dim: 'var(--w-warning-dim)' },
    purple: { primary: 'var(--w-purple)', dim: 'var(--w-purple-dim)' },
  };

  const c = colorMap[color];

  return (
    <div
      className={`rounded-2xl p-5 border ease-premium transition-all duration-300 hover:scale-[1.02] animate-fade-in-up ${stagger ?? ''}`}
      style={{
        background: 'var(--w-surface)',
        borderColor: 'var(--w-border)',
        boxShadow: `0 4px 20px ${c.dim}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: 'var(--w-text-dim)' }}>
          {label}
        </span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: c.dim }}
        >
          <Icon icon={icon} width={20} style={{ color: c.primary }} />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: c.primary }}>
        {value}
      </p>
      {change !== undefined && (
        <p
          className="text-xs mt-2 flex items-center gap-1 font-medium"
          style={{ color: change >= 0 ? 'var(--w-success)' : 'var(--w-danger)' }}
        >
          <Icon
            icon={change >= 0 ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'}
            width={12}
          />
          {change >= 0 ? '+' : ''}{change}% vs 어제
        </p>
      )}
      {sublabel && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--w-text-muted)' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

function QuickStat({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div
      className="flex justify-between items-center py-3 px-4 rounded-xl ease-premium transition-all duration-200"
      style={{
        background: 'var(--w-elevated)',
        borderLeft: '2px solid var(--w-border)',
      }}
    >
      <span className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--w-text-dim)' }}>
        {icon && (
          <Icon icon={icon} width={16} style={{ color: 'var(--w-text-muted)' }} />
        )}
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color: 'var(--w-text)' }}>
        {value}
      </span>
    </div>
  );
}
