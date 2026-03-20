'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { api, type MenuMatrixData, type MenuMatrixItem } from '../lib/api';

const QUADRANT_CONFIG = {
  star: { label: 'Star', emoji: '⭐', color: 'bg-yellow-50 border-yellow-300 text-yellow-800', desc: '높은 인기 + 높은 마진' },
  cash_cow: { label: 'Cash Cow', emoji: '🐄', color: 'bg-emerald-50 border-emerald-300 text-emerald-800', desc: '높은 인기 + 낮은 마진' },
  question_mark: { label: 'Question Mark', emoji: '❓', color: 'bg-blue-50 border-blue-300 text-blue-800', desc: '낮은 인기 + 높은 마진' },
  dog: { label: 'Dog', emoji: '🐕', color: 'bg-red-50 border-red-300 text-red-800', desc: '낮은 인기 + 낮은 마진' },
};

export function MenuLab() {
  const [data, setData] = useState<MenuMatrixData | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.getMenuMatrix(days).then(setData).catch(console.error);
  }, [days]);

  const filteredItems = selectedQuadrant
    ? data?.items.filter(i => i.quadrant === selectedQuadrant) ?? []
    : data?.items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Menu Lab</h2>
          <p className="text-slate-500 mt-1">메뉴 매트릭스 · AI 추천 · 원가 분석</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                days === d ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d}일
            </button>
          ))}
        </div>
      </div>

      {/* BCG 매트릭스 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['star', 'cash_cow', 'question_mark', 'dog'] as const).map(q => {
          const config = QUADRANT_CONFIG[q];
          const count = data?.summary?.[q === 'star' ? 'stars' : q === 'cash_cow' ? 'cashCows' : q === 'question_mark' ? 'questionMarks' : 'dogs'] ?? 0;
          return (
            <button
              key={q}
              onClick={() => setSelectedQuadrant(selectedQuadrant === q ? null : q)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedQuadrant === q ? config.color + ' shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{config.emoji}</span>
                <span className="font-bold text-slate-800">{config.label}</span>
              </div>
              <p className="text-2xl font-bold">{count}개</p>
              <p className="text-xs text-slate-500 mt-1">{config.desc}</p>
            </button>
          );
        })}
      </div>

      {/* 메뉴 매트릭스 시각화 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">메뉴 매트릭스 (인기도 × 마진율)</h3>
        <div className="relative h-80 border border-slate-200 rounded-lg overflow-hidden">
          {/* 축 라벨 */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-400 font-medium">
            마진율 (%) ↑
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">
            주문 수 →
          </div>

          {/* 4분면 배경 */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-blue-50/50 border-r border-b border-slate-200 flex items-center justify-center text-slate-300 text-xs">❓ Question Mark</div>
            <div className="bg-yellow-50/50 border-b border-slate-200 flex items-center justify-center text-slate-300 text-xs">⭐ Star</div>
            <div className="bg-red-50/50 border-r border-slate-200 flex items-center justify-center text-slate-300 text-xs">🐕 Dog</div>
            <div className="bg-emerald-50/50 flex items-center justify-center text-slate-300 text-xs">🐄 Cash Cow</div>
          </div>

          {/* 메뉴 점들 */}
          {data?.items.map(item => {
            const maxOrders = Math.max(...(data.items.map(i => i.totalOrders) || [1]));
            const x = maxOrders > 0 ? (item.totalOrders / maxOrders * 80 + 10) : 50;
            const y = 90 - (Math.min(item.margin, 100) / 100 * 80 + 10);

            return (
              <div
                key={item.id}
                className="absolute group cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className={`w-3 h-3 rounded-full border-2 transition-all group-hover:scale-150 ${
                  item.quadrant === 'star' ? 'bg-yellow-400 border-yellow-500' :
                  item.quadrant === 'cash_cow' ? 'bg-emerald-400 border-emerald-500' :
                  item.quadrant === 'question_mark' ? 'bg-blue-400 border-blue-500' :
                  'bg-red-400 border-red-500'
                }`} />
                {/* 툴팁 */}
                <div className="hidden group-hover:block absolute z-10 bg-slate-900 text-white text-xs rounded-lg p-2 -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {item.name} · 마진 {item.margin}% · {item.totalOrders}건
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            메뉴 상세 {selectedQuadrant && `· ${QUADRANT_CONFIG[selectedQuadrant as keyof typeof QUADRANT_CONFIG].label}`}
          </h3>
          <span className="text-sm text-slate-500">{filteredItems.length}개 메뉴</span>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">메뉴</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">가격</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">원가</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">마진</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">주문 수</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">매출</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">분류</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map(item => {
              const config = QUADRANT_CONFIG[item.quadrant];
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.nameEn}</p>
                    <div className="flex gap-1 mt-1">
                      {item.tags?.map((tag: string) => (
                        <span key={tag} className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">₱{item.price}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-500">₱{item.costPrice}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold ${item.margin >= 50 ? 'text-emerald-600' : item.margin >= 30 ? 'text-orange-600' : 'text-red-600'}`}>
                      {item.margin}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">{item.totalOrders}건</td>
                  <td className="px-4 py-3 text-right text-sm font-medium">₱{item.totalRevenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${config.color}`}>
                      {config.emoji} {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
