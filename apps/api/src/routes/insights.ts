import { Hono } from 'hono';
import { db } from '@kangwon/db';
import { insights, events, feedbacks, orders, menuItems, orderItems } from '@kangwon/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { broadcastEvent } from '../ws/handler';

export const insightRoutes = new Hono();

// ========================================
// AI 인사이트 엔진
// 데이터에서 자동으로 인사이트를 생성하고
// Strategy Board로 전달
// ========================================

// --- 인사이트 목록 ---
insightRoutes.get('/', async (c) => {
  const category = c.req.query('category');
  const limit = Number(c.req.query('limit') ?? 20);

  let query = db.select().from(insights).orderBy(desc(insights.createdAt)).limit(limit);
  // TODO: category 필터

  const result = await query;
  return c.json(result);
});

// --- 인사이트 읽음 표시 ---
insightRoutes.patch('/:id/read', async (c) => {
  const id = c.req.param('id');
  const [updated] = await db.update(insights)
    .set({ isRead: 1 })
    .where(eq(insights.id, id))
    .returning();
  return c.json(updated);
});

// --- 인사이트 자동 생성 트리거 ---
// 이 엔드포인트를 주기적으로 호출하거나 이벤트 파이프라인에서 호출
insightRoutes.post('/generate', async (c) => {
  const generated: any[] = [];

  // 1. 메뉴 성과 인사이트
  const menuInsight = await generateMenuInsight();
  if (menuInsight) generated.push(menuInsight);

  // 2. 고객 감성 인사이트
  const sentimentInsight = await generateSentimentInsight();
  if (sentimentInsight) generated.push(sentimentInsight);

  // 3. 매출 트렌드 인사이트
  const revenueInsight = await generateRevenueInsight();
  if (revenueInsight) generated.push(revenueInsight);

  // 4. 운영 효율 인사이트
  const opsInsight = await generateOpsInsight();
  if (opsInsight) generated.push(opsInsight);

  return c.json({ generated: generated.length, insights: generated });
});

// --- 메뉴 성과 인사이트 ---
async function generateMenuInsight() {
  const today = new Date().toISOString().split('T')[0];

  // 최근 7일 주문이 0인 메뉴 찾기
  const deadMenu = await db.select({
    id: menuItems.id,
    name: menuItems.name,
    price: menuItems.price,
  })
    .from(menuItems)
    .leftJoin(orderItems, and(
      eq(orderItems.menuItemId, menuItems.id),
      sql`EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = ${orderItems.orderId}
        AND o.created_at >= NOW() - INTERVAL '7 days'
      )`,
    ))
    .where(eq(menuItems.isAvailable, true))
    .groupBy(menuItems.id)
    .having(sql`COUNT(${orderItems.id}) = 0`)
    .limit(5);

  if (deadMenu.length === 0) return null;

  const menuNames = deadMenu.map(m => m.name).join(', ');

  const [insight] = await db.insert(insights).values({
    category: 'menu',
    severity: 'warning',
    title: `${deadMenu.length}개 메뉴 7일간 주문 없음`,
    description: `다음 메뉴가 최근 7일간 한 번도 주문되지 않았습니다: ${menuNames}. 메뉴 제거 또는 프로모션을 검토하세요.`,
    data: { deadMenuIds: deadMenu.map(m => m.id), menuNames: deadMenu.map(m => m.name) },
    actionSuggestion: '메뉴 매트릭스에서 해당 메뉴를 "Dog" 영역으로 분류하고, 가격 조정 또는 한정 프로모션을 고려하세요.',
  }).returning();

  broadcastEvent({
    type: 'insight:new',
    payload: { id: insight.id, category: 'menu', severity: 'warning', title: insight.title },
    timestamp: new Date().toISOString(),
  });

  return insight;
}

// --- 고객 감성 인사이트 ---
async function generateSentimentInsight() {
  // 최근 3일 평균 평점 vs 이전 7일 평균 비교
  const recent = await db.select({
    avg: sql<number>`COALESCE(ROUND(AVG(${feedbacks.rating}), 2), 0)`,
    count: sql<number>`COUNT(*)`,
  })
    .from(feedbacks)
    .where(sql`${feedbacks.createdAt} >= NOW() - INTERVAL '3 days'`);

  const previous = await db.select({
    avg: sql<number>`COALESCE(ROUND(AVG(${feedbacks.rating}), 2), 0)`,
  })
    .from(feedbacks)
    .where(and(
      sql`${feedbacks.createdAt} >= NOW() - INTERVAL '10 days'`,
      sql`${feedbacks.createdAt} < NOW() - INTERVAL '3 days'`,
    ));

  const recentAvg = Number(recent[0]?.avg ?? 0);
  const previousAvg = Number(previous[0]?.avg ?? 0);
  const count = Number(recent[0]?.count ?? 0);

  if (count < 3) return null; // 데이터 부족

  const diff = recentAvg - previousAvg;

  if (Math.abs(diff) < 0.3) return null; // 유의미한 변화 없음

  const isDecline = diff < 0;

  const [insight] = await db.insert(insights).values({
    category: 'customer',
    severity: isDecline ? 'critical' : 'opportunity',
    title: isDecline
      ? `고객 만족도 하락 경고 (${recentAvg}점 → 이전 ${previousAvg}점)`
      : `고객 만족도 상승 (${recentAvg}점 ← 이전 ${previousAvg}점)`,
    description: isDecline
      ? `최근 3일 평균 평점이 ${Math.abs(diff).toFixed(1)}점 하락했습니다. 부정 리뷰를 확인하고 원인을 파악하세요.`
      : `최근 3일 평균 평점이 ${diff.toFixed(1)}점 상승했습니다! 현재 전략이 효과적입니다.`,
    data: { recentAvg, previousAvg, diff: Math.round(diff * 100) / 100, sampleSize: count },
    actionSuggestion: isDecline
      ? 'Customer Pulse에서 부정 리뷰를 확인하고, 관련 메뉴/직원에 대한 조치를 취하세요.'
      : '현재 잘 되고 있는 요소를 파악하고 강화하세요. 긍정 리뷰 키워드를 마케팅에 활용하세요.',
  }).returning();

  if (isDecline) {
    broadcastEvent({
      type: 'insight:new',
      payload: { id: insight.id, category: 'customer', severity: 'critical', title: insight.title },
      timestamp: new Date().toISOString(),
    });
  }

  return insight;
}

