'use client';

import { useState, useEffect } from 'react';
import { Globe, Tags, Wallet, Plus, Pencil, Trash2, Monitor, Bell } from 'lucide-react';
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
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">설정</h2>
        <p className="text-slate-500 mt-1">언어 · 결제수단 · 카테고리 · 테이블 · 직원</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* 언어 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Globe size={18} /> 언어 (Language)
          </h3>
          <div className="flex gap-2">
            {[
              { value: 'ko' as const, label: '🇰🇷 한국어' },
              { value: 'en' as const, label: '🇺🇸 English' },
              { value: 'tl' as const, label: '🇵🇭 Tagalog' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setLang(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  lang === opt.value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 결제 수단 관리 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Wallet size={18} /> 결제 수단 관리
            </h3>
            <button className="p-2 bg-orange-500 text-white rounded-lg"><Plus size={16} /></button>
          </div>
          <div className="space-y-2">
            {sources.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500">
                    초기 잔액: ₱{Number(s.initialBalance).toLocaleString()} · 현재: ₱{Number(s.currentBalance).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-slate-400 hover:text-blue-500"><Pencil size={14} /></button>
                  <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 카테고리 관리 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Tags size={18} /> 비용 카테고리 관리
            </h3>
            <button className="p-2 bg-orange-500 text-white rounded-lg"><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c: any) => (
              <span key={c.id} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-full flex items-center gap-1">
                {c.name}
                <button className="text-slate-400 hover:text-red-500 ml-1"><Trash2 size={12} /></button>
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">'-'를 사용하여 그룹을 만들 수 있습니다. (예: 식자재-육류)</p>
        </div>

        {/* 테이블 관리 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Monitor size={18} /> 테이블 관리
            </h3>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {tables.map((t: any) => (
              <div key={t.id} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                <p className="font-bold text-slate-800">{t.number}번</p>
                <p className="text-xs text-slate-400">{t.name || `T${t.number}`}</p>
                <p className="text-xs text-slate-400">{t.seats}인석</p>
              </div>
            ))}
          </div>
        </div>

        {/* 직원 관리 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              직원 목록
            </h3>
            <button className="p-2 bg-orange-500 text-white rounded-lg"><Plus size={16} /></button>
          </div>
          <div className="space-y-2">
            {staff.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{s.name} {s.nameEn && `(${s.nameEn})`}</p>
                    <p className="text-xs text-slate-500">{s.role} · PIN: {s.pin || '-'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-slate-400 hover:text-blue-500"><Pencil size={14} /></button>
                  <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-600 mb-2">시스템 정보</h3>
          <div className="text-sm text-slate-500 space-y-1">
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
