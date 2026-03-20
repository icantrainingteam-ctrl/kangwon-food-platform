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
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use('*', logger());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'kangwon-api', timestamp: new Date().toISOString() }));

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

// 이벤트 파이프라인 시작
startPipeline();

serve({ fetch: app.fetch, port });
