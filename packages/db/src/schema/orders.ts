import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { orderStatusEnum, orderItemStatusEnum, paymentMethodEnum } from './enums';
import { tables, tableSessions } from './tables';
import { menuItems } from './menu';
import { staff } from './finance';

// --- Orders (태블릿/POS에서 생성) ---
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: integer('order_number').notNull(), // 일일 주문번호 (자동 증가)
  tableId: uuid('table_id').references(() => tables.id),
  sessionId: uuid('session_id').references(() => tableSessions.id),
  customerId: uuid('customer_id'), // references customers.id (nullable for walk-ins)
  status: orderStatusEnum('status').default('pending').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  staffId: uuid('staff_id').references(() => staff.id),
  specialRequest: text('special_request'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
});

// --- Order Items ---
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  specialRequest: text('special_request'),
  status: orderItemStatusEnum('status').default('pending').notNull(),
  prepStartedAt: timestamp('prep_started_at', { withTimezone: true }),
  readyAt: timestamp('ready_at', { withTimezone: true }),
  servedAt: timestamp('served_at', { withTimezone: true }),
});

// --- Order Events (주문 상태 변화 이벤트 로그) ---
export const orderEvents = pgTable('order_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'created', 'confirmed', 'item_ready', etc.
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}),
  staffId: uuid('staff_id').references(() => staff.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
