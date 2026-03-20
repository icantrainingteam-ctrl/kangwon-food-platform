import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '@kangwon/db';
import { orders, orderItems, orderEvents, tables, tableSessions } from '@kangwon/db/schema';
import { createOrderSchema, updateOrderStatusSchema, processPaymentSchema } from '@kangwon/shared';
import { eq, desc, sql, and } from 'drizzle-orm';
import { broadcastEvent } from '../ws/handler';

export const orderRoutes = new Hono();

// --- 주문 목록 (오늘) ---
orderRoutes.get('/', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  const result = await db.select()
    .from(orders)
    .where(sql`DATE(${orders.createdAt}) = ${today}`)
    .orderBy(desc(orders.createdAt));
  return c.json(result);
});

// --- 주문 상세 ---
orderRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order.length) return c.json({ error: 'Order not found' }, 404);

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return c.json({ ...order[0], items });
});

// --- 새 주문 생성 (태블릿/카운터/직원) ---
orderRoutes.post('/', zValidator('json', createOrderSchema), async (c) => {
  const input = c.req.valid('json');

  // 오늘 주문번호 생성
  const today = new Date().toISOString().split('T')[0];
  const countResult = await db.select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(sql`DATE(${orders.createdAt}) = ${today}`);
  const orderNumber = (countResult[0]?.count ?? 0) + 1;

  // 주문 생성
  const [newOrder] = await db.insert(orders).values({
    orderNumber,
    tableId: input.tableId,
    customerId: input.customerId,
    status: input.serviceMode === 'counter' ? 'confirmed' : 'pending', // 카운터는 선결제이므로 바로 confirmed
    totalAmount: '0',
    finalAmount: '0',
    metadata: { serviceMode: input.serviceMode, buzzerNumber: input.buzzerNumber },
  }).returning();

  // 주문 아이템 삽입 (메뉴 가격 조회 필요 - 실제 구현 시)
  // 여기서는 간략히 처리
  let total = 0;
  for (const item of input.items) {
    // TODO: 실제 메뉴 가격 조회
    const unitPrice = 0; // placeholder
    const totalPrice = unitPrice * item.quantity;
    total += totalPrice;

    await db.insert(orderItems).values({
      orderId: newOrder.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: String(unitPrice),
      totalPrice: String(totalPrice),
      specialRequest: item.specialRequest,
      status: 'pending',
    });
  }

  // 테이블 상태 업데이트
  if (input.tableId) {
    await db.update(tables)
      .set({ status: 'occupied', updatedAt: new Date() })
      .where(eq(tables.id, input.tableId));
  }

  // 이벤트 기록
  await db.insert(orderEvents).values({
    orderId: newOrder.id,
    eventType: 'created',
    payload: { serviceMode: input.serviceMode, itemCount: input.items.length },
  });

  // 실시간 브로드캐스트
  broadcastEvent({
    type: 'order:created',
    payload: { orderId: newOrder.id, orderNumber, tableId: input.tableId, serviceMode: input.serviceMode },
    timestamp: new Date().toISOString(),
  });

  return c.json(newOrder, 201);
});

// --- 주문 상태 업데이트 ---
orderRoutes.patch('/:id/status', zValidator('json', updateOrderStatusSchema), async (c) => {
  const input = c.req.valid('json');

  const [updated] = await db.update(orders)
    .set({
      status: input.status,
      ...(input.status === 'confirmed' && { confirmedAt: new Date() }),
      ...(input.status === 'paid' && { paidAt: new Date(), completedAt: new Date() }),
    })
    .where(eq(orders.id, input.orderId))
    .returning();

  if (!updated) return c.json({ error: 'Order not found' }, 404);

  // 이벤트 기록
  await db.insert(orderEvents).values({
    orderId: input.orderId,
    eventType: `status_${input.status}`,
    payload: { staffId: input.staffId },
    staffId: input.staffId,
  });

  // 서빙 완료/결제 시 테이블 해제
  if (input.status === 'paid' && updated.tableId) {
    await db.update(tables)
      .set({ status: 'cleaning', updatedAt: new Date() })
      .where(eq(tables.id, updated.tableId));
  }

  // 실시간 브로드캐스트
  broadcastEvent({
    type: `order:${input.status}` as any,
    payload: { orderId: input.orderId, status: input.status },
    timestamp: new Date().toISOString(),
  });

  // 진동벨 호출 (국대떡볶이식 - ready 상태일 때)
  if (input.status === 'ready') {
    const metadata = updated.metadata as Record<string, unknown>;
    if (metadata?.serviceMode === 'counter' && metadata?.buzzerNumber) {
      broadcastEvent({
        type: 'buzzer:ring',
        payload: { orderId: input.orderId, buzzerNumber: metadata.buzzerNumber, orderNumber: updated.orderNumber },
        timestamp: new Date().toISOString(),
      });
    } else {
      // 테이블 서빙 모드 → 직원에게 서빙 알림
      broadcastEvent({
        type: 'serving:alert',
        payload: {
          orderId: input.orderId,
          orderNumber: updated.orderNumber,
          tableId: updated.tableId,
          message: `주문 #${updated.orderNumber} 서빙 준비 완료`,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  return c.json(updated);
});

// --- 결제 처리 ---
orderRoutes.post('/:id/pay', zValidator('json', processPaymentSchema), async (c) => {
  const input = c.req.valid('json');

  const [paid] = await db.update(orders)
    .set({
      status: 'paid',
      paymentMethod: input.paymentMethod,
      finalAmount: String(input.amount),
      paidAt: new Date(),
      completedAt: new Date(),
    })
    .where(eq(orders.id, input.orderId))
    .returning();

  if (!paid) return c.json({ error: 'Order not found' }, 404);

  broadcastEvent({
    type: 'order:paid',
    payload: { orderId: input.orderId, amount: input.amount, method: input.paymentMethod },
    timestamp: new Date().toISOString(),
  });

  return c.json(paid);
});
