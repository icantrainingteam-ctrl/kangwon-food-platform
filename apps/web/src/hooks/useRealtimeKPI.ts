'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type KPIData } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function useRealtimeKPI(refreshInterval = 10000) {
  const [kpi, setKPI] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPI = useCallback(async () => {
    try {
      const data = await api.getKPI();
      setKPI(data);
      setError(null);
    } catch (err) {
      setError('KPI 데이터를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드 + 주기적 리프레시
  useEffect(() => {
    fetchKPI();
    const interval = setInterval(fetchKPI, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchKPI, refreshInterval]);

  // SSE 실시간 업데이트
  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/ws?role=manager`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'kpi:updated' || data.type === 'order:paid') {
          fetchKPI(); // KPI 갱신
        }
      } catch { /* ignore */ }
    };
    return () => eventSource.close();
  }, [fetchKPI]);

  return { kpi, loading, error, refresh: fetchKPI };
}
