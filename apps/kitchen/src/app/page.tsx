'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Clock, Bell, CheckCircle2, AlertTriangle, Volume2 } from 'lucide-react';
import type { KitchenOrderView } from '@kangwon/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrderView[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing'>('all');
  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0, pendingOrders: 0 });
  const [servingAlerts, setServingAlerts] = useState<string[]>([]);

  // 주방 대기열 폴링
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/kitchen/queue`);
      const data = await res.json();
      setOrders(data);
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

  // SSE 실시간 이벤트
  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/ws?role=kitchen`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'order:created') {
          // 새 주문 알림 사운드
          playAlert();
          fetchQueue();
        }
      } catch { /* ignore */ }
    };
    return () => eventSource.close();
  }, [fetchQueue]);

  const playAlert = () => {
    // 브라우저 알림 사운드 (실제 구현 시 Audio API 사용)
    if ('vibrate' in navigator) navigator.vibrate(200);
  };

  // 아이템 상태 업데이트
  const updateItemStatus = async (itemId: string, status: string) => {
    await fetch(`${API_URL}/api/kitchen/item/${itemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchQueue();
  };

  const getElapsedColor = (seconds: number) => {
    if (seconds > 900) return 'text-red-400'; // 15분 초과
    if (seconds > 600) return 'text-yellow-400'; // 10분 초과
    return 'text-emerald-400';
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
    <div className="min-h-screen bg-slate-900 p-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ChefHat size={32} className="text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold">강원 주방</h1>
            <p className="text-sm text-slate-400">Kitchen Display System</p>
          </div>
        </div>

        {/* 통계 */}
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.pendingOrders}</p>
            <p className="text-slate-500">대기중</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.completedOrders}</p>
            <p className="text-slate-500">완료</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-300">{stats.totalOrders}</p>
            <p className="text-slate-500">전체</p>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          {(['all', 'pending', 'preparing'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? '전체' : f === 'pending' ? '대기' : '조리중'}
            </button>
          ))}
        </div>
      </header>

      {/* 주문 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className={`bg-slate-800 rounded-xl overflow-hidden border-2 ${
              order.priority === 'rush'
                ? 'border-red-500 animate-pulse'
                : 'border-slate-700'
            }`}
          >
            {/* 주문 헤더 */}
            <div className="bg-slate-750 px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-orange-400">#{order.orderNumber}</span>
                {order.serviceMode === 'counter' && order.buzzerNumber && (
                  <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Bell size={10} /> 벨 {order.buzzerNumber}
                  </span>
                )}
                {order.tableNumber && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    T{order.tableNumber}
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-1 ${getElapsedColor(order.elapsedTime)}`}>
                <Clock size={14} />
                <span className="text-sm font-mono">{formatTime(order.elapsedTime)}</span>
              </div>
              {order.priority === 'rush' && (
                <AlertTriangle size={18} className="text-red-400" />
              )}
            </div>

            {/* 메뉴 아이템 */}
            <div className="p-3 space-y-2">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    item.status === 'ready' ? 'bg-emerald-900/30' :
                    item.status === 'preparing' ? 'bg-yellow-900/30' :
                    'bg-slate-700/50'
                  }`}
                >
                  <div className="flex-1">
                    <span className="font-medium text-sm">
                      {item.quantity > 1 && (
                        <span className="text-orange-400 font-bold mr-1">x{item.quantity}</span>
                      )}
                      {item.name}
                    </span>
                    {item.specialRequest && (
                      <p className="text-xs text-yellow-400 mt-0.5">⚠ {item.specialRequest}</p>
                    )}
                  </div>

                  {/* 상태 버튼 */}
                  <div className="flex gap-1">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => updateItemStatus(item.id, 'preparing')}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg"
                      >
                        조리 시작
                      </button>
                    )}
                    {item.status === 'preparing' && (
                      <button
                        onClick={() => updateItemStatus(item.id, 'ready')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                      >
                        완료
                      </button>
                    )}
                    {item.status === 'ready' && (
                      <span className="text-emerald-400 text-xs flex items-center gap-1">
                        <CheckCircle2 size={14} /> 완료
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 서빙 모드 표시 */}
            <div className="px-4 py-2 border-t border-slate-700 text-xs text-slate-500">
              {order.serviceMode === 'counter'
                ? `🔔 진동벨 #${(order as any).buzzerNumber ?? '?'} → 픽업/서빙`
                : `🙋 테이블 #${order.tableNumber ?? '?'} → 직접 서빙`}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="col-span-full text-center py-20">
            <ChefHat size={64} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">대기 중인 주문이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
