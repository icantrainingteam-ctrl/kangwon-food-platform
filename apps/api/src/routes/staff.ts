import { Hono } from 'hono';
import { db } from '@kangwon/db';
import { staff } from '@kangwon/db/schema';
import { eq } from 'drizzle-orm';

export const staffRoutes = new Hono();

// --- 직원 목록 ---
staffRoutes.get('/', async (c) => {
  const result = await db.select().from(staff).where(eq(staff.isActive, 1));
  return c.json(result);
});

// --- PIN 로그인 (태블릿/POS용) ---
staffRoutes.post('/login', async (c) => {
  const { pin } = await c.req.json<{ pin: string }>();
  const [member] = await db.select()
    .from(staff)
    .where(eq(staff.pin, pin));

  if (!member) return c.json({ error: 'Invalid PIN' }, 401);
  return c.json(member);
});

// --- 직원 추가 ---
staffRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const [member] = await db.insert(staff).values(body).returning();
  return c.json(member, 201);
});

// --- 직원 수정 ---
staffRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const [updated] = await db.update(staff)
    .set(body)
    .where(eq(staff.id, id))
    .returning();
  return c.json(updated);
});
