import { Hono } from 'hono';
import { db } from '@kangwon/db';
import { transactions, financialSources, expenseCategories, dailyClosings } from '@kangwon/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export const financeRoutes = new Hono();

// --- 자금 원장 목록 ---
financeRoutes.get('/sources', async (c) => {
  const result = await db.select().from(financialSources);
  return c.json(result);
});

// --- 거래 내역 ---
financeRoutes.get('/transactions', async (c) => {
  const limit = Number(c.req.query('limit') ?? 50);
  const result = await db.select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
  return c.json(result);
});

// --- 거래 등록 ---
financeRoutes.post('/transactions', async (c) => {
  const body = await c.req.json();
  const [tx] = await db.insert(transactions).values(body).returning();

  // 자금원장 잔액 업데이트
  const delta = body.type === 'income' ? Number(body.amount) : -Number(body.amount);
  await db.update(financialSources)
    .set({ currentBalance: sql`${financialSources.currentBalance} + ${delta}` })
    .where(eq(financialSources.id, body.sourceId));

  return c.json(tx, 201);
});

// --- 비용 카테고리 ---
financeRoutes.get('/categories', async (c) => {
  const result = await db.select().from(expenseCategories).orderBy(expenseCategories.sortOrder);
  return c.json(result);
});

// --- 일일 마감 ---
financeRoutes.post('/closing', async (c) => {
  const today = new Date().toISOString().split('T')[0];

  // 오늘 수입/지출 합계
  const summary = await db.select({
    totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
    totalExpense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
  })
    .from(transactions)
    .where(eq(transactions.date, today));

  const sources = await db.select().from(financialSources);

  const [closing] = await db.insert(dailyClosings).values({
    date: today,
    totalIncome: String(summary[0]?.totalIncome ?? 0),
    totalExpense: String(summary[0]?.totalExpense ?? 0),
    sourceSnapshots: sources.map(s => ({
      sourceId: s.id,
      name: s.name,
      balance: Number(s.currentBalance),
    })),
  }).returning();

  return c.json(closing, 201);
});

// --- 마감 이력 ---
financeRoutes.get('/closings', async (c) => {
  const result = await db.select()
    .from(dailyClosings)
    .orderBy(desc(dailyClosings.date))
    .limit(30);
  return c.json(result);
});
