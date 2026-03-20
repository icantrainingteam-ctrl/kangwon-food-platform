'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft, Table2, Building2, Users, Save, FileSpreadsheet,
  Trash2, TrendingUp, TrendingDown, Download, RotateCcw, Camera,
  Plus, Pencil, CheckCircle2, Wallet, CreditCard, Coins, PiggyBank,
  Upload
} from 'lucide-react';
import { api } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type BOTab = 'journal' | 'ledger' | 'closing' | 'scan';

export function BackOffice() {
  const [boTab, setBoTab] = useState<BOTab>('journal');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [closings, setClosings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');

  // 거래 입력 폼
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    description: '',
    categoryId: '',
    sourceId: '',
    staffId: '',
    date: new Date().toISOString().split('T')[0],
  });

  // 영수증 스캔
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txns, srcs, cats, cls] = await Promise.all([
        api.getTransactions(200),
        api.getFinanceSources(),
        fetch(`${API_URL}/api/finance/categories`).then(r => r.json()),
        fetch(`${API_URL}/api/finance/closings`).then(r => r.json()),
      ]);
      setTransactions(txns);
      setSources(srcs);
      setCategories(cats);
      setClosings(cls);
      if (srcs.length > 0 && !selectedSourceId) setSelectedSourceId(srcs[0].id);
    } catch (err) {
      console.error('Failed to load backoffice data:', err);
    }
  };

  // 원장 데이터 (Running Balance)
  const ledgerData = useMemo(() => {
    if (!selectedSourceId) return [];
    const source = sources.find((s: any) => s.id === selectedSourceId);
    if (!source) return [];

    const filtered = transactions
      .filter((t: any) => t.sourceId === selectedSourceId)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = Number(source.initialBalance);
    const rows = [{
      id: 'init', date: '-', description: '기초 잔액 (Initial Balance)',
      inAmount: 0, outAmount: 0, balance, type: 'INIT',
    }];

    for (const t of filtered) {
      const isIncome = t.type === 'income';
      const amount = Number(t.amount);
      if (isIncome) balance += amount;
      else balance -= amount;
      rows.push({
        id: t.id, date: t.date, description: t.description || '-',
        inAmount: isIncome ? amount : 0, outAmount: !isIncome ? amount : 0,
        balance, type: t.type,
      });
    }
    return rows.reverse();
  }, [transactions, selectedSourceId, sources]);

  // 거래 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.sourceId) return;

    try {
      await fetch(`${API_URL}/api/finance/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });
      setShowForm(false);
      setFormData({
        type: 'expense', amount: '', description: '', categoryId: '',
        sourceId: sources[0]?.id || '', staffId: '', date: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (err) {
      console.error('Failed to add transaction:', err);
    }
  };

  // 일일 마감
  const handleDailyClose = async () => {
    try {
      await fetch(`${API_URL}/api/finance/closing`, { method: 'POST' });
      loadData();
      alert('마감이 완료되었습니다.');
    } catch (err) {
      alert('마감 실패');
    }
  };

  // CSV 다운로드
  const downloadCSV = () => {
    const headers = ['날짜', '구분', '계정', '카테고리', '내용', '금액', '담당자'];
    const rows = transactions.map((t: any) => [
      t.date, t.type === 'income' ? '수입' : '지출',
      sources.find((s: any) => s.id === t.sourceId)?.name || '-',
      categories.find((c: any) => c.id === t.categoryId)?.name || '-',
      `"${t.description || ''}"`, t.amount, t.staffId || '-',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kangwon_finance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 백업
  const handleBackup = () => {
    const backup = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: { transactions, sources, categories, closings },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kangwon_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // 오늘 현황
  const today = new Date().toISOString().split('T')[0];
  const todayTx = transactions.filter((t: any) => t.date === today);
  const todayIncome = todayTx.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + Number(t.amount), 0);
  const todayExpense = todayTx.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Number(t.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">백오피스 (재무)</h2>
          <p className="text-slate-500 mt-1">전표 · 원장 · 마감 · 영수증 스캔</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> 거래 등록
          </button>
          <button onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button onClick={handleBackup}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium">
            <Download size={16} /> 백업
          </button>
        </div>
      </div>

      {/* 거래 등록 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">거래 등록</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">구분</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button type="button" onClick={() => setFormData(f => ({...f, type: 'expense'}))}
                  className={`flex-1 py-2 rounded-md text-sm font-bold ${formData.type === 'expense' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}>
                  지출
                </button>
                <button type="button" onClick={() => setFormData(f => ({...f, type: 'income'}))}
                  className={`flex-1 py-2 rounded-md text-sm font-bold ${formData.type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>
                  수입
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">금액 (PHP)</label>
              <input type="number" value={formData.amount}
                onChange={e => setFormData(f => ({...f, amount: e.target.value}))}
                className="w-full p-2 border border-slate-200 rounded-lg" placeholder="0" required />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">날짜</label>
              <input type="date" value={formData.date}
                onChange={e => setFormData(f => ({...f, date: e.target.value}))}
                className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">결제 수단</label>
              <select value={formData.sourceId}
                onChange={e => setFormData(f => ({...f, sourceId: e.target.value}))}
                className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="">선택</option>
                {sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {formData.type === 'expense' && (
              <div>
                <label className="text-xs text-slate-500 mb-1 block">카테고리</label>
                <select value={formData.categoryId}
                  onChange={e => setFormData(f => ({...f, categoryId: e.target.value}))}
                  className="w-full p-2 border border-slate-200 rounded-lg">
                  <option value="">선택</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">설명</label>
              <input type="text" value={formData.description}
                onChange={e => setFormData(f => ({...f, description: e.target.value}))}
                className="w-full p-2 border border-slate-200 rounded-lg" placeholder="예: 식자재 구매" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold">
                등록
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 자산 현황 카드 */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {sources.map((source: any) => (
          <div key={source.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500">{source.name}</p>
            <p className="text-lg font-bold text-slate-800">₱{Number(source.currentBalance).toLocaleString()}</p>
          </div>
        ))}
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-xs text-orange-600">오늘 수입</p>
          <p className="text-lg font-bold text-emerald-600">+₱{todayIncome.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-xs text-orange-600">오늘 지출</p>
          <p className="text-lg font-bold text-red-500">-₱{todayExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        {[
          { key: 'journal' as const, label: '통합 전표', icon: Table2 },
          { key: 'ledger' as const, label: '계정별 원장', icon: Building2 },
          { key: 'closing' as const, label: '마감/백업', icon: Save },
          { key: 'scan' as const, label: '영수증 스캔', icon: Camera },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setBoTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                boTab === tab.key ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
              }`}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 통합 전표 (Journal) */}
      {boTab === 'journal' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                  <th className="px-4 py-3 text-left">날짜</th>
                  <th className="px-4 py-3 text-left">구분</th>
                  <th className="px-4 py-3 text-left">계정</th>
                  <th className="px-4 py-3 text-left">카테고리</th>
                  <th className="px-4 py-3 text-left">내용</th>
                  <th className="px-4 py-3 text-right">금액</th>
                  <th className="px-4 py-3 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t: any) => {
                  const isIncome = t.type === 'income';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{t.date}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {isIncome ? '수입' : '지출'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {sources.find((s: any) => s.id === t.sourceId)?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {categories.find((c: any) => c.id === t.categoryId)?.name || '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{t.description || '-'}</td>
                      <td className={`px-4 py-3 text-right font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {isIncome ? '+' : '-'}₱{Number(t.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">내역이 없습니다</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 계정별 원장 (Ledger) */}
      {boTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-sm font-medium text-slate-500">원장 선택:</span>
            <select value={selectedSourceId} onChange={e => setSelectedSourceId(e.target.value)}
              className="flex-1 bg-transparent font-bold text-slate-800">
              {sources.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} (잔액: ₱{Number(s.currentBalance).toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                  <th className="px-4 py-3 text-left">날짜</th>
                  <th className="px-4 py-3 text-left">내용</th>
                  <th className="px-4 py-3 text-right text-emerald-600">입금 (차변)</th>
                  <th className="px-4 py-3 text-right text-red-500">출금 (대변)</th>
                  <th className="px-4 py-3 text-right">잔액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerData.map((row: any) => (
                  <tr key={row.id} className={`hover:bg-slate-50 ${row.type === 'INIT' ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 text-slate-600">{row.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.description}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                      {row.inAmount > 0 ? `+₱${row.inAmount.toLocaleString()}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right text-red-500 font-medium">
                      {row.outAmount > 0 ? `-₱${row.outAmount.toLocaleString()}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      ₱{row.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 마감/백업 */}
      {boTab === 'closing' && (
        <div className="space-y-6">
          {/* 오늘 현황 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">오늘 현황 ({today})</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-xs text-emerald-600">수입</p>
                <p className="text-xl font-bold text-emerald-700">₱{todayIncome.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-xs text-red-600">지출</p>
                <p className="text-xl font-bold text-red-700">₱{todayExpense.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-600">순이익</p>
                <p className={`text-xl font-bold ${todayIncome - todayExpense >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  ₱{(todayIncome - todayExpense).toLocaleString()}
                </p>
              </div>
            </div>
            <button onClick={handleDailyClose}
              className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700">
              오늘 마감 실행
            </button>
          </div>

          {/* 마감 이력 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b"><h3 className="font-bold text-slate-800">마감 이력</h3></div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">날짜</th>
                  <th className="px-4 py-3 text-right">수입</th>
                  <th className="px-4 py-3 text-right">지출</th>
                  <th className="px-4 py-3 text-right">순이익</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {closings.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{c.date}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">+₱{Number(c.totalIncome).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-500">-₱{Number(c.totalExpense).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      ₱{(Number(c.totalIncome) - Number(c.totalExpense)).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {closings.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">마감 이력이 없습니다</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 백업/복원 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">백업 & 복원</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleBackup}
                className="flex items-center justify-center gap-2 py-4 bg-slate-100 rounded-lg text-slate-700 font-medium hover:bg-slate-200">
                <Download size={20} /> 전체 백업 다운로드
              </button>
              <label className="flex items-center justify-center gap-2 py-4 bg-slate-100 rounded-lg text-slate-700 font-medium hover:bg-slate-200 cursor-pointer">
                <RotateCcw size={20} /> 백업 복원
                <input type="file" accept=".json" className="hidden" onChange={() => {/* TODO */}} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 영수증 스캔 */}
      {boTab === 'scan' && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
          <Camera size={64} className="text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-xl mb-2">영수증 스캔</h3>
          <p className="text-slate-500 mb-6">영수증 사진을 올리면 AI(Gemini)가 자동으로 날짜, 금액, 사용처를 추출합니다.</p>

          <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setIsScanning(true);
              // TODO: Gemini OCR 연동
              setTimeout(() => {
                setIsScanning(false);
                alert('영수증 분석 완료! (Phase 3 완전 연동 예정)');
              }, 2000);
            }} />

          <button onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold rounded-xl text-lg">
            {isScanning ? '분석 중...' : '📸 사진 업로드'}
          </button>

          <p className="text-xs text-slate-400 mt-4">
            Gemini 2.5 Flash 기반 · 한국어/영어/타갈로그 영수증 지원
          </p>
        </div>
      )}
    </div>
  );
}
