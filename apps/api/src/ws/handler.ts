import type { WSEvent } from '@kangwon/shared';

// ========================================
// WebSocket 실시간 이벤트 허브
// 주방 KDS, 태블릿, 매니저 대시보드 모두 연결
// ========================================

const clients = new Set<{
  send: (data: string) => void;
  role: 'kitchen' | 'tablet' | 'manager' | 'serving';
  tableId?: string;
}>();

// SSE 기반 실시간 이벤트 (WebSocket 대안 - Hono 호환)
export const wsHandler = async (c: any) => {
  // Server-Sent Events 방식
  return new Response(
    new ReadableStream({
      start(controller) {
        const client = {
          send: (data: string) => {
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          },
          role: (c.req.query('role') ?? 'manager') as any,
          tableId: c.req.query('tableId'),
        };
        clients.add(client);

        // Heartbeat
        const heartbeat = setInterval(() => {
          try {
            client.send(JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }));
          } catch {
            clients.delete(client);
            clearInterval(heartbeat);
          }
        }, 30000);
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );
};

// 모든 클라이언트에게 이벤트 브로드캐스트
export function broadcastEvent(event: WSEvent) {
  const data = JSON.stringify(event);

  for (const client of clients) {
    try {
      // 역할 기반 필터링
      if (client.role === 'kitchen' && !event.type.startsWith('order:')) continue;
      if (client.role === 'tablet' && !['order:confirmed', 'order:ready', 'order:served', 'buzzer:ring'].includes(event.type)) continue;

      client.send(data);
    } catch {
      clients.delete(client);
    }
  }
}

// 특정 테이블에만 이벤트 전송
export function sendToTable(tableId: string, event: WSEvent) {
  const data = JSON.stringify(event);
  for (const client of clients) {
    if (client.tableId === tableId) {
      try { client.send(data); } catch { clients.delete(client); }
    }
  }
}

// 서빙 담당 직원에게만 전송
export function sendToServing(event: WSEvent) {
  const data = JSON.stringify(event);
  for (const client of clients) {
    if (client.role === 'serving') {
      try { client.send(data); } catch { clients.delete(client); }
    }
  }
}

export function getConnectedClients() {
  return {
    total: clients.size,
    kitchen: [...clients].filter(c => c.role === 'kitchen').length,
    tablet: [...clients].filter(c => c.role === 'tablet').length,
    manager: [...clients].filter(c => c.role === 'manager').length,
    serving: [...clients].filter(c => c.role === 'serving').length,
  };
}
