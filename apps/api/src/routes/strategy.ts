import { Hono } from 'hono';
import { db } from '@kangwon/db';
import { strategies, strategyLogs, campaigns } from '@kangwon/db/schema';
import { eq, isNull, desc } from 'drizzle-orm';

export const strategyRoutes = new Hono();

// --- OKR 트리 조회 ---
strategyRoutes.get('/okr', async (c) => {
  const all = await db.select().from(strategies).orderBy(strategies.createdAt);

  // 트리 구조 빌드
  const tree = all
    .filter(s => !s.parentId)
    .map(obj => ({
      ...obj,
      progress: obj.kpiTarget && obj.kpiCurrent
        ? Math.min(100, Math.round((Number(obj.kpiCurrent) / Number(obj.kpiTarget)) * 100))
        : 0,
      children: all
        .filter(kr => kr.parentId === obj.id)
        .map(kr => ({
          ...kr,
          progress: kr.kpiTarget && kr.kpiCurrent
            ? Math.min(100, Math.round((Number(kr.kpiCurrent) / Number(kr.kpiTarget)) * 100))
            : 0,
          children: all
            .filter(t => t.parentId === kr.id)
            .map(t => ({
              ...t,
              progress: t.kpiTarget && t.kpiCurrent
                ? Math.min(100, Math.round((Number(t.kpiCurrent) / Number(t.kpiTarget)) * 100))
                : 0,
              children: [],
            })),
        })),
    }));

  return c.json(tree);
});

// --- 전략/전술 추가 ---
strategyRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const [strategy] = await db.insert(strategies).values(body).returning();

  await db.insert(strategyLogs).values({
    strategyId: strategy.id,
    action: 'created',
    description: `${strategy.level}: ${strategy.title}`,
  });

  return c.json(strategy, 201);
});

// --- KPI 업데이트 ---
strategyRoutes.patch('/:id/kpi', async (c) => {
  const id = c.req.param('id');
  const { kpiCurrent } = await c.req.json<{ kpiCurrent: number }>();

  const [updated] = await db.update(strategies)
    .set({ kpiCurrent: String(kpiCurrent), updatedAt: new Date() })
    .where(eq(strategies.id, id))
    .returning();

  await db.insert(strategyLogs).values({
    strategyId: id,
    action: 'kpi_updated',
    kpiSnapshot: String(kpiCurrent),
  });

  return c.json(updated);
});

// --- 캠페인 목록 ---
strategyRoutes.get('/campaigns', async (c) => {
  const result = await db.select()
    .from(campaigns)
    .orderBy(desc(campaigns.createdAt));
  return c.json(result);
});

// --- 캠페인 생성 ---
strategyRoutes.post('/campaigns', async (c) => {
  const body = await c.req.json();
  const [campaign] = await db.insert(campaigns).values(body).returning();
  return c.json(campaign, 201);
});
