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
import { inventoryUnitEnum } from './enums';

// --- Suppliers (공급업체) ---
export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 200 }),
  address: text('address'),
  category: varchar('category', { length: 100 }), // 육류, 수산, 농산 등
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  isActive: integer('is_active').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Ingredients (식자재) ---
export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // 육류, 수산, 채소 등
  unit: inventoryUnitEnum('unit').notNull(),
  currentStock: decimal('current_stock', { precision: 12, scale: 3 }).default('0').notNull(),
  minStock: decimal('min_stock', { precision: 12, scale: 3 }).default('0').notNull(), // 최소 재고 (알림 임계치)
  avgCostPerUnit: decimal('avg_cost_per_unit', { precision: 10, scale: 2 }).default('0'),
  lastPurchasePrice: decimal('last_purchase_price', { precision: 10, scale: 2 }),
  preferredSupplierId: uuid('preferred_supplier_id').references(() => suppliers.id),
  storageLocation: varchar('storage_location', { length: 100 }), // 냉장, 냉동, 상온
  expiryDays: integer('expiry_days'), // 평균 유통기한 (일)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Inventory Transactions (입출고 기록) ---
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'purchase', 'usage', 'waste', 'adjustment'
  quantity: decimal('quantity', { precision: 12, scale: 3 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  orderId: uuid('order_id'), // 주문에 의한 자동 차감 시
  note: text('note'),
  receiptUrl: varchar('receipt_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Purchase Orders (발주) ---
export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
  status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, sent, confirmed, delivered, cancelled
  items: jsonb('items').$type<Array<{
    ingredientId: string;
    name: string;
    quantity: number;
    unit: string;
    estimatedPrice: number;
  }>>().default([]),
  totalEstimated: decimal('total_estimated', { precision: 12, scale: 2 }),
  totalActual: decimal('total_actual', { precision: 12, scale: 2 }),
  orderedAt: timestamp('ordered_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
