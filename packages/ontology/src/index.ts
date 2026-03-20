import { db } from '@kangwon/db';
import { entities, relations, events } from '@kangwon/db/schema';
import { eq } from 'drizzle-orm';

// ========================================
// 온톨로지 엔진: 엔티티 관계 자동 생성
// 팔란티어 Foundry의 핵심 개념 구현
// ========================================

type EntityType = 'customer' | 'menu_item' | 'ingredient' | 'supplier' | 'staff' | 'campaign' | 'order';
type RelationType = 'ordered' | 'contains' | 'requires' | 'supplied_by' | 'served_by' | 'feedback_on' | 'part_of' | 'triggers';

// --- 엔티티 생성/조회 ---
export async function getOrCreateEntity(
  type: EntityType,
  refId: string,
  name: string,
  properties?: Record<string, unknown>
) {
  const [existing] = await db.select()
    .from(entities)
    .where(eq(entities.refId, refId))
    .limit(1);

  if (existing) return existing;

  const [entity] = await db.insert(entities).values({
    type,
    refId,
    name,
    properties: properties ?? {},
  }).returning();

  return entity;
}

// --- 관계 생성 ---
export async function createRelation(
  sourceId: string,
  targetId: string,
  relationType: RelationType,
  properties?: Record<string, unknown>,
  weight?: number
) {
  const [relation] = await db.insert(relations).values({
    sourceId,
    targetId,
    relationType,
    properties: properties ?? {},
    weight: weight ? String(weight) : '1.0',
  }).returning();

  return relation;
}

// --- 이벤트 발행 ---
export async function emitEvent(
  entityId: string | null,
  entityType: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  const [event] = await db.insert(events).values({
    entityId,
    entityType,
    eventType,
    payload,
  }).returning();

  return event;
}

// --- 주문 온톨로지 자동 생성 ---
// 주문이 생성될 때 호출: Customer → Order → MenuItem 관계 자동 구축
export async function buildOrderOntology(order: {
  orderId: string;
  orderNumber: number;
  customerId?: string;
  customerName?: string;
  staffId?: string;
  staffName?: string;
  items: Array<{ menuItemId: string; menuItemName: string; quantity: number }>;
}) {
  // 1. Order 엔티티
  const orderEntity = await getOrCreateEntity('order', order.orderId, `주문 #${order.orderNumber}`);

  // 2. Customer → Order 관계
  if (order.customerId) {
    const customerEntity = await getOrCreateEntity('customer', order.customerId, order.customerName ?? '고객');
    await createRelation(customerEntity.id, orderEntity.id, 'ordered');
  }

  // 3. Order → MenuItem 관계
  for (const item of order.items) {
    const menuEntity = await getOrCreateEntity('menu_item', item.menuItemId, item.menuItemName);
    await createRelation(orderEntity.id, menuEntity.id, 'contains', { quantity: item.quantity });
  }

  // 4. Staff → Order 관계
  if (order.staffId) {
    const staffEntity = await getOrCreateEntity('staff', order.staffId, order.staffName ?? '직원');
    await createRelation(staffEntity.id, orderEntity.id, 'served_by');
  }

  // 5. 이벤트 발행
  await emitEvent(orderEntity.id, 'order', 'order_ontology_built', {
    orderNumber: order.orderNumber,
    itemCount: order.items.length,
    hasCustomer: !!order.customerId,
  });

  return orderEntity;
}
