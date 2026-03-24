import { Hono } from 'hono';
import { db } from '@kangwon/db';
import { orders, orderItems, menuItems, tables } from '@kangwon/db/schema';
import { eq, and, inArray, sql, desc } from 'drizzle-orm';
import { broadcastEvent } from '../ws/handler';

export const kitchenRoutes = new Hono();

// --- 주방 대기열 (조리 대기 + 조리 중) ---
kitchenRoutes.get('/queue', async (c) => {
  try {
    const activeOrders = await db.select({
        order: orders,
        tableNumber: tables.number,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(sql`${orders.status} IN ('pending', 'confirmed', 'preparing')`)
      .orderBy(orders.createdAt);

    const result = await Promise.all(activeOrders.map(async (row) => {
      const order = row.order;
      const items = await db.select({
        id: orderItems.id,
        menuItemId: orderItems.menuItemId,
        name: menuItems.name,
        quantity: orderItems.quantity,
        specialRequest: orderItems.specialRequest,
        status: orderItems.status,
        prepTimeMinutes: menuItems.prepTimeMinutes,
        recipe: menuItems.recipe,
      })
        .from(orderItems)
        .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .where(eq(orderItems.orderId, order.id));

      const metadata = order.metadata as Record<string, unknown>;
      const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        tableId: order.tableId,
        tableNumber: row.tableNumber,
        serviceMode: metadata?.serviceMode ?? 'table_tablet',
        buzzerNumber: metadata?.buzzerNumber,
        items,
        totalPrepTime: Math.max(...items.map(i => i.prepTimeMinutes ?? 15)),
        elapsedTime: elapsed,
        priority: elapsed > 900 ? 'rush' : 'normal',
        createdAt: order.createdAt,
      };
    }));

    return c.json(result);
  } catch (err: unknown) {
    console.error('Kitchen queue error:', err);
    return c.json({ error: 'Failed to fetch queue', detail: String(err) }, 500);
  }
});

// --- 주문 아이템 상태 업데이트 (개별 메뉴 조리 완료) ---
kitchenRoutes.patch('/item/:itemId/status', async (c) => {
  const itemId = c.req.param('itemId');
  const { status } = await c.req.json<{ status: string }>();

  const [updated] = await db.update(orderItems)
    .set({
      status: status as any,
      ...(status === 'preparing' && { prepStartedAt: new Date() }),
      ...(status === 'ready' && { readyAt: new Date() }),
      ...(status === 'served' && { servedAt: new Date() }),
    })
    .where(eq(orderItems.id, itemId))
    .returning();

  if (!updated) return c.json({ error: 'Item not found' }, 404);

  // 아이템 하나라도 조리 시작하면, 주문 자체도 '조리중'으로 변경
  if (status === 'preparing') {
    const [order] = await db.select().from(orders).where(eq(orders.id, updated.orderId));
    if (order && (order.status === 'pending' || order.status === 'confirmed')) {
      await db.update(orders)
        .set({ status: 'preparing' })
        .where(eq(orders.id, updated.orderId));
        
      broadcastEvent({
        type: 'order:status_changed',
        payload: { orderId: updated.orderId, status: 'preparing' },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 해당 주문의 모든 아이템이 ready인지 확인
  const allItems = await db.select()
    .from(orderItems)
    .where(eq(orderItems.orderId, updated.orderId));

  const allReady = allItems.every(item => item.status === 'ready' || item.status === 'served');

  if (allReady) {
    // 주문 전체를 ready로 변경
    await db.update(orders)
      .set({ status: 'ready' })
      .where(eq(orders.id, updated.orderId));

    // 서빙 알림 또는 진동벨
    const [order] = await db.select().from(orders).where(eq(orders.id, updated.orderId));
    const metadata = order?.metadata as Record<string, unknown>;

    if (metadata?.serviceMode === 'counter') {
      broadcastEvent({
        type: 'buzzer:ring',
        payload: {
          orderId: updated.orderId,
          buzzerNumber: metadata.buzzerNumber,
          orderNumber: order?.orderNumber,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      broadcastEvent({
        type: 'serving:alert',
        payload: {
          orderId: updated.orderId,
          orderNumber: order?.orderNumber,
          tableId: order?.tableId,
          message: `주문 #${order?.orderNumber} 전체 조리 완료 - 서빙해주세요`,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  broadcastEvent({
    type: 'order:item_ready',
    payload: { orderItemId: itemId, orderId: updated.orderId, status },
    timestamp: new Date().toISOString(),
  });

  return c.json(updated);
});

// --- 주방 통계 (오늘) ---
kitchenRoutes.get('/stats', async (c) => {
  const today = new Date().toISOString().split('T')[0];

  const stats = await db.select({
    totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
    completedOrders: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.status} IN ('ready', 'served', 'paid') THEN ${orders.id} END)`,
    pendingOrders: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.status} IN ('pending', 'confirmed', 'preparing') THEN ${orders.id} END)`,
  })
    .from(orders)
    .where(sql`DATE(${orders.createdAt}) = ${today}`);

  return c.json(stats[0]);
});
