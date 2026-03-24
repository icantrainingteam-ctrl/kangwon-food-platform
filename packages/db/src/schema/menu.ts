import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

// --- Menu Categories ---
export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }),
  nameTl: varchar('name_tl', { length: 100 }), // Tagalog
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  icon: varchar('icon', { length: 50 }), // lucide icon name
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Menu Items ---
export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => menuCategories.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  nameEn: varchar('name_en', { length: 200 }),
  nameTl: varchar('name_tl', { length: 200 }),
  description: text('description'),
  descriptionEn: text('description_en'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }), // 원가
  imageUrl: varchar('image_url', { length: 500 }),
  allergens: jsonb('allergens').$type<string[]>().default([]), // ["gluten", "dairy"]
  tags: jsonb('tags').$type<string[]>().default([]), // ["spicy", "popular", "new"]
  recipe: text('recipe'), // 조리법 지시사항
  prepTimeMinutes: integer('prep_time_minutes').default(15),
  isAvailable: boolean('is_available').default(true).notNull(),
  isPopular: boolean('is_popular').default(false).notNull(),
  isSeasonal: boolean('is_seasonal').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  // Menu Matrix data (자동 계산)
  totalOrders: integer('total_orders').default(0).notNull(),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }).default('0'),
  profitMargin: decimal('profit_margin', { precision: 5, scale: 2 }), // %
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Menu Item Ingredients (레시피 원가 추적) ---
export const menuItemIngredients = pgTable('menu_item_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id).notNull(),
  ingredientId: uuid('ingredient_id').notNull(), // references inventory.ingredients
  quantity: decimal('quantity', { precision: 10, scale: 3 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
});

// --- Menu Recommendations (AI 추천 기록) ---
export const menuRecommendations = pgTable('menu_recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id).notNull(),
  recommendedWith: uuid('recommended_with').references(() => menuItems.id), // 페어링
  reason: text('reason'), // AI가 생성한 추천 이유
  score: decimal('score', { precision: 5, scale: 3 }), // 추천 점수
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
