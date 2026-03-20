import { Hono } from 'hono';
import { db } from '@kangwon/db';
import {
  orders, orderItems, menuItems, menuCategories,
  customers, feedbacks, transactions, staff,
} from '@kangwon/db/schema';
import { eq, desc, sql, and, gte, lte, between } from 'drizzle-orm';

export const analyticsRoutes = new Hono();

// ========================================
// 실시간 KPI 엔진
// ========================================

// --- Command Center KPI (메인 대시보드) ---
analyticsRoutes.get('/kpi/today', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // 오늘 매출/주문
  const todayStats = await db.select({
    revenue: sql<number>`COALESCE(SUM(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
    orderCount: sql<number>`COUNT(*)`,
    avgOrder: sql<number>`COALESCE(AVG(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
  })
    .from(orders)
    .where(and(
      sql`DATE(${orders.createdAt}) = ${today}`,
      eq(orders.status, 'paid'),
    ));

  // 어제 매출 (비교용)
  const yesterdayStats = await db.select({
    revenue: sql<number>`COALESCE(SUM(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
    orderCount: sql<number>`COUNT(*)`,
  })
    .from(orders)
    .where(and(
      sql`DATE(${orders.createdAt}) = ${yesterday}`,
      eq(orders.status, 'paid'),
    ));

  // 오늘 고객 만족도
  const satisfaction = await db.select({
    avg: sql<number>`COALESCE(ROUND(AVG(${feedbacks.rating}), 2), 0)`,
    count: sql<number>`COUNT(*)`,
  })
    .from(feedbacks)
    .where(sql`DATE(${feedbacks.createdAt}) = ${today}`);

  // 시간대별 매출
  const hourlyRevenue = await db.select({
    hour: sql<number>`EXTRACT(HOUR FROM ${orders.createdAt})`,
    revenue: sql<number>`COALESCE(SUM(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
    orders: sql<number>`COUNT(*)`,
  })
    .from(orders)
    .where(and(
      sql`DATE(${orders.createdAt}) = ${today}`,
      eq(orders.status, 'paid'),
    ))
    .groupBy(sql`EXTRACT(HOUR FROM ${orders.createdAt})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${orders.createdAt})`);

  // 평균 조리 시간 (confirmed → ready)
  const avgPrepTime = await db.select({
    avg: sql<number>`COALESCE(
      ROUND(AVG(EXTRACT(EPOCH FROM (${orders.completedAt} - ${orders.confirmedAt})) / 60), 1),
      0
    )`,
  })
    .from(orders)
    .where(and(
      sql`DATE(${orders.createdAt}) = ${today}`,
      sql`${orders.completedAt} IS NOT NULL`,
      sql`${orders.confirmedAt} IS NOT NULL`,
    ));

  const todayRev = Number(todayStats[0]?.revenue ?? 0);
  const yesterdayRev = Number(yesterdayStats[0]?.revenue ?? 0);
  const revenueChange = yesterdayRev > 0 ? ((todayRev - yesterdayRev) / yesterdayRev * 100).toFixed(1) : '0';

  return c.json({
    todayRevenue: todayRev,
    todayOrders: Number(todayStats[0]?.orderCount ?? 0),
    avgOrderAmount: Number(todayStats[0]?.avgOrder ?? 0),
    avgPrepTime: Number(avgPrepTime[0]?.avg ?? 0),
    customerSatisfaction: Number(satisfaction[0]?.avg ?? 0),
    feedbackCount: Number(satisfaction[0]?.count ?? 0),
    revenueChangePercent: Number(revenueChange),
    yesterdayRevenue: yesterdayRev,
    hourlyRevenue: hourlyRevenue.map(h => ({
      hour: Number(h.hour),
      revenue: Number(h.revenue),
      orders: Number(h.orders),
    })),
  });
});

// --- 메뉴 매트릭스 데이터 (BCG Matrix) ---
analyticsRoutes.get('/menu-matrix', async (c) => {
  const days = Number(c.req.query('days') ?? 30);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  // 메뉴별 주문 수, 매출, 평균 평점
  const menuPerformance = await db.select({
    id: menuItems.id,
    name: menuItems.name,
    nameEn: menuItems.nameEn,
    categoryId: menuItems.categoryId,
    price: menuItems.price,
    costPrice: menuItems.costPrice,
    totalOrders: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
    totalRevenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0)`,
    avgRating: menuItems.avgRating,
    isPopular: menuItems.isPopular,
    tags: menuItems.tags,
  })
    .from(menuItems)
    .leftJoin(orderItems, eq(orderItems.menuItemId, menuItems.id))
    .leftJoin(orders, and(
      eq(orders.id, orderItems.orderId),
      sql`${orders.createdAt} >= ${since}`,
    ))
    .groupBy(menuItems.id)
    .orderBy(sql`COALESCE(SUM(${orderItems.quantity}), 0) DESC`);

  // BCG 분류 계산
  const totalOrdersAll = menuPerformance.reduce((s, m) => s + Number(m.totalOrders), 0);
  const avgOrders = totalOrdersAll / (menuPerformance.length || 1);

  const result = menuPerformance.map(menu => {
    const orders = Number(menu.totalOrders);
    const revenue = Number(menu.totalRevenue);
    const price = Number(menu.price);
    const cost = Number(menu.costPrice ?? 0);
    const margin = price > 0 ? ((price - cost) / price * 100) : 0;
    const avgMargin = 50; // 기준 마진율

    // BCG Matrix 분류
    const highPopularity = orders >= avgOrders;
    const highMargin = margin >= avgMargin;
    let quadrant: 'star' | 'cash_cow' | 'question_mark' | 'dog';
    if (highPopularity && highMargin) quadrant = 'star';
    else if (highPopularity && !highMargin) quadrant = 'cash_cow';
    else if (!highPopularity && highMargin) quadrant = 'question_mark';
    else quadrant = 'dog';

    return {
      id: menu.id,
      name: menu.name,
      nameEn: menu.nameEn,
      categoryId: menu.categoryId,
      price,
      costPrice: cost,
      margin: Math.round(margin * 10) / 10,
      totalOrders: orders,
      totalRevenue: revenue,
      avgRating: Number(menu.avgRating ?? 0),
      quadrant,
      isPopular: menu.isPopular,
      tags: menu.tags,
    };
  });

  // 카테고리 목록
  const categories = await db.select().from(menuCategories);

  return c.json({
    items: result,
    categories,
    summary: {
      totalItems: result.length,
      stars: result.filter(r => r.quadrant === 'star').length,
      cashCows: result.filter(r => r.quadrant === 'cash_cow').length,
      questionMarks: result.filter(r => r.quadrant === 'question_mark').length,
      dogs: result.filter(r => r.quadrant === 'dog').length,
      avgMargin: result.length > 0
        ? Math.round(result.reduce((s, r) => s + r.margin, 0) / result.length * 10) / 10
        : 0,
    },
  });
});

// --- 고객 RFM 세그먼트 대시보드 ---
analyticsRoutes.get('/customers/rfm', async (c) => {
  const segments = await db.select({
    segment: customers.rfmSegment,
    count: sql<number>`COUNT(*)`,
    avgSpent: sql<number>`ROUND(AVG(CAST(${customers.totalSpent} AS DECIMAL)), 0)`,
    avgVisits: sql<number>`ROUND(AVG(${customers.totalVisits}), 1)`,
  })
    .from(customers)
    .groupBy(customers.rfmSegment);

  // 최근 피드백 감성 분포
  const sentimentDist = await db.select({
    sentiment: feedbacks.sentiment,
    count: sql<number>`COUNT(*)`,
  })
    .from(feedbacks)
    .groupBy(feedbacks.sentiment);

  // 최근 30일 신규 고객 추이
  const newCustomerTrend = await db.select({
    date: sql<string>`DATE(${customers.createdAt})`,
    count: sql<number>`COUNT(*)`,
  })
    .from(customers)
    .where(sql`${customers.createdAt} >= NOW() - INTERVAL '30 days'`)
    .groupBy(sql`DATE(${customers.createdAt})`)
    .orderBy(sql`DATE(${customers.createdAt})`);

  // 총 고객 수
  const totalCustomers = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(customers);

  return c.json({
    segments,
    sentimentDistribution: sentimentDist,
    newCustomerTrend,
    totalCustomers: Number(totalCustomers[0]?.count ?? 0),
  });
});

// --- 고객 감성 분석 타임라인 ---
analyticsRoutes.get('/sentiment/timeline', async (c) => {
  const days = Number(c.req.query('days') ?? 14);

  const timeline = await db.select({
    date: sql<string>`DATE(${feedbacks.createdAt})`,
    avgRating: sql<number>`ROUND(AVG(${feedbacks.rating}), 2)`,
    avgSentiment: sql<number>`ROUND(AVG(CAST(${feedbacks.sentimentScore} AS DECIMAL)), 3)`,
    count: sql<number>`COUNT(*)`,
    positive: sql<number>`COUNT(CASE WHEN ${feedbacks.rating} >= 4 THEN 1 END)`,
    negative: sql<number>`COUNT(CASE WHEN ${feedbacks.rating} <= 2 THEN 1 END)`,
  })
    .from(feedbacks)
    .where(sql`${feedbacks.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`)
    .groupBy(sql`DATE(${feedbacks.createdAt})`)
    .orderBy(sql`DATE(${feedbacks.createdAt})`);

  // 최근 부정 리뷰 (긴급 대응 필요)
  const criticalFeedbacks = await db.select()
    .from(feedbacks)
    .where(and(
      sql`${feedbacks.rating} <= 2`,
      eq(feedbacks.isResolved, 0),
    ))
    .orderBy(desc(feedbacks.createdAt))
    .limit(10);

  return c.json({ timeline, criticalFeedbacks });
});

// --- 매출 트렌드 (기간별) ---
analyticsRoutes.get('/revenue/trend', async (c) => {
  const days = Number(c.req.query('days') ?? 30);

  const trend = await db.select({
    date: sql<string>`DATE(${orders.createdAt})`,
    revenue: sql<number>`COALESCE(SUM(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
    orders: sql<number>`COUNT(*)`,
    avgOrder: sql<number>`COALESCE(ROUND(AVG(CAST(${orders.finalAmount} AS DECIMAL)), 0), 0)`,
  })
    .from(orders)
    .where(and(
      sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`,
      eq(orders.status, 'paid'),
    ))
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  // 결제수단별 분포
  const paymentDist = await db.select({
    method: orders.paymentMethod,
    count: sql<number>`COUNT(*)`,
    total: sql<number>`COALESCE(SUM(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
  })
    .from(orders)
    .where(and(
      sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`,
      eq(orders.status, 'paid'),
    ))
    .groupBy(orders.paymentMethod);

  // 카테고리별 매출
  const categoryRevenue = await db.select({
    categoryId: menuItems.categoryId,
    categoryName: menuCategories.name,
    revenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0)`,
    orders: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
  })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(orders, and(
      eq(orders.id, orderItems.orderId),
      sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`,
      eq(orders.status, 'paid'),
    ))
    .groupBy(menuItems.categoryId, menuCategories.name)
    .orderBy(sql`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0) DESC`);

  return c.json({ trend, paymentDistribution: paymentDist, categoryRevenue });
});

// --- 직원 성과 분석 ---
analyticsRoutes.get('/staff/performance', async (c) => {
  const days = Number(c.req.query('days') ?? 30);

  const performance = await db.select({
    id: staff.id,
    name: staff.name,
    role: staff.role,
    ordersServed: sql<number>`COUNT(DISTINCT ${orders.id})`,
    totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.finalAmount} AS DECIMAL)), 0)`,
    avgRating: sql<number>`COALESCE(ROUND(AVG(${feedbacks.rating}), 2), 0)`,
    feedbackCount: sql<number>`COUNT(DISTINCT ${feedbacks.id})`,
  })
    .from(staff)
    .leftJoin(orders, and(
      eq(orders.staffId, staff.id),
      sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`,
    ))
    .leftJoin(feedbacks, eq(feedbacks.orderId, orders.id))
    .where(eq(staff.isActive, 1))
    .groupBy(staff.id)
    .orderBy(sql`COUNT(DISTINCT ${orders.id}) DESC`);

  return c.json(performance);
});

// --- 인벤토리 알림 (재고 부족) ---
analyticsRoutes.get('/inventory/alerts', async (c) => {
  // 실제 구현 시 ingredients 테이블에서 재고 체크
  return c.json({
    alerts: [],
    message: '재고 데이터 수집 후 알림이 활성화됩니다',
  });
});

// --- Top 메뉴 랭킹 ---
analyticsRoutes.get('/menu/ranking', async (c) => {
  const days = Number(c.req.query('days') ?? 7);
  const limit = Number(c.req.query('limit') ?? 10);

  const ranking = await db.select({
    id: menuItems.id,
    name: menuItems.name,
    nameEn: menuItems.nameEn,
    totalOrders: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
    totalRevenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0)`,
  })
    .from(menuItems)
    .leftJoin(orderItems, eq(orderItems.menuItemId, menuItems.id))
    .leftJoin(orders, and(
      eq(orders.id, orderItems.orderId),
      sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`,
      eq(orders.status, 'paid'),
    ))
    .groupBy(menuItems.id)
    .orderBy(sql`COALESCE(SUM(${orderItems.quantity}), 0) DESC`)
    .limit(limit);

  return c.json(ranking);
});
