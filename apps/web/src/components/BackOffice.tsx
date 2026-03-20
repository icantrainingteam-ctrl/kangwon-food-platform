'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@iconify/react';
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
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--w-text)' }}>백오피스 (재무)</h2>
          <p className="mt-1" style={{ color: 'var(--w-text-muted)' }}>전표 · 원장 · 마감 · 영수증 스캔</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ease-premium"
            style={{ background: 'var(--w-accent)', color: '#000' }}
          >
            <Icon icon="solar:add-circle-bold" width={16} /> 거래 등록
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ease-premium"
            style={{ background: 'var(--w-success-dim)', color: 'var(--w-success)' }}
          >
            <Icon icon="solar:file-text-bold" width={16} /> CSV
          </button>
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ease-premium"
            style={{ background: 'var(--w-surface)', color: 'var(--w-text-dim)', border: '1px solid var(--w-border)' }}
          >
            <Icon icon="solar:download-minimalistic-bold" width={16} /> 백업
          </button>
        </div>
      </div>

      {/* 거래 등록 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 border mb-6" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--w-text)' }}>거래 등록</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--w-text-muted)' }}>구분</label>
              <div className="flex p-1 rounded-xl" style={{ background: 'var(--w-bg)' }}>
                <button type="button" onClick={() => setFormData(f => ({...f, type: 'expense'}))}
                  className="flex-1 py-2 rounded-lg text-sm font-bold ease-premium"
                  style={{
                    background: formData.type === 'expense' ? 'var(--w-accent)' : 'transparent',
                    color: formData.type === 'expense' ? '#000' : 'var(--w-text-muted)',
                  }}>
                  지출
                </button>
                <button type="button" onClick={() => setFormData(f => ({...f, type: 'income'}))}
                  className="flex-1 py-2 rounded-lg text-sm font-bold ease-premium"
                  style={{
                    background: formData.type === 'income' ? 'var(--w-success)' : 'transparent',
                    color: formData.type === 'income' ? '#000' : 'var(--w-text-muted)',
                  }}>
                  수입
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--w-text-muted)' }}>금액 (PHP)</label>
              <input type="number" value={formData.amount}
                onChange={e => setFormData(f => ({...f, amount: e.target.value}))}
                className="w-full p-2 rounded-xl text-sm"
                style={{ background: 'var(--w-bg)', color: 'var(--w-text)', border: '1px solid var(--w-border)' }}
                placeholder="0" required />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--w-text-muted)' }}>날짜</label>
              <input type="date" value={formData.date}
                onChange={e => setFormData(f => ({...f, date: e.target.value}))}
                className="w-full p-2 rounded-xl text-sm"
                style={{ background: 'var(--w-bg)', color: 'var(--w-text)', border: '1px solid var(--w-border)' }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--w-text-muted)' }}>결제 수단</label>
              <select value={formData.sourceId}
                onChange={e => setFormData(f => ({...f, sourceId: e.target.value}))}
                className="w-full p-2 rounded-xl text-sm"
                style={{ background: 'var(--w-bg)', color: 'var(--w-text)', border: '1px solid var(--w-border)' }}>
                <option value="">선택</option>
                {sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {formData.type === 'expense' && (
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--w-text-muted)' }}>카테고리</label>
                <select value={formData.categoryId}
                  onChange={e => setFormData(f => ({...f, categoryId: e.target.value}))}
                  className="w-full p-2 rounded-xl text-sm"
                  style={{ background: 'var(--w-bg)', color: 'var(--w-text)', border: '1px solid var(--w-border)' }}>
                  <option value="">선택</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: 'var(--w-text-muted)' }}>설명</label>
              <input type="text" value={formData.description}
                onChange={e => setFormData(f => ({...f, description: e.target.value}))}
                className="w-full p-2 rounded-xl text-sm"
                style={{ background: 'var(--w-bg)', color: 'var(--w-text)', border: '1px solid var(--w-border)' }}
                placeholder="예: 식자재 구매" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 rounded-xl font-bold text-sm"
                style={{ background: 'var(--w-accent)', color: '#000' }}>
                등록
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 자산 현황 카드 */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {sources.map((source: any) => (
          <div key={source.id} className="rounded-2xl p-4 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
            <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>{source.name}</p>
            <p className="text-lg font-bold" style={{ color: 'var(--w-text)' }}>₱{Number(source.currentBalance).toLocaleString()}</p>
          </div>
        ))}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--w-success-dim)', borderColor: 'var(--w-success)' }}>
          <p className="text-xs" style={{ color: 'var(--w-success)' }}>오늘 수입</p>
          <p className="text-lg font-bold" style={{ color: 'var(--w-success)' }}>+₱{todayIncome.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--w-danger-dim)', borderColor: 'var(--w-danger)' }}>
          <p className="text-xs" style={{ color: 'var(--w-danger)' }}>오늘 지출</p>
          <p className="text-lg font-bold" style={{ color: 'var(--w-danger)' }}>-₱{todayExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--w-surface)' }}>
        {[
          { key: 'journal' as const, label: '통합 전표', icon: 'solar:document-text-bold' },
          { key: 'ledger' as const, label: '계정별 원장', icon: 'solar:buildings-2-bold' },
          { key: 'closing' as const, label: '마감/백업', icon: 'solar:safe-circle-bold' },
          { key: 'scan' as const, label: '영수증 스캔', icon: 'solar:camera-bold' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setBoTab(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ease-premium"
            style={{
              background: boTab === tab.key ? 'var(--w-elevated)' : 'transparent',
              color: boTab === tab.key ? 'var(--w-text)' : 'var(--w-text-muted)',
            }}>
            <Icon icon={tab.icon} width={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 통합 전표 (Journal) */}
      {boTab === 'journal' && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--w-bg)', borderBottom: '1px solid var(--w-border)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--w-text-muted)' }}>날짜</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--w-text-muted)' }}>구분</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--w-text-muted)' }}>계정</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--w-text-muted)' }}>카테고리</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--w-text-muted)' }}>내용</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-text-muted)' }}>금액</th>
                  <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--w-text-muted)' }}>삭제</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => {
                  const isIncome = t.type === 'income';
                  return (
                    <tr key={t.id} className="ease-premium" style={{ borderBottom: '1px solid var(--w-border)' }}>
                      <td className="px-4 py-3" style={{ color: 'var(--w-text-dim)' }}>{t.date}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            background: isIncome ? 'var(--w-success-dim)' : 'var(--w-accent-dim)',
                            color: isIncome ? 'var(--w-success)' : 'var(--w-accent)',
                          }}
                        >
                          {isIncome ? '수입' : '지출'}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--w-text-dim)' }}>
                        {sources.find((s: any) => s.id === t.sourceId)?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--w-text-muted)' }}>
                        {categories.find((c: any) => c.id === t.categoryId)?.name || '-'}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--w-text)' }}>{t.description || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: isIncome ? 'var(--w-success)' : 'var(--w-text)' }}>
                        {isIncome ? '+' : '-'}₱{Number(t.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button style={{ color: 'var(--w-text-muted)' }}>
                          <Icon icon="solar:trash-bin-trash-bold" width={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center" style={{ color: 'var(--w-text-muted)' }}>내역이 없습니다</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 계정별 원장 (Ledger) */}
      {boTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--w-text-muted)' }}>원장 선택:</span>
            <select value={selectedSourceId} onChange={e => setSelectedSourceId(e.target.value)}
              className="flex-1 font-bold text-sm p-1 rounded-lg"
              style={{ background: 'transparent', color: 'var(--w-text)' }}>
              {sources.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} (잔액: ₱{Number(s.currentBalance).toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--w-bg)', borderBottom: '1px solid var(--w-border)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--w-text-muted)' }}>날짜</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--w-text-muted)' }}>내용</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-success)' }}>입금 (차변)</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-danger)' }}>출금 (대변)</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-text-muted)' }}>잔액</th>
                </tr>
              </thead>
              <tbody>
                {ledgerData.map((row: any) => (
                  <tr key={row.id} className="ease-premium"
                    style={{
                      borderBottom: '1px solid var(--w-border)',
                      background: row.type === 'INIT' ? 'var(--w-info-dim)' : 'transparent',
                    }}>
                    <td className="px-4 py-3" style={{ color: 'var(--w-text-dim)' }}>{row.date}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--w-text)' }}>{row.description}</td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-success)' }}>
                      {row.inAmount > 0 ? `+₱${row.inAmount.toLocaleString()}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-danger)' }}>
                      {row.outAmount > 0 ? `-₱${row.outAmount.toLocaleString()}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--w-text)' }}>
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
          <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--w-text)' }}>오늘 현황 ({today})</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--w-success-dim)' }}>
                <p className="text-xs" style={{ color: 'var(--w-success)' }}>수입</p>
                <p className="text-xl font-bold" style={{ color: 'var(--w-success)' }}>₱{todayIncome.toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--w-danger-dim)' }}>
                <p className="text-xs" style={{ color: 'var(--w-danger)' }}>지출</p>
                <p className="text-xl font-bold" style={{ color: 'var(--w-danger)' }}>₱{todayExpense.toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--w-info-dim)' }}>
                <p className="text-xs" style={{ color: 'var(--w-info)' }}>순이익</p>
                <p className="text-xl font-bold" style={{ color: todayIncome - todayExpense >= 0 ? 'var(--w-info)' : 'var(--w-danger)' }}>
                  ₱{(todayIncome - todayExpense).toLocaleString()}
                </p>
              </div>
            </div>
            <button onClick={handleDailyClose}
              className="w-full py-3 rounded-xl font-bold ease-premium"
              style={{ background: 'var(--w-elevated)', color: 'var(--w-text)' }}>
              오늘 마감 실행
            </button>
          </div>

          {/* 마감 이력 */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--w-border)' }}>
              <h3 className="font-bold" style={{ color: 'var(--w-text)' }}>마감 이력</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--w-bg)', borderBottom: '1px solid var(--w-border)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--w-text-muted)' }}>날짜</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-text-muted)' }}>수입</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-text-muted)' }}>지출</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--w-text-muted)' }}>순이익</th>
                </tr>
              </thead>
              <tbody>
                {closings.map((c: any) => (
                  <tr key={c.id} className="ease-premium" style={{ borderBottom: '1px solid var(--w-border)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--w-text)' }}>{c.date}</td>
                    <td className="px-4 py-3 text-right" style={{ color: 'var(--w-success)' }}>+₱{Number(c.totalIncome).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right" style={{ color: 'var(--w-danger)' }}>-₱{Number(c.totalExpense).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--w-text)' }}>
                      ₱{(Number(c.totalIncome) - Number(c.totalExpense)).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {closings.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--w-text-muted)' }}>마감 이력이 없습니다</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 백업/복원 */}
          <div className="rounded-2xl p-6 border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--w-text)' }}>백업 & 복원</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleBackup}
                className="flex items-center justify-center gap-2 py-4 rounded-xl font-medium ease-premium"
                style={{ background: 'var(--w-bg)', color: 'var(--w-text-dim)' }}>
                <Icon icon="solar:download-minimalistic-bold" width={20} /> 전체 백업 다운로드
              </button>
              <label className="flex items-center justify-center gap-2 py-4 rounded-xl font-medium cursor-pointer ease-premium"
                style={{ background: 'var(--w-bg)', color: 'var(--w-text-dim)' }}>
                <Icon icon="solar:restart-bold" width={20} /> 백업 복원
                <input type="file" accept=".json" className="hidden" onChange={() => {/* TODO */}} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 영수증 스캔 */}
      {boTab === 'scan' && (
        <div className="rounded-2xl p-8 border text-center" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
          <Icon icon="solar:camera-bold" width={64} className="mx-auto mb-4" style={{ color: 'var(--w-text-muted)' }} />
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--w-text)' }}>영수증 스캔</h3>
          <p className="mb-6" style={{ color: 'var(--w-text-dim)' }}>영수증 사진을 올리면 AI(Gemini)가 자동으로 날짜, 금액, 사용처를 추출합니다.</p>

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
            className="px-8 py-4 rounded-2xl font-bold text-lg ease-premium flex items-center gap-2 mx-auto"
            style={{
              background: isScanning ? 'var(--w-surface)' : 'var(--w-accent)',
              color: isScanning ? 'var(--w-text-muted)' : '#000',
            }}>
            <Icon icon="solar:camera-bold" width={24} />
            {isScanning ? '분석 중...' : '사진 업로드'}
          </button>

          <p className="text-xs mt-4" style={{ color: 'var(--w-text-muted)' }}>
            Gemini 2.5 Flash 기반 · 한국어/영어/타갈로그 영수증 지원
          </p>
        </div>
      )}
    </div>
  );
}
