import { db } from '@kangwon/db';
import {
  events, orders, orderItems, menuItems, customers,
  ingredients, inventoryTransactions, menuItemIngredients,
} from '@kangwon/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { buildOrderOntology } from '@kangwon/ontology';
import { broadcastEvent } from '../ws/handler';

// ========================================
// 이벤트 파이프라인 프로세서
// 모든 비즈니스 이벤트를 처리하고 연쇄 작업 실행
// ========================================

// --- 이벤트 프로세서 메인 루프 ---
export async function processEvents() {
  const unprocessed = await db.select()
    .from(events)
    .where(eq(events.processed, 0))
    .orderBy(events.createdAt)
    .limit(50);

  for (const event of unprocessed) {
    try {
      await processEvent(event);
      await db.update(events)
        .set({ processed: 1, processedAt: new Date() })
        .where(eq(events.id, event.id));
    } catch (err) {
      console.error(`Failed to process event ${event.id}:`, err);
    }
  }

  return unprocessed.length;
}

// --- 개별 이벤트 처리 ---
async function processEvent(event: typeof events.$inferSelect) {
  const payload = event.payload as Record<string, unknown>;

  switch (event.eventType) {
    case 'order_created':
      await handleOrderCreated(payload);
      break;

    case 'order_paid':
      await handleOrderPaid(payload);
      break;

    case 'feedback_submitted':
      await handleFeedbackSubmitted(payload);
      break;

    case 'order_ontology_built':
      // 온톨로지 빌드 완료 — 추가 분석 트리거
      break;

    default:
      console.log(`Unknown event type: ${event.eventType}`);
  }
}

// --- 주문 생성 시 처리 ---
async function handleOrderCreated(payload: Record<string, unknown>) {
  const orderId = payload.orderId as string;
  if (!orderId) return;

  // 1. 주문 상세 조회
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return;

  const items = await db.select({
    id: orderItems.id,
    menuItemId: orderItems.menuItemId,
    menuItemName: menuItems.name,
    quantity: orderItems.quantity,
  })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, orderId));

  // 2. 온톨로지 구축
  await buildOrderOntology({
    orderId,
    orderNumber: order.orderNumber,
    customerId: order.customerId ?? undefined,
    staffId: order.staffId ?? undefined,
    items: items.map(i => ({
      menuItemId: i.menuItemId,
      menuItemName: i.menuItemName,
      quantity: i.quantity,
    })),
  });

  // 3. 메뉴 주문 카운트 증가
  for (const item of items) {
    await db.update(menuItems)
      .set({
        totalOrders: sql`${menuItems.totalOrders} + ${item.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, item.menuItemId));
  }

  // 4. 재고 자동 차감 (레시피 기반)
  for (const item of items) {
    const recipe = await db.select()
      .from(menuItemIngredients)
      .where(eq(menuItemIngredients.menuItemId, item.menuItemId));

    for (const ing of recipe) {
      const usageQty = Number(ing.quantity) * item.quantity;

      // 재고 차감
      await db.update(ingredients)
        .set({
          currentStock: sql`${ingredients.currentStock} - ${usageQty}`,
          updatedAt: new Date(),
        })
        .where(eq(ingredients.id, ing.ingredientId));

      // 입출고 기록
      await db.insert(inventoryTransactions).values({
        ingredientId: ing.ingredientId,
        type: 'usage',
        quantity: String(-usageQty),
        orderId,
        note: `주문 #${order.orderNumber} 자동 차감`,
      });

      // 재고 부족 알림 체크
      const [ingData] = await db.select()
        .from(ingredients)
        .where(eq(ingredients.id, ing.ingredientId));

      if (ingData && Number(ingData.currentStock) <= Number(ingData.minStock)) {
        broadcastEvent({
          type: 'inventory:low_stock',
          payload: {
            ingredientId: ingData.id,
            name: ingData.name,
            currentStock: Number(ingData.currentStock),
            minStock: Number(ingData.minStock),
            unit: ingData.unit,
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}

// --- 주문 결제 완료 시 ---
async function handleOrderPaid(payload: Record<string, unknown>) {
  const orderId = payload.orderId as string;
  if (!orderId) return;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return;

  // 1. 고객 RFM 업데이트
  if (order.customerId) {
    await db.update(customers)
      .set({
        totalSpent: sql`CAST(${customers.totalSpent} AS DECIMAL) + ${Number(order.finalAmount)}`,
        totalVisits: sql`${customers.totalVisits} + 1`,
        lastVisitAt: new Date(),
        rfmRecency: 0, // 오늘 방문
        rfmFrequency: sql`${customers.rfmFrequency} + 1`,
        rfmMonetary: sql`CAST(${customers.rfmMonetary} AS DECIMAL) + ${Number(order.finalAmount)}`,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, order.customerId));

    // RFM 세그먼트 재계산
    await recalculateRFMSegment(order.customerId);
  }

  // 2. KPI 업데이트 브로드캐스트
  broadcastEvent({
    type: 'kpi:updated',
    payload: {
      metric: 'revenue',
      orderId,
      amount: Number(order.finalAmount),
    },
    timestamp: new Date().toISOString(),
  });
}

// --- RFM 세그먼트 재계산 ---
async function recalculateRFMSegment(customerId: string) {
  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));
  if (!customer) return;

  const frequency = customer.totalVisits;
  const monetary = Number(customer.totalSpent);
  const recency = customer.lastVisitAt
    ? Math.floor((Date.now() - new Date(customer.lastVisitAt).getTime()) / 86400000)
    : 999;

  // 간단한 RFM 세그먼트 분류
  let segment: string;

  if (frequency >= 10 && monetary >= 10000 && recency <= 7) {
    segment = 'vip';
  } else if (frequency >= 5 && recency <= 14) {
    segment = 'loyal';
  } else if (frequency >= 3 && recency > 30) {
    segment = 'at_risk';
  } else if (recency > 60) {
    segment = 'dormant';
  } else if (frequency <= 2) {
    segment = 'new';
  } else {
    segment = 'regular';
  }

  await db.update(customers)
    .set({
      rfmSegment: segment,
      rfmRecency: recency,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId));
}

// --- 피드백 처리 ---
async function handleFeedbackSubmitted(payload: Record<string, unknown>) {
  // Claude 감성분석은 ai 패키지를 통해 별도 호출
  // 여기서는 기본 처리만 수행
  const rating = payload.rating as number;
  const orderId = payload.orderId as string;

  if (rating <= 2 && orderId) {
    // 부정 리뷰 → 매니저 알림
    broadcastEvent({
      type: 'insight:new',
      payload: {
        severity: 'critical',
        title: `긴급: 낮은 평점 (${rating}점) 접수`,
        orderId,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

// --- 파이프라인 스케줄러 ---
// 5초마다 미처리 이벤트 처리
let pipelineInterval: ReturnType<typeof setInterval> | null = null;

export function startPipeline() {
  if (pipelineInterval) return;
  console.log('📊 Event pipeline started (5s interval)');
  pipelineInterval = setInterval(async () => {
    try {
      const processed = await processEvents();
      if (processed > 0) {
        console.log(`  ✅ Processed ${processed} events`);
      }
    } catch (err) {
      console.error('Pipeline error:', err);
    }
  }, 5000);
}

export function stopPipeline() {
  if (pipelineInterval) {
    clearInterval(pipelineInterval);
    pipelineInterval = null;
    console.log('📊 Event pipeline stopped');
  }
}
