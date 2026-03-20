import { Hono } from 'hono';
import { db } from '@kangwon/db';
import { tables, tableSessions } from '@kangwon/db/schema';
import { eq } from 'drizzle-orm';
import { broadcastEvent } from '../ws/handler';
import crypto from 'node:crypto';

export const tableRoutes = new Hono();

// --- 전체 테이블 상태 ---
tableRoutes.get('/', async (c) => {
  const result = await db.select().from(tables).orderBy(tables.number);
  return c.json(result);
});

// --- QR 스캔 → 테이블 세션 시작 ---
tableRoutes.post('/:number/session', async (c) => {
  const tableNumber = Number(c.req.param('number'));
  const { guestCount } = await c.req.json<{ guestCount?: number }>();

  const [table] = await db.select().from(tables).where(eq(tables.number, tableNumber));
  if (!table) return c.json({ error: 'Table not found' }, 404);

  const sessionToken = crypto.randomUUID();

  const [session] = await db.insert(tableSessions).values({
    tableId: table.id,
    sessionToken,
    guestCount: guestCount ?? 1,
  }).returning();

  await db.update(tables)
    .set({ status: 'occupied', updatedAt: new Date() })
    .where(eq(tables.id, table.id));

  broadcastEvent({
    type: 'table:status_changed',
    payload: { tableId: table.id, tableNumber, status: 'occupied' },
    timestamp: new Date().toISOString(),
  });

  return c.json({ session, table });
});

// --- 테이블 세션 종료 ---
tableRoutes.post('/:number/close', async (c) => {
  const tableNumber = Number(c.req.param('number'));

  const [table] = await db.select().from(tables).where(eq(tables.number, tableNumber));
  if (!table) return c.json({ error: 'Table not found' }, 404);

  await db.update(tables)
    .set({ status: 'available', updatedAt: new Date() })
    .where(eq(tables.id, table.id));

  broadcastEvent({
    type: 'table:status_changed',
    payload: { tableId: table.id, tableNumber, status: 'available' },
    timestamp: new Date().toISOString(),
  });

  return c.json({ success: true });
});

// --- 테이블 상태 변경 ---
tableRoutes.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json<{ status: string }>();

  const [updated] = await db.update(tables)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(tables.id, id))
    .returning();

  return c.json(updated);
});
