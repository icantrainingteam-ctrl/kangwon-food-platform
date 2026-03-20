'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import type { KitchenOrderView } from '@kangwon/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrderView[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing'>('all');
  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0, pendingOrders: 0 });

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/kitchen/queue`);
      setOrders(await res.json());
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/kitchen/stats`);
      setStats(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchStats();
    const interval = setInterval(() => { fetchQueue(); fetchStats(); }, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue, fetchStats]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/ws?role=kitchen`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'order:created') {
          playAlert();
          fetchQueue();
        }
      } catch { /* ignore */ }
    };
    return () => eventSource.close();
  }, [fetchQueue]);

  const playAlert = () => {
    if ('vibrate' in navigator) navigator.vibrate(200);
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    await fetch(`${API_URL}/api/kitchen/item/${itemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchQueue();
  };

  const getElapsedColor = (seconds: number) => {
    if (seconds > 900) return 'var(--kds-danger)';
    if (seconds > 600) return 'var(--kds-warning)';
    return 'var(--kds-success)';
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    const hasPending = o.items.some(i => i.status === 'pending');
    const hasPreparing = o.items.some(i => i.status === 'preparing');
    if (filter === 'pending') return hasPending;
    if (filter === 'preparing') return hasPreparing;
    return true;
  });

  return (
    <div className="min-h-screen p-5" style={{ backgroundColor: 'var(--kds-bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: 'var(--kds-accent-dim)' }}>
            <Icon icon="solar:chef-hat-bold-duotone" width={22} style={{ color: 'var(--kds-accent)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--kds-text)' }}>
              강원 주방
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--kds-text-muted)' }}>Kitchen Display System</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-5">
          {[
            { label: '대기', value: stats.pendingOrders, color: 'var(--kds-accent)', bg: 'var(--kds-accent-dim)' },
            { label: '완료', value: stats.completedOrders, color: 'var(--kds-success)', bg: 'var(--kds-success-dim)' },
            { label: '전체', value: stats.totalOrders, color: 'var(--kds-text)', bg: 'var(--kds-surface)' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="px-4 py-1.5 rounded-lg mb-1" style={{ backgroundColor: s.bg }}>
                <p className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
              </div>
              <p className="text-[10px] font-medium" style={{ color: 'var(--kds-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ backgroundColor: 'var(--kds-surface)' }}>
          {(['all', 'pending', 'preparing'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ease-premium"
              style={filter === f ? {
                backgroundColor: 'var(--kds-accent)',
                color: '#ffffff',
              } : {
                backgroundColor: 'transparent',
                color: 'var(--kds-text-muted)',
              }}
            >
              {f === 'all' ? '전체' : f === 'pending' ? '대기' : '조리중'}
            </button>
          ))}
        </div>
      </header>

      {/* Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredOrders.map((order, idx) => (
          <div
            key={order.id}
            className="rounded-2xl overflow-hidden animate-fade-in-up transition-all duration-300"
            style={{
              backgroundColor: 'var(--kds-surface)',
              border: order.priority === 'rush'
                ? '2px solid var(--kds-danger)'
                : '1px solid var(--kds-border)',
              animationDelay: `${idx * 0.04}s`,
              ...(order.priority === 'rush' ? { animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both, pulseRing 2s infinite' } : {}),
            }}
          >
            {/* Order Header */}
            <div className="px-4 py-3 flex items-center justify-between"
                 style={{ borderBottom: '1px solid var(--kds-border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--kds-accent)' }}>
                  #{order.orderNumber}
                </span>
                {order.serviceMode === 'counter' && order.buzzerNumber && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                        style={{ backgroundColor: 'var(--kds-warning-dim)', color: 'var(--kds-warning)' }}>
                    <Icon icon="solar:bell-bold" width={10} />
                    {order.buzzerNumber}
                  </span>
                )}
                {order.tableNumber && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
                    T{order.tableNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Icon icon="solar:clock-circle-linear" width={13} style={{ color: getElapsedColor(order.elapsedTime) }} />
                  <span className="text-xs font-mono tabular-nums" style={{ color: getElapsedColor(order.elapsedTime) }}>
                    {formatTime(order.elapsedTime)}
                  </span>
                </div>
                {order.priority === 'rush' && (
                  <Icon icon="solar:danger-triangle-bold" width={16} style={{ color: 'var(--kds-danger)' }} />
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3 space-y-1.5">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 animate-slide-in"
                  style={{
                    backgroundColor: item.status === 'ready' ? 'var(--kds-success-dim)'
                      : item.status === 'preparing' ? 'var(--kds-warning-dim)'
                      : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm" style={{ color: 'var(--kds-text)' }}>
                      {item.quantity > 1 && (
                        <span className="font-bold mr-1.5" style={{ color: 'var(--kds-accent)' }}>x{item.quantity}</span>
                      )}
                      {item.name}
                    </span>
                    {item.specialRequest && (
                      <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--kds-warning)' }}>
                        <Icon icon="solar:danger-triangle-linear" width={11} />
                        {item.specialRequest}
                      </p>
                    )}
                  </div>

                  {/* Status Actions */}
                  <div className="flex gap-1.5 ml-2">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => updateItemStatus(item.id, 'preparing')}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
                        style={{ backgroundColor: 'var(--kds-warning)', color: '#000' }}
                      >
                        조리
                      </button>
                    )}
                    {item.status === 'preparing' && (
                      <button
                        onClick={() => updateItemStatus(item.id, 'ready')}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-300 ease-premium hover:scale-105 active:scale-95"
                        style={{ backgroundColor: 'var(--kds-success)', color: '#000' }}
                      >
                        완료
                      </button>
                    )}
                    {item.status === 'ready' && (
                      <span className="flex items-center gap-1 text-[11px] font-medium px-2"
                            style={{ color: 'var(--kds-success)' }}>
                        <Icon icon="solar:check-circle-bold" width={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Service Mode Footer */}
            <div className="px-4 py-2.5 flex items-center gap-1.5 text-[11px]"
                 style={{ borderTop: '1px solid var(--kds-border)', color: 'var(--kds-text-muted)' }}>
              <Icon icon={order.serviceMode === 'counter' ? 'solar:bell-bing-linear' : 'solar:hand-stars-linear'} width={12} />
              {order.serviceMode === 'counter'
                ? `벨 #${(order as any).buzzerNumber ?? '?'} · 픽업`
                : `테이블 #${order.tableNumber ?? '?'} · 직접 서빙`}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="col-span-full text-center py-24">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: 'var(--kds-surface)' }}>
              <Icon icon="solar:chef-hat-bold-duotone" width={32} style={{ color: 'var(--kds-border-light)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--kds-text-muted)' }}>대기 중인 주문이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
