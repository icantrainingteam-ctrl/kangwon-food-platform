import { Hono } from 'hono';
import { db } from '@kangwon/db';
import { customers, feedbacks, coupons } from '@kangwon/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const customerRoutes = new Hono();

// --- 고객 목록 (RFM 세그먼트별) ---
customerRoutes.get('/', async (c) => {
  const segment = c.req.query('segment');
  const query = db.select().from(customers);
  // TODO: segment 필터 적용
  const result = await query.orderBy(desc(customers.totalSpent)).limit(100);
  return c.json(result);
});

// --- 고객 상세 ---
customerRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [customer] = await db.select().from(customers).where(eq(customers.id, id));
  if (!customer) return c.json({ error: 'Customer not found' }, 404);

  const reviews = await db.select()
    .from(feedbacks)
    .where(eq(feedbacks.customerId, id))
    .orderBy(desc(feedbacks.createdAt))
    .limit(10);

  return c.json({ ...customer, reviews });
});

// --- 전화번호로 고객 조회/생성 (체크인 시) ---
customerRoutes.post('/checkin', async (c) => {
  const { phone, name } = await c.req.json<{ phone: string; name?: string }>();

  let [customer] = await db.select().from(customers).where(eq(customers.phone, phone));

  if (!customer) {
    [customer] = await db.insert(customers).values({
      phone,
      name,
      rfmSegment: 'new',
    }).returning();
  } else {
    // 방문 횟수 증가
    [customer] = await db.update(customers)
      .set({
        totalVisits: sql`${customers.totalVisits} + 1`,
        lastVisitAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customer.id))
      .returning();
  }

  return c.json(customer);
});

// --- RFM 세그먼트 통계 ---
customerRoutes.get('/segments/stats', async (c) => {
  const stats = await db.select({
    segment: customers.rfmSegment,
    count: sql<number>`COUNT(*)`,
    avgSpent: sql<number>`AVG(${customers.totalSpent})`,
  })
    .from(customers)
    .groupBy(customers.rfmSegment);

  return c.json(stats);
});
