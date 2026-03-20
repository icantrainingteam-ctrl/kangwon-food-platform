'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Clock, CheckCircle2, ChefHat, CreditCard, XCircle } from 'lucide-react';
import { api } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  pending: { label: '대기', color: 'bg-slate-100 text-slate-700', icon: Clock },
  confirmed: { label: '접수', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  preparing: { label: '조리중', color: 'bg-yellow-100 text-yellow-700', icon: ChefHat },
  ready: { label: '서빙대기', color: 'bg-emerald-100 text-emerald-700', icon: Bell },
  served: { label: '서빙완료', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
  paid: { label: '결제완료', color: 'bg-emerald-200 text-emerald-800', icon: CreditCard },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      const [ordersData, tablesData] = await Promise.all([
        api.getTodayOrders(),
        api.getTables(),
      ]);
      setOrders(ordersData);
      setTables(tablesData);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // SSE 실시간
  useEffect(() => {
    const es = new EventSource(`${API_URL}/ws?role=manager`);
    es.onmessage = () => fetchData();
    return () => es.close();
  }, [fetchData]);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">주문 관리</h2>
        <p className="text-slate-500 mt-1">실시간 주문 현황 · 오늘 {orders.length}건</p>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          전체 ({orders.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              filter === key ? 'bg-orange-500 text-white' : config.color
            }`}
          >
            {config.label} ({statusCounts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* 주문 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order: any) => {
          const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
          const Icon = config.icon;
          const metadata = order.metadata as Record<string, unknown>;
          const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
          const mins = Math.floor(elapsed / 60);

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-600">#{order.orderNumber}</span>
                  {order.tableId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      T{tables.find((t: any) => t.id === order.tableId)?.number ?? '?'}
                    </span>
                  )}
                  {metadata?.buzzerNumber && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      벨 #{String(metadata.buzzerNumber)}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${config.color}`}>
                  <Icon size={12} /> {config.label}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Clock size={12} />
                  <span>{mins}분 전</span>
                  <span>·</span>
                  <span>{metadata?.serviceMode === 'counter' ? '카운터' : metadata?.serviceMode === 'table_tablet' ? '태블릿' : '직원 주문'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">결제 금액</span>
                  <span className="text-lg font-bold text-slate-800">₱{Number(order.finalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border">
            <Bell size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">
              {filter === 'all' ? '오늘 주문이 없습니다' : `"${STATUS_CONFIG[filter]?.label}" 상태의 주문이 없습니다`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
