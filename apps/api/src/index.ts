import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { orderRoutes } from './routes/orders';
import { menuRoutes } from './routes/menu';
import { tableRoutes } from './routes/tables';
import { kitchenRoutes } from './routes/kitchen';
import { financeRoutes } from './routes/finance';
import { customerRoutes } from './routes/customers';
import { strategyRoutes } from './routes/strategy';
import { feedbackRoutes } from './routes/feedback';
import { staffRoutes } from './routes/staff';
import { analyticsRoutes } from './routes/analytics';
import { insightRoutes } from './routes/insights';
import { wsHandler } from './ws/handler';
import { startPipeline } from './services/pipeline';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return 'http://localhost:3000';
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return origin;
    if (origin.endsWith('.vercel.app') || origin.endsWith('.kangwonfood.com')) return origin;
    return origin; // Fallback
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use('*', logger());

// 글로벌 에러 핸들러
app.onError((err, c) => {
  console.error('API Error:', err.message, err.stack);
  return c.json({ error: err.message, stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined }, 500);
});

// Health check + DB 연결 상태
app.get('/health', async (c) => {
  let dbStatus = 'unknown';
  try {
    const { db } = await import('@kangwon/db');
    const result = await db.execute(require('drizzle-orm').sql`SELECT 1 as ok`);
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }
  return c.json({
    status: 'ok',
    service: 'kangwon-api',
    db: dbStatus,
    env: {
      DB_HOST: process.env.DB_HOST ? 'set' : 'missing',
      DB_USER: process.env.DB_USER ? 'set' : 'missing',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'set' : 'missing',
      PORT: process.env.PORT,
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/orders', orderRoutes);
app.route('/api/menu', menuRoutes);
app.route('/api/tables', tableRoutes);
app.route('/api/kitchen', kitchenRoutes);
app.route('/api/finance', financeRoutes);
app.route('/api/customers', customerRoutes);
app.route('/api/strategy', strategyRoutes);
app.route('/api/feedback', feedbackRoutes);
app.route('/api/staff', staffRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/insights', insightRoutes);

// WebSocket (실시간 이벤트)
app.get('/ws', wsHandler);

const port = Number(process.env.PORT) || 4000;

console.log(`
╔══════════════════════════════════════════╗
║   🍽️  강원 API Server v2.0              ║
║   Port: ${port}                            ║
║   Health: http://localhost:${port}/health    ║
║   WS: ws://localhost:${port}/ws              ║
║   Pipeline: Active                       ║
╚══════════════════════════════════════════╝
`);

// 이벤트 파이프라인 시작 (DB 연결 실패해도 서버는 실행)
try {
  startPipeline();
} catch (err) {
  console.error('Pipeline start deferred:', err);
}

serve({ fetch: app.fetch, port });