// --- 매출 트렌드 인사이트 ---
async function generateRevenueInsight() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일, 1=월, ...

  // 오늘 vs 지난주 같은 요일 매출 비교
  const todayRev = await db.select({
    revenue: sql<number>`COALESCE(SUM(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
  })
    .from(orders)
    .where(and(
      sql`DATE(${orders.createdAt}) = ${today.toISOString().split('T')[0]}`,
      eq(orders.status, 'paid'),
    ));

  const lastWeekSameDay = new Date(today.getTime() - 7 * 86400000);
  const lastWeekRev = await db.select({
    revenue: sql<number>`COALESCE(SUM(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
  })
    .from(orders)
    .where(and(
      sql`DATE(${orders.createdAt}) = ${lastWeekSameDay.toISOString().split('T')[0]}`,
      eq(orders.status, 'paid'),
    ));

  const todayAmount = Number(todayRev[0]?.revenue ?? 0);
  const lastWeekAmount = Number(lastWeekRev[0]?.revenue ?? 0);

  if (lastWeekAmount === 0) return null;

  const changePercent = ((todayAmount - lastWeekAmount) / lastWeekAmount * 100);

  if (Math.abs(changePercent) < 15) return null; // 15% 미만 변동은 무시

  const isGrowth = changePercent > 0;

  const [insight] = await db.insert(insights).values({
    category: 'finance',
    severity: isGrowth ? 'info' : 'warning',
    title: `${isGrowth ? '매출 성장' : '매출 감소'}: 지난주 대비 ${Math.abs(changePercent).toFixed(0)}%`,
    description: `오늘 매출 ₱${todayAmount.toLocaleString()} vs 지난주 동일 요일 ₱${lastWeekAmount.toLocaleString()}`,
    data: { todayAmount, lastWeekAmount, changePercent: Math.round(changePercent) },
    actionSuggestion: isGrowth
      ? '성장 요인을 분석하세요. 특정 메뉴나 프로모션이 기여했을 수 있습니다.'
      : '감소 원인을 파악하세요. 날씨, 경쟁사, 메뉴 변경 등을 확인하세요.',
  }).returning();

  return insight;
}

// --- 운영 효율 인사이트 ---
async function generateOpsInsight() {
  // 평균 조리 시간이 15분 초과한 메뉴 찾기
  const slowMenu = await db.select({
    menuName: menuItems.name,
    avgPrepMinutes: sql<number>`ROUND(AVG(
      EXTRACT(EPOCH FROM (${orderItems.readyAt} - ${orderItems.prepStartedAt})) / 60
    ), 1)`,
    orderCount: sql<number>`COUNT(*)`,
  })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(and(
      sql`${orderItems.readyAt} IS NOT NULL`,
      sql`${orderItems.prepStartedAt} IS NOT NULL`,
      sql`${orderItems.readyAt} >= NOW() - INTERVAL '7 days'`,
    ))
    .groupBy(menuItems.id, menuItems.name)
    .having(sql`AVG(EXTRACT(EPOCH FROM (${orderItems.readyAt} - ${orderItems.prepStartedAt})) / 60) > 15`)
    .orderBy(sql`AVG(EXTRACT(EPOCH FROM (${orderItems.readyAt} - ${orderItems.prepStartedAt})) / 60) DESC`)
    .limit(5);

  if (slowMenu.length === 0) return null;

  const [insight] = await db.insert(insights).values({
    category: 'operations',
    severity: 'warning',
    title: `${slowMenu.length}개 메뉴 조리시간 15분 초과`,
    description: slowMenu.map(m => `${m.menuName}: 평균 ${m.avgPrepMinutes}분 (${m.orderCount}건)`).join(', '),
    data: { slowMenus: slowMenu },
    actionSuggestion: '주방과 협의하여 조리 과정을 최적화하거나, 예상 조리 시간을 메뉴에 업데이트하세요.',
  }).returning();

  return insight;
}
