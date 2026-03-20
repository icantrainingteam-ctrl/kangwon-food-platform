import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '@kangwon/db';
import { feedbacks, coupons, customers } from '@kangwon/db/schema';
import { createFeedbackSchema } from '@kangwon/shared';
import { eq, desc, sql } from 'drizzle-orm';
import { broadcastEvent } from '../ws/handler';
import crypto from 'node:crypto';

export const feedbackRoutes = new Hono();

// --- 피드백 제출 (식사 후) ---
feedbackRoutes.post('/', zValidator('json', createFeedbackSchema), async (c) => {
  const input = c.req.valid('json');

  const [fb] = await db.insert(feedbacks).values({
    orderId: input.orderId,
    customerId: input.customerId,
    rating: input.rating,
    comment: input.comment,
    // TODO: Claude AI 감성분석 연동
    sentiment: input.rating >= 4 ? 'positive' : input.rating <= 2 ? 'negative' : 'neutral',
  }).returning();

  // 피드백 제출 시 쿠폰 발급
  if (input.customerId) {
    const couponCode = `KW${Date.now().toString(36).toUpperCase()}`;
    await db.insert(coupons).values({
      code: couponCode,
      customerId: input.customerId,
      discountType: 'percent',
      discountValue: input.rating >= 4 ? '10' : '5', // 좋은 리뷰면 10%, 아니면 5%
      minOrderAmount: '300',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일
    });
  }

  // 낮은 평점 시 매니저 알림
  if (input.rating <= 2) {
    broadcastEvent({
      type: 'insight:new',
      payload: {
        severity: 'warning',
        title: `낮은 평점 접수 (${input.rating}점)`,
        description: input.comment ?? '코멘트 없음',
        orderId: input.orderId,
      },
      timestamp: new Date().toISOString(),
    });
  }

  return c.json(fb, 201);
});

// --- 피드백 목록 ---
feedbackRoutes.get('/', async (c) => {
  const result = await db.select()
    .from(feedbacks)
    .orderBy(desc(feedbacks.createdAt))
    .limit(50);
  return c.json(result);
});

// --- 평균 평점 ---
feedbackRoutes.get('/stats', async (c) => {
  const stats = await db.select({
    avgRating: sql<number>`ROUND(AVG(${feedbacks.rating}), 2)`,
    totalCount: sql<number>`COUNT(*)`,
    rating5: sql<number>`COUNT(CASE WHEN ${feedbacks.rating} = 5 THEN 1 END)`,
    rating4: sql<number>`COUNT(CASE WHEN ${feedbacks.rating} = 4 THEN 1 END)`,
    rating3: sql<number>`COUNT(CASE WHEN ${feedbacks.rating} = 3 THEN 1 END)`,
    rating2: sql<number>`COUNT(CASE WHEN ${feedbacks.rating} = 2 THEN 1 END)`,
    rating1: sql<number>`COUNT(CASE WHEN ${feedbacks.rating} = 1 THEN 1 END)`,
  }).from(feedbacks);

  return c.json(stats[0]);
});
