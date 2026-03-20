'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Clock, Star, Users, Zap, AlertTriangle } from 'lucide-react';
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
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Command Center</h2>
        <p className="text-slate-500 mt-1">강원 실시간 운영 현황 {loading && '· 로딩 중...'}</p>
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard
          label="오늘 매출"
          value={formatCurrency(kpi?.todayRevenue ?? 0)}
          change={kpi?.revenueChangePercent ?? 0}
          icon={<TrendingUp size={20} />}
          color="emerald"
        />
        <KPICard
          label="주문 건수"
          value={`${kpi?.todayOrders ?? 0}건`}
          sublabel="오늘 결제 완료"
          icon={<ShoppingCart size={20} />}
          color="blue"
        />
        <KPICard
          label="평균 객단가"
          value={formatCurrency(kpi?.avgOrderAmount ?? 0)}
          sublabel={`평균 조리 ${kpi?.avgPrepTime ?? 0}분`}
          icon={<Clock size={20} />}
          color="orange"
        />
        <KPICard
          label="고객 만족도"
          value={kpi?.customerSatisfaction ? `${kpi.customerSatisfaction}점` : '-'}
          sublabel={`${kpi?.feedbackCount ?? 0}건 피드백`}
          icon={<Star size={20} />}
          color="purple"
        />
      </div>

      {/* 2열 그리드 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* 시간대별 매출 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">시간대별 매출</h3>
          {kpi?.hourlyRevenue && kpi.hourlyRevenue.length > 0 ? (
            <div className="flex items-end gap-1 h-40">
              {Array.from({ length: 14 }, (_, i) => i + 10).map(hour => {
                const data = kpi.hourlyRevenue.find(h => h.hour === hour);
                const maxRev = Math.max(...kpi.hourlyRevenue.map(h => h.revenue), 1);
                const height = data ? (data.revenue / maxRev * 100) : 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-slate-100 rounded-t relative" style={{ height: '120px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-orange-400 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{hour}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              주문 데이터가 쌓이면 차트가 표시됩니다
            </div>
          )}
        </div>

        {/* 테이블 현황 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">테이블 현황</h3>
          <div className="grid grid-cols-4 gap-2">
            {(tables.length > 0 ? tables : Array.from({ length: 12 }, (_, i) => ({
              number: i + 1,
              name: i < 8 ? `홀 ${i + 1}` : `룸 ${String.fromCharCode(65 + i - 8)}`,
              status: 'available',
              seats: i < 8 ? 4 : 6,
            }))).map((table: any) => (
              <div
                key={table.number}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium border transition-all ${
                  table.status === 'occupied'
                    ? 'bg-orange-50 text-orange-700 border-orange-300 shadow-sm'
                    : table.status === 'reserved'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : table.status === 'cleaning'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <span className="text-lg font-bold">{table.number}</span>
                <span className="text-[10px]">{table.name ?? `T${table.number}`}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full" /> 빈 테이블</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-400 rounded-full" /> 사용 중</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full" /> 예약</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full" /> 정리 중</span>
          </div>
        </div>
      </div>

      {/* 3열 하단 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top 메뉴 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">인기 메뉴 TOP 5</h3>
          <div className="space-y-3">
            {menuRanking.length > 0 ? menuRanking.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.totalOrders}건 · ₱{Number(item.totalRevenue).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400">주문 데이터 수집 중...</p>
            )}
          </div>
        </div>

        {/* AI 인사이트 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-orange-500" />
            AI 인사이트
          </h3>
          <div className="space-y-2">
            {insights.length > 0 ? insights.map(insight => (
              <div key={insight.id} className={`rounded-lg p-3 border ${
                insight.severity === 'critical' ? 'bg-red-50 border-red-200' :
                insight.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                insight.severity === 'opportunity' ? 'bg-emerald-50 border-emerald-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${
                  insight.severity === 'critical' ? 'text-red-700' :
                  insight.severity === 'warning' ? 'text-yellow-700' :
                  insight.severity === 'opportunity' ? 'text-emerald-700' :
                  'text-blue-700'
                }`}>
                  {insight.severity === 'critical' && <AlertTriangle size={14} className="inline mr-1" />}
                  {insight.title}
                </p>
              </div>
            )) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-700 font-medium">데이터 수집 대기 중</p>
                <p className="text-xs text-orange-500 mt-1">주문이 쌓이면 AI가 자동 분석합니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 빠른 지표 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">빠른 현황</h3>
          <div className="space-y-3">
            <QuickStat label="오늘 신규 고객" value="-" />
            <QuickStat label="평균 서빙 시간" value={kpi?.avgPrepTime ? `${kpi.avgPrepTime}분` : '-'} />
            <QuickStat label="테이블 가동률" value={
              tables.length > 0
                ? `${Math.round(tables.filter((t: any) => t.status === 'occupied').length / tables.length * 100)}%`
                : '-'
            } />
            <QuickStat label="어제 대비" value={
              kpi?.revenueChangePercent
                ? `${kpi.revenueChangePercent > 0 ? '+' : ''}${kpi.revenueChangePercent}%`
                : '-'
            } />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, change, sublabel, icon, color }: {
  label: string;
  value: string;
  change?: number;
  sublabel?: string;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'orange' | 'purple';
}) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${colorMap[color].split(' ')[0]}`}>{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change >= 0 ? '+' : ''}{change}% vs 어제
        </p>
      )}
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-700">{value}</span>
    </div>
  );
}
