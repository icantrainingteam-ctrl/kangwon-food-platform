import { pgTable, uuid, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { tableStatusEnum } from './enums';

// --- Restaurant Tables (물리적 테이블) ---
export const tables = pgTable('tables', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: integer('number').unique().notNull(),
  name: varchar('name', { length: 50 }), // "창가 1번", "룸A" 등
  seats: integer('seats').default(4).notNull(),
  status: tableStatusEnum('status').default('available').notNull(),
  qrCode: varchar('qr_code', { length: 500 }), // QR 코드 데이터
  positionX: integer('position_x'), // 매장 레이아웃 좌표
  positionY: integer('position_y'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Table Sessions (테이블 점유 세션) ---
export const tableSessions = pgTable('table_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableId: uuid('table_id').references(() => tables.id).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).unique().notNull(),
  guestCount: integer('guest_count').default(1),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
});
