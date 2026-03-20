import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  jsonb,
  date,
} from 'drizzle-orm/pg-core';
import { strategyLevelEnum, strategyStatusEnum } from './enums';

// --- Strategies (OKR 기반 전략/전술/액션 계층) ---
export const strategies = pgTable('strategies', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id'), // 자기 참조: objective → key_result → tactic → action
  level: strategyLevelEnum('level').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: strategyStatusEnum('status').default('draft').notNull(),
  // KPI 추적
  kpiMetric: varchar('kpi_metric', { length: 100 }), // 'revenue', 'customer_count', 'avg_rating', etc.
  kpiTarget: decimal('kpi_target', { precision: 15, scale: 2 }),
  kpiCurrent: decimal('kpi_current', { precision: 15, scale: 2 }).default('0'),
  kpiUnit: varchar('kpi_unit', { length: 20 }), // 'PHP', '%', '건', '명'
  // Assignment
  assignedTo: uuid('assigned_to'), // staff id
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  // AI
  aiGenerated: jsonb('ai_generated').$type<{
    reasoning: string;
    confidence: number;
    alternatives: string[];
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Campaigns (마케팅 캠페인) ---
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  strategyId: uuid('strategy_id').references(() => strategies.id),
  name: varchar('name', { length: 300 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'discount', 'event', 'loyalty', 'seasonal'
  targetSegment: varchar('target_segment', { length: 50 }), // RFM segment
  channel: varchar('channel', { length: 50 }), // 'sms', 'kakao', 'facebook', 'in_store'
  // Budget & ROI
  budget: decimal('budget', { precision: 12, scale: 2 }).default('0'),
  spent: decimal('spent', { precision: 12, scale: 2 }).default('0'),
  revenueGenerated: decimal('revenue_generated', { precision: 12, scale: 2 }).default('0'),
  // Tracking
  config: jsonb('config').$type<Record<string, unknown>>().default({}), // 캠페인 설정 (할인율, 조건 등)
  status: varchar('status', { length: 20 }).default('draft'), // 'draft', 'active', 'paused', 'completed'
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Strategy Logs (전략 실행 로그) ---
export const strategyLogs = pgTable('strategy_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  strategyId: uuid('strategy_id').references(() => strategies.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  description: text('description'),
  kpiSnapshot: decimal('kpi_snapshot', { precision: 15, scale: 2 }),
  createdBy: uuid('created_by'), // staff or 'system'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
