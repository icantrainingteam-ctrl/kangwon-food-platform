import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  timestamp,
  jsonb,
  date,
} from 'drizzle-orm/pg-core';
import { transactionTypeEnum, paymentMethodEnum, staffRoleEnum } from './enums';

// --- Staff (직원 - 한국인 직접 서빙 모델) ---
export const staff = pgTable('staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }),
  role: staffRoleEnum('role').notNull(),
  phone: varchar('phone', { length: 30 }),
  pin: varchar('pin', { length: 6 }), // 간편 로그인 PIN (태블릿/POS용)
  isActive: integer('is_active').default(1).notNull(),
  // 성과 추적
  totalOrdersServed: integer('total_orders_served').default(0),
  avgServiceTime: integer('avg_service_time').default(0), // 초 단위
  customerRating: decimal('customer_rating', { precision: 3, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Financial Sources (자금 원장) ---
export const financialSources = pgTable('financial_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'cash', 'card', 'gcash', 'bank'
  initialBalance: decimal('initial_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  currentBalance: decimal('current_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Expense Categories ---
export const expenseCategories = pgTable('expense_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  group: varchar('group', { length: 100 }), // 상위 그룹 (식자재, 인건비 등)
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active').default(1).notNull(),
});

// --- Transactions (기존 재무 거래 확장) ---
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => expenseCategories.id),
  sourceId: uuid('source_id').references(() => financialSources.id).notNull(),
  staffId: uuid('staff_id').references(() => staff.id),
  orderId: uuid('order_id'), // 주문 연결 (매출 자동 생성 시)
  receiptUrl: varchar('receipt_url', { length: 500 }),
  items: jsonb('items').$type<Array<{
    name: string;
    price: number;
    quantity: number;
  }>>().default([]),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Daily Closings (일일 마감) ---
export const dailyClosings = pgTable('daily_closings', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').unique().notNull(),
  totalIncome: decimal('total_income', { precision: 12, scale: 2 }).notNull(),
  totalExpense: decimal('total_expense', { precision: 12, scale: 2 }).notNull(),
  totalOrders: integer('total_orders').default(0),
  avgOrderAmount: decimal('avg_order_amount', { precision: 10, scale: 2 }),
  topMenuItems: jsonb('top_menu_items').$type<Array<{
    menuItemId: string;
    name: string;
    count: number;
    revenue: number;
  }>>().default([]),
  sourceSnapshots: jsonb('source_snapshots').$type<Array<{
    sourceId: string;
    name: string;
    balance: number;
  }>>().default([]),
  aiSummary: text('ai_summary'), // AI 일일 요약
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
