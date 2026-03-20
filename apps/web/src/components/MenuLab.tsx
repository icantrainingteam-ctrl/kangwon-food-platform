'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api, type MenuMatrixData, type MenuMatrixItem } from '../lib/api';

const QUADRANT_CONFIG = {
  star: { label: 'Star', icon: 'solar:star-bold', color: 'var(--w-warning)', dimColor: 'var(--w-warning-dim)', desc: '높은 인기 + 높은 마진' },
  cash_cow: { label: 'Cash Cow', icon: 'solar:hand-money-bold', color: 'var(--w-success)', dimColor: 'var(--w-success-dim)', desc: '높은 인기 + 낮은 마진' },
  question_mark: { label: 'Question Mark', icon: 'solar:question-circle-bold', color: 'var(--w-info)', dimColor: 'var(--w-info-dim)', desc: '낮은 인기 + 높은 마진' },
  dog: { label: 'Dog', icon: 'solar:danger-triangle-bold', color: 'var(--w-danger)', dimColor: 'var(--w-danger-dim)', desc: '낮은 인기 + 낮은 마진' },
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
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--w-text)' }}>Menu Lab</h2>
          <p className="mt-1" style={{ color: 'var(--w-text-muted)' }}>메뉴 매트릭스 · AI 추천 · 원가 분석</p>
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

      {/* BCG 매트릭스 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['star', 'cash_cow', 'question_mark', 'dog'] as const).map(q => {
          const config = QUADRANT_CONFIG[q];
          const count = data?.summary?.[q === 'star' ? 'stars' : q === 'cash_cow' ? 'cashCows' : q === 'question_mark' ? 'questionMarks' : 'dogs'] ?? 0;
          const isActive = selectedQuadrant === q;
          return (
            <button
              key={q}
              onClick={() => setSelectedQuadrant(selectedQuadrant === q ? null : q)}
              className="p-4 rounded-2xl border ease-premium text-left"
              style={{
                background: isActive ? config.dimColor : 'var(--w-surface)',
                borderColor: isActive ? config.color : 'var(--w-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon icon={config.icon} width={22} style={{ color: config.color }} />
                <span className="font-bold" style={{ color: 'var(--w-text)' }}>{config.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: config.color }}>{count}개</p>
              <p className="text-xs mt-1" style={{ color: 'var(--w-text-muted)' }}>{config.desc}</p>
            </button>
          );
        })}
      </div>

      {/* 메뉴 매트릭스 시각화 */}
      <div className="rounded-2xl p-6 border mb-6" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
        <h3 className="font-bold mb-4" style={{ color: 'var(--w-text)' }}>메뉴 매트릭스 (인기도 x 마진율)</h3>
        <div className="relative h-80 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--w-border)' }}>
          {/* 축 라벨 */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>
            마진율 (%) ↑
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>
            주문 수 →
          </div>

          {/* 4분면 배경 */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="flex items-center justify-center text-xs border-r border-b" style={{ background: 'var(--w-info-dim)', borderColor: 'var(--w-border)', color: 'var(--w-text-muted)' }}>
              <Icon icon="solar:question-circle-bold" width={14} className="mr-1" /> Question Mark
            </div>
            <div className="flex items-center justify-center text-xs border-b" style={{ background: 'var(--w-warning-dim)', borderColor: 'var(--w-border)', color: 'var(--w-text-muted)' }}>
              <Icon icon="solar:star-bold" width={14} className="mr-1" /> Star
            </div>
            <div className="flex items-center justify-center text-xs border-r" style={{ background: 'var(--w-danger-dim)', borderColor: 'var(--w-border)', color: 'var(--w-text-muted)' }}>
              <Icon icon="solar:danger-triangle-bold" width={14} className="mr-1" /> Dog
            </div>
            <div className="flex items-center justify-center text-xs" style={{ background: 'var(--w-success-dim)', color: 'var(--w-text-muted)' }}>
              <Icon icon="solar:hand-money-bold" width={14} className="mr-1" /> Cash Cow
            </div>
          </div>

          {/* 메뉴 점들 */}
          {data?.items.map(item => {
            const maxOrders = Math.max(...(data.items.map(i => i.totalOrders) || [1]));
            const x = maxOrders > 0 ? (item.totalOrders / maxOrders * 80 + 10) : 50;
            const y = 90 - (Math.min(item.margin, 100) / 100 * 80 + 10);

            const dotColor = item.quadrant === 'star' ? 'var(--w-warning)'
              : item.quadrant === 'cash_cow' ? 'var(--w-success)'
              : item.quadrant === 'question_mark' ? 'var(--w-info)'
              : 'var(--w-danger)';

            return (
              <div
                key={item.id}
                className="absolute group cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className="w-3 h-3 rounded-full border-2 ease-premium group-hover:scale-150"
                  style={{ background: dotColor, borderColor: dotColor }}
                />
                {/* 툴팁 */}
                <div
                  className="hidden group-hover:block absolute z-10 text-xs rounded-lg p-2 -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ background: 'var(--w-elevated)', color: 'var(--w-text)', border: '1px solid var(--w-border)' }}
                >
                  {item.name} · 마진 {item.margin}% · {item.totalOrders}건
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--w-border)' }}>
          <h3 className="font-bold" style={{ color: 'var(--w-text)' }}>
            메뉴 상세 {selectedQuadrant && `· ${QUADRANT_CONFIG[selectedQuadrant as keyof typeof QUADRANT_CONFIG].label}`}
          </h3>
          <span className="text-sm" style={{ color: 'var(--w-text-muted)' }}>{filteredItems.length}개 메뉴</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--w-bg)' }}>
              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>메뉴</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>가격</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>원가</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>마진</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>주문 수</th>
              <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>매출</th>
              <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--w-text-muted)' }}>분류</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const config = QUADRANT_CONFIG[item.quadrant];
              return (
                <tr key={item.id} className="ease-premium" style={{ borderBottom: '1px solid var(--w-border)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm" style={{ color: 'var(--w-text)' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>{item.nameEn}</p>
                    <div className="flex gap-1 mt-1">
                      {item.tags?.map((tag: string) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--w-accent-dim)', color: 'var(--w-accent)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--w-text)' }}>₱{item.price}</td>
                  <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--w-text-dim)' }}>₱{item.costPrice}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold" style={{ color: item.margin >= 50 ? 'var(--w-success)' : item.margin >= 30 ? 'var(--w-warning)' : 'var(--w-danger)' }}>
                      {item.margin}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--w-text)' }}>{item.totalOrders}건</td>
                  <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--w-text)' }}>₱{item.totalRevenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border"
                      style={{ background: config.dimColor, color: config.color, borderColor: config.color }}
                    >
                      <Icon icon={config.icon} width={12} /> {config.label}
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
