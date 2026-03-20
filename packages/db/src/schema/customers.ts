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
import { sentimentEnum } from './enums';
import { orders } from './orders';

// --- Customers ---
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).unique(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 200 }),
  // RFM Scores (실시간 업데이트)
  rfmRecency: integer('rfm_recency').default(0), // 마지막 방문 이후 일수
  rfmFrequency: integer('rfm_frequency').default(0), // 총 방문 횟수
  rfmMonetary: decimal('rfm_monetary', { precision: 12, scale: 2 }).default('0'), // 총 소비 금액
  rfmSegment: varchar('rfm_segment', { length: 50 }).default('new'), // 'vip', 'loyal', 'at_risk', 'new', 'dormant'
  // Preferences (AI 분석 기반)
  preferences: jsonb('preferences').$type<{
    favoriteItems: string[];
    allergens: string[];
    avgSpend: number;
    visitPattern: string; // 'weekday_lunch', 'weekend_dinner', etc.
  }>().default({ favoriteItems: [], allergens: [], avgSpend: 0, visitPattern: '' }),
  totalVisits: integer('total_visits').default(0).notNull(),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0').notNull(),
  lastVisitAt: timestamp('last_visit_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Customer Feedbacks (리뷰/피드백) ---
export const feedbacks = pgTable('feedbacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id),
  customerId: uuid('customer_id').references(() => customers.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  sentiment: sentimentEnum('sentiment'), // AI 분석 결과
  sentimentScore: decimal('sentiment_score', { precision: 4, scale: 3 }), // -1.0 ~ 1.0
  aiAnalysis: jsonb('ai_analysis').$type<{
    keywords: string[];
    suggestions: string[];
    urgency: 'low' | 'medium' | 'high';
  }>(),
  isResolved: integer('is_resolved').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Coupons ---
export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  customerId: uuid('customer_id').references(() => customers.id),
  discountType: varchar('discount_type', { length: 20 }).notNull(), // 'percent', 'fixed'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }).default('0'),
  isUsed: integer('is_used').default(0),
  usedAt: timestamp('used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
