import { pgEnum } from 'drizzle-orm/pg-core';

// --- Order ---
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'paid',
  'cancelled',
]);

export const orderItemStatusEnum = pgEnum('order_item_status', [
  'pending',
  'preparing',
  'ready',
  'served',
  'cancelled',
]);

// --- Table ---
export const tableStatusEnum = pgEnum('table_status', [
  'available',
  'occupied',
  'reserved',
  'cleaning',
]);

// --- Payment ---
export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'card',
  'gcash',
  'customer_card',
]);

// --- Transaction ---
export const transactionTypeEnum = pgEnum('transaction_type', [
  'expense',
  'income',
]);

// --- Strategy ---
export const strategyLevelEnum = pgEnum('strategy_level', [
  'objective',
  'key_result',
  'tactic',
  'action',
]);

export const strategyStatusEnum = pgEnum('strategy_status', [
  'draft',
  'active',
  'completed',
  'paused',
  'cancelled',
]);

// --- Ontology ---
export const entityTypeEnum = pgEnum('entity_type', [
  'customer',
  'menu_item',
  'ingredient',
  'supplier',
  'staff',
  'campaign',
  'order',
]);

export const relationTypeEnum = pgEnum('relation_type', [
  'ordered',
  'contains',
  'requires',
  'supplied_by',
  'served_by',
  'feedback_on',
  'part_of',
  'triggers',
]);

// --- Feedback ---
export const sentimentEnum = pgEnum('sentiment', [
  'very_positive',
  'positive',
  'neutral',
  'negative',
  'very_negative',
]);

// --- Staff ---
export const staffRoleEnum = pgEnum('staff_role', [
  'manager',
  'chef',
  'server',
  'cashier',
  'procurement',
  'marketing',
  'part_time',
]);

// --- Inventory ---
export const inventoryUnitEnum = pgEnum('inventory_unit', [
  'kg',
  'g',
  'l',
  'ml',
  'ea',
  'pack',
  'box',
]);
