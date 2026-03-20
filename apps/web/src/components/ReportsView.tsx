'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, BarChart3 } from 'lucide-react';
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">리포트</h2>
          <p className="text-slate-500 mt-1">매출 트렌드 · 결제수단 · 카테고리 · 직원 성과</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                days === d ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {d}일
            </button>
          ))}
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">기간 총 매출</p>
          <p className="text-2xl font-bold text-emerald-600">₱{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">기간 총 주문</p>
          <p className="text-2xl font-bold text-blue-600">{totalOrders}건</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">평균 객단가</p>
          <p className="text-2xl font-bold text-orange-600">
            ₱{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* 매출 트렌드 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-500" />
          매출 트렌드
        </h3>
        {trend?.trend && trend.trend.length > 0 ? (
          <div className="flex items-end gap-1 h-48">
            {trend.trend.map(day => {
              const maxRev = Math.max(...trend.trend.map(d => Number(d.revenue)), 1);
              const height = (Number(day.revenue) / maxRev) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full bg-emerald-400 rounded-t transition-all hover:bg-emerald-500"
                    style={{ height: `${height}%`, minHeight: '2px' }} />
                  <span className="text-[8px] text-slate-400 -rotate-45">{day.date.slice(5)}</span>
                  <div className="hidden group-hover:block absolute -top-14 bg-slate-900 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10">
                    {day.date}<br />₱{Number(day.revenue).toLocaleString()} · {day.orders}건
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">데이터 수집 중...</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* 결제수단별 분포 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">결제수단별 매출</h3>
          {trend?.paymentDistribution && trend.paymentDistribution.length > 0 ? (
            <div className="space-y-3">
              {trend.paymentDistribution.map(pm => {
                const total = trend.paymentDistribution.reduce((s, p) => s + Number(p.total), 0) || 1;
                const percent = Math.round(Number(pm.total) / total * 100);
                const label = pm.method === 'cash' ? '현금' : pm.method === 'card' ? '카드' : pm.method === 'gcash' ? 'GCash' : pm.method;
                return (
                  <div key={pm.method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{label}</span>
                      <span className="text-slate-500">₱{Number(pm.total).toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">데이터 수집 중...</p>
          )}
        </div>

        {/* 카테고리별 매출 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">카테고리별 매출</h3>
          {trend?.categoryRevenue && trend.categoryRevenue.length > 0 ? (
            <div className="space-y-3">
              {trend.categoryRevenue.map(cat => {
                const total = trend.categoryRevenue.reduce((s, c) => s + Number(c.revenue), 0) || 1;
                const percent = Math.round(Number(cat.revenue) / total * 100);
                return (
                  <div key={cat.categoryId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{cat.categoryName}</span>
                      <span className="text-slate-500">₱{Number(cat.revenue).toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">데이터 수집 중...</p>
          )}
        </div>
      </div>

      {/* 직원 성과 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">직원별 서빙 성과</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">직원</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">직책</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">서빙 건수</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">관련 매출</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">평균 평점</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">피드백 수</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffPerf.length > 0 ? staffPerf.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-sm">{s.name}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{s.role}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{s.ordersServed}건</td>
                <td className="px-4 py-3 text-sm text-right">₱{Number(s.totalRevenue).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={`font-medium ${Number(s.avgRating) >= 4.5 ? 'text-emerald-600' : Number(s.avgRating) >= 4 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {Number(s.avgRating) > 0 ? s.avgRating : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-slate-500">{s.feedbackCount}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">데이터 수집 중...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
