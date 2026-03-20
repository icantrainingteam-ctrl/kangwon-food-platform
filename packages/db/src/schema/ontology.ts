import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { entityTypeEnum, relationTypeEnum } from './enums';

// --- Ontology Entities (팔란티어식 온톨로지 엔티티) ---
export const entities = pgTable('entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: entityTypeEnum('type').notNull(),
  refId: uuid('ref_id').notNull(), // 실제 테이블의 ID (customer.id, menu_item.id 등)
  name: varchar('name', { length: 255 }).notNull(),
  properties: jsonb('properties').$type<Record<string, unknown>>().default({}),
  // embedding: vector('embedding', { dimensions: 1536 }), // pgvector 활성화 후 사용
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_entities_type').on(table.type),
  index('idx_entities_ref').on(table.refId),
]);

// --- Ontology Relations (엔티티 간 관계) ---
export const relations = pgTable('ontology_relations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => entities.id, { onDelete: 'cascade' }).notNull(),
  targetId: uuid('target_id').references(() => entities.id, { onDelete: 'cascade' }).notNull(),
  relationType: relationTypeEnum('relation_type').notNull(),
  properties: jsonb('properties').$type<Record<string, unknown>>().default({}),
  weight: decimal('weight', { precision: 5, scale: 3 }).default('1.0'),
  validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow(),
  validTo: timestamp('valid_to', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_relations_source').on(table.sourceId),
  index('idx_relations_target').on(table.targetId),
  index('idx_relations_type').on(table.relationType),
]);

// --- Events Stream (실시간 이벤트 스트림) ---
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').references(() => entities.id),
  entityType: varchar('entity_type', { length: 50 }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  processed: integer('processed').default(0),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_events_type').on(table.eventType),
  index('idx_events_processed').on(table.processed),
]);

// --- Insights (AI가 생성한 인사이트) ---
export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 50 }).notNull(), // 'menu', 'customer', 'finance', 'operations'
  severity: varchar('severity', { length: 20 }).default('info'), // 'info', 'warning', 'critical', 'opportunity'
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  data: jsonb('data').$type<Record<string, unknown>>().default({}),
  actionSuggestion: text('action_suggestion'), // AI 제안 액션
  isRead: integer('is_read').default(0),
  isActioned: integer('is_actioned').default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
