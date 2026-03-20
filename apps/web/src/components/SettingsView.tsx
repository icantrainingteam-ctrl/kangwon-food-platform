'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function SettingsView() {
  const [lang, setLang] = useState<'ko' | 'en' | 'tl'>('ko');
  const [sources, setSources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    api.getFinanceSources().then(setSources).catch(() => {});
    fetch(`${API_URL}/api/finance/categories`).then(r => r.json()).then(setCategories).catch(() => {});
    api.getTables().then(setTables).catch(() => {});
    api.getStaff().then(setStaff).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--w-text)' }}>설정</h2>
        <p className="mt-1" style={{ color: 'var(--w-text-muted)' }}>언어 · 결제수단 · 카테고리 · 테이블 · 직원</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* 언어 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
            <Icon icon="solar:global-bold" width={18} style={{ color: 'var(--w-accent)' }} /> 언어 (Language)
          </h3>
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--w-bg)' }}>
            {[
              { value: 'ko' as const, label: '한국어' },
              { value: 'en' as const, label: 'English' },
              { value: 'tl' as const, label: 'Tagalog' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setLang(opt.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium ease-premium"
                style={{
                  background: lang === opt.value ? 'var(--w-accent)' : 'transparent',
                  color: lang === opt.value ? '#000' : 'var(--w-text-dim)',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 결제 수단 관리 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
              <Icon icon="solar:wallet-bold" width={18} style={{ color: 'var(--w-accent)' }} /> 결제 수단 관리
            </h3>
            <button className="p-2 rounded-xl" style={{ background: 'var(--w-accent)', color: '#000' }}>
              <Icon icon="solar:add-circle-bold" width={16} />
            </button>
          </div>
          <div className="space-y-2">
            {sources.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--w-bg)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--w-text)' }}>{s.name}</p>
                  <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
                    초기 잔액: ₱{Number(s.initialBalance).toLocaleString()} · 현재: ₱{Number(s.currentBalance).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2" style={{ color: 'var(--w-text-muted)' }}>
                    <Icon icon="solar:pen-bold" width={14} />
                  </button>
                  <button className="p-2" style={{ color: 'var(--w-text-muted)' }}>
                    <Icon icon="solar:trash-bin-trash-bold" width={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 카테고리 관리 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
              <Icon icon="solar:tag-bold" width={18} style={{ color: 'var(--w-accent)' }} /> 비용 카테고리 관리
            </h3>
            <button className="p-2 rounded-xl" style={{ background: 'var(--w-accent)', color: '#000' }}>
              <Icon icon="solar:add-circle-bold" width={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c: any) => (
              <span key={c.id} className="px-3 py-1.5 text-sm rounded-full flex items-center gap-1" style={{ background: 'var(--w-bg)', color: 'var(--w-text-dim)' }}>
                {c.name}
                <button className="ml-1" style={{ color: 'var(--w-text-muted)' }}>
                  <Icon icon="solar:trash-bin-trash-bold" width={12} />
                </button>
              </span>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--w-text-muted)' }}>'-'를 사용하여 그룹을 만들 수 있습니다. (예: 식자재-육류)</p>
        </div>

        {/* 테이블 관리 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
              <Icon icon="solar:monitor-bold" width={18} style={{ color: 'var(--w-accent)' }} /> 테이블 관리
            </h3>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {tables.map((t: any) => (
              <div key={t.id} className="rounded-xl p-3 text-center border" style={{ background: 'var(--w-bg)', borderColor: 'var(--w-border)' }}>
                <p className="font-bold" style={{ color: 'var(--w-text)' }}>{t.number}번</p>
                <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>{t.name || `T${t.number}`}</p>
                <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>{t.seats}인석</p>
              </div>
            ))}
          </div>
        </div>

        {/* 직원 관리 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--w-text)' }}>
              <Icon icon="solar:users-group-rounded-bold" width={18} style={{ color: 'var(--w-accent)' }} /> 직원 목록
            </h3>
            <button className="p-2 rounded-xl" style={{ background: 'var(--w-accent)', color: '#000' }}>
              <Icon icon="solar:add-circle-bold" width={16} />
            </button>
          </div>
          <div className="space-y-2">
            {staff.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--w-bg)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--w-accent-dim)', color: 'var(--w-accent)' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--w-text)' }}>{s.name} {s.nameEn && `(${s.nameEn})`}</p>
                    <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>{s.role} · PIN: {s.pin || '-'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2" style={{ color: 'var(--w-text-muted)' }}>
                    <Icon icon="solar:pen-bold" width={14} />
                  </button>
                  <button className="p-2" style={{ color: 'var(--w-text-muted)' }}>
                    <Icon icon="solar:trash-bin-trash-bold" width={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-bg)', borderColor: 'var(--w-border)' }}>
          <h3 className="font-bold mb-2" style={{ color: 'var(--w-text-dim)' }}>시스템 정보</h3>
          <div className="text-sm space-y-1" style={{ color: 'var(--w-text-muted)' }}>
            <p>플랫폼: 강원푸드 iCAN Platform v2.0</p>
            <p>식당명: 강원 (KANGWON)</p>
            <p>API: {API_URL}</p>
            <p>태블릿: http://localhost:3001</p>
            <p>주방 KDS: http://localhost:3002</p>
          </div>
        </div>
      </div>
    </div>
  );
}
