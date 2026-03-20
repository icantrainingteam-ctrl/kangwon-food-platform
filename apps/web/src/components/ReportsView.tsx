'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api, type RevenueTrendData, type StaffPerformanceData } from '../lib/api';

export function ReportsView() {
  const [trend, setTrend] = useState<RevenueTrendData | null>(null);
  const [staffPerf, setStaffPerf] = useState<StaffPerformanceData[]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.getRevenueTrend(days).then(setTrend).catch(() => {});
    api.getStaffPerformance(days).then(setStaffPerf).catch(() => {});
  }, [days]);

  const totalRevenue = trend?.trend.reduce((s, d) => s + Number(d.revenue), 0) ?? 0;
  const totalOrders = trend?.trend.reduce((s, d) => s + Number(d.orders), 0) ?? 0;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--w-text)' }}>리포트</h2>
          <p className="mt-1" style={{ color: 'var(--w-text-muted)' }}>매출 트렌드 · 결제수단 · 카테고리 · 직원 성과</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--w-surface)' }}>
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium ease-premium"
              style={{
                background: days === d ? 'var(--w-accent)' : 'transparent',
                color: days === d ? '#000' : 'var(--w-text-dim)',
              }}
            >
              {d}일
            </button>
          ))}
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl p-5 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>기간 총 매출</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--w-success)' }}>₱{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl p-5 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>기간 총 주문</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--w-info)' }}>{totalOrders}건</p>
        </div>
        <div className="rounded-2xl p-5 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>평균 객단가</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--w-accent)' }}>
            ₱{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* 매출 트렌드 차트 */}
      <div className="rounded-2xl p-6 border mb-6" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
          <Icon icon="solar:graph-up-bold" width={18} style={{ color: 'var(--w-success)' }} />
          매출 트렌드
        </h3>
        {trend?.trend && trend.trend.length > 0 ? (
          <div className="flex items-end gap-1 h-48">
            {trend.trend.map(day => {
              const maxRev = Math.max(...trend.trend.map(d => Number(d.revenue)), 1);
              const height = (Number(day.revenue) / maxRev) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t ease-premium"
                    style={{ height: `${height}%`, minHeight: '2px', background: 'var(--w-success)' }}
                  />
                  <span className="text-[8px] -rotate-45" style={{ color: 'var(--w-text-muted)' }}>{day.date.slice(5)}</span>
                  <div
                    className="hidden group-hover:block absolute -top-14 text-xs rounded-lg p-2 whitespace-nowrap z-10"
                    style={{ background: 'var(--w-elevated)', color: 'var(--w-text)', border: '1px solid var(--w-border)' }}
                  >
                    {day.date}<br />₱{Number(day.revenue).toLocaleString()} · {day.orders}건
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center" style={{ color: 'var(--w-text-muted)' }}>데이터 수집 중...</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* 결제수단별 분포 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--w-text)' }}>결제수단별 매출</h3>
          {trend?.paymentDistribution && trend.paymentDistribution.length > 0 ? (
            <div className="space-y-3">
              {trend.paymentDistribution.map(pm => {
                const total = trend.paymentDistribution.reduce((s, p) => s + Number(p.total), 0) || 1;
                const percent = Math.round(Number(pm.total) / total * 100);
                const label = pm.method === 'cash' ? '현금' : pm.method === 'card' ? '카드' : pm.method === 'gcash' ? 'GCash' : pm.method;
                return (
                  <div key={pm.method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--w-text-dim)' }}>{label}</span>
                      <span style={{ color: 'var(--w-text-muted)' }}>₱{Number(pm.total).toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--w-bg)' }}>
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--w-info)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>데이터 수집 중...</p>
          )}
        </div>

        {/* 카테고리별 매출 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--w-text)' }}>카테고리별 매출</h3>
          {trend?.categoryRevenue && trend.categoryRevenue.length > 0 ? (
            <div className="space-y-3">
              {trend.categoryRevenue.map(cat => {
                const total = trend.categoryRevenue.reduce((s, c) => s + Number(c.revenue), 0) || 1;
                const percent = Math.round(Number(cat.revenue) / total * 100);
                return (
                  <div key={cat.categoryId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--w-text-dim)' }}>{cat.categoryName}</span>
                      <span style={{ color: 'var(--w-text-muted)' }}>₱{Number(cat.revenue).toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--w-bg)' }}>
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--w-accent)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>데이터 수집 중...</p>
          )}
        </div>
      </div>

      {/* 직원 성과 */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--w-border)' }}>
          <h3 className="font-bold" style={{ color: 'var(--w-text)' }}>직원별 서빙 성과</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--w-bg)' }}>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>직원</th>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>직책</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>서빙 건수</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>관련 매출</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>평균 평점</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>피드백 수</th>
            </tr>
          </thead>
          <tbody>
            {staffPerf.length > 0 ? staffPerf.map(s => (
              <tr key={s.id} className="ease-premium" style={{ borderBottom: '1px solid var(--w-border)' }}>
                <td className="px-4 py-3 font-medium text-sm" style={{ color: 'var(--w-text)' }}>{s.name}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--w-text-dim)' }}>{s.role}</td>
                <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--w-text)' }}>{s.ordersServed}건</td>
                <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--w-text)' }}>₱{Number(s.totalRevenue).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className="font-medium" style={{ color: Number(s.avgRating) >= 4.5 ? 'var(--w-success)' : Number(s.avgRating) >= 4 ? 'var(--w-info)' : 'var(--w-warning)' }}>
                    {Number(s.avgRating) > 0 ? s.avgRating : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--w-text-dim)' }}>{s.feedbackCount}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--w-text-muted)' }}>데이터 수집 중...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
