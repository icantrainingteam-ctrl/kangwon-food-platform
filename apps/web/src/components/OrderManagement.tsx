'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const STATUS_CONFIG: Record<string, { label: string; color: string; dimColor: string; icon: string }> = {
  pending: { label: '대기', color: 'var(--w-text-dim)', dimColor: 'var(--w-surface)', icon: 'solar:clock-circle-bold' },
  confirmed: { label: '접수', color: 'var(--w-info)', dimColor: 'var(--w-info-dim)', icon: 'solar:check-circle-bold' },
  preparing: { label: '조리중', color: 'var(--w-warning)', dimColor: 'var(--w-warning-dim)', icon: 'solar:chef-hat-bold' },
  ready: { label: '서빙대기', color: 'var(--w-success)', dimColor: 'var(--w-success-dim)', icon: 'solar:bell-bold' },
  served: { label: '서빙완료', color: 'var(--w-purple)', dimColor: 'var(--w-purple-dim)', icon: 'solar:check-circle-bold' },
  paid: { label: '결제완료', color: 'var(--w-success)', dimColor: 'var(--w-success-dim)', icon: 'solar:card-bold' },
  cancelled: { label: '취소', color: 'var(--w-danger)', dimColor: 'var(--w-danger-dim)', icon: 'solar:close-circle-bold' },
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

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      fetchData();
    } catch (e) {
      console.error('Failed to change status', e);
    }
  };

  const handlePayment = async (orderId: string, amount: string) => {
    try {
      await fetch(`${API_URL}/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentMethod: 'cash', amount: Number(amount) }),
      });
      fetchData();
    } catch (e) {
      console.error('Failed to process payment', e);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--w-text)' }}>주문 관리</h2>
        <p className="mt-1" style={{ color: 'var(--w-text-muted)' }}>실시간 주문 현황 · 오늘 {orders.length}건</p>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-6 flex-wrap p-1 rounded-xl" style={{ background: 'var(--w-surface)' }}>
        <button
          onClick={() => setFilter('all')}
          className="px-4 py-2 rounded-lg text-sm font-medium ease-premium"
          style={{
            background: filter === 'all' ? 'var(--w-accent)' : 'transparent',
            color: filter === 'all' ? '#000' : 'var(--w-text-dim)',
          }}
        >
          전체 ({orders.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-3 py-2 rounded-lg text-sm font-medium ease-premium"
            style={{
              background: filter === key ? 'var(--w-elevated)' : 'transparent',
              color: filter === key ? config.color : 'var(--w-text-dim)',
            }}
          >
            {config.label} ({statusCounts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* 주문 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order: any) => {
          const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
          const metadata = order.metadata as Record<string, unknown>;
          const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
          const mins = Math.floor(elapsed / 60);

          return (
            <div
              key={order.id}
              className="rounded-2xl border overflow-hidden ease-premium"
              style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}
            >
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--w-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: 'var(--w-accent)' }}>#{order.orderNumber}</span>
                  {order.tableId && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--w-info-dim)', color: 'var(--w-info)' }}>
                      T{tables.find((t: any) => t.id === order.tableId)?.number ?? '?'}
                    </span>
                  )}
                  {metadata?.buzzerNumber && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--w-warning-dim)', color: 'var(--w-warning)' }}>
                      벨 #{String(metadata.buzzerNumber)}
                    </span>
                  )}
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ background: config.dimColor, color: config.color }}
                >
                  <Icon icon={config.icon} width={12} /> {config.label}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--w-text-muted)' }}>
                  <Icon icon="solar:clock-circle-linear" width={12} />
                  <span>{mins}분 전</span>
                  <span>·</span>
                  <span>{metadata?.serviceMode === 'counter' ? '카운터' : metadata?.serviceMode === 'table_tablet' ? '태블릿' : '직원 주문'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--w-text-dim)' }}>결제 금액</span>
                  <span className="text-lg font-bold" style={{ color: 'var(--w-text)' }}>₱{Number(order.finalAmount).toLocaleString()}</span>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 flex gap-2" style={{ borderTop: '1px solid var(--w-border)' }}>
                  {order.status === 'pending' && (
                    <button onClick={() => handleStatusChange(order.id, 'confirmed')} className="flex-1 py-2 rounded-lg text-sm font-bold opacity-90 hover:opacity-100 transition-all ease-premium" style={{ background: 'var(--w-info)', color: '#fff' }}>
                      주문 접수
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button onClick={() => handleStatusChange(order.id, 'served')} className="flex-1 py-2 rounded-lg text-sm font-bold opacity-90 hover:opacity-100 transition-all ease-premium" style={{ background: 'var(--w-purple)', color: '#fff' }}>
                      서빙 완료
                    </button>
                  )}
                  {order.status === 'served' && (
                    <button onClick={() => handlePayment(order.id, order.finalAmount)} className="flex-1 py-2 rounded-lg text-sm font-bold opacity-90 hover:opacity-100 transition-all ease-premium" style={{ background: 'var(--w-success)', color: '#fff' }}>
                      현금 결제 완료
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full rounded-2xl p-12 text-center border" style={{ background: 'var(--w-surface)', borderColor: 'var(--w-border)' }}>
            <Icon icon="solar:bell-bold" width={48} className="mx-auto mb-3" style={{ color: 'var(--w-text-muted)' }} />
            <p style={{ color: 'var(--w-text-muted)' }}>
              {filter === 'all' ? '오늘 주문이 없습니다' : `"${STATUS_CONFIG[filter]?.label}" 상태의 주문이 없습니다`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
