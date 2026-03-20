import { Hono } from 'hono';
import { db } from '@kangwon/db';
import { menuItems, menuCategories } from '@kangwon/db/schema';
import { eq, asc } from 'drizzle-orm';

export const menuRoutes = new Hono();

// --- 전체 메뉴 (카테고리별 그룹) ---
menuRoutes.get('/', async (c) => {
  const categories = await db.select()
    .from(menuCategories)
    .where(eq(menuCategories.isActive, true))
    .orderBy(asc(menuCategories.sortOrder));

  const items = await db.select()
    .from(menuItems)
    .where(eq(menuItems.isAvailable, true))
    .orderBy(asc(menuItems.sortOrder));

  const grouped = categories.map(cat => ({
    ...cat,
    items: items.filter(item => item.categoryId === cat.id),
  }));

  return c.json(grouped);
});

// --- 인기 메뉴 ---
menuRoutes.get('/popular', async (c) => {
  const items = await db.select()
    .from(menuItems)
    .where(eq(menuItems.isPopular, true))
    .orderBy(asc(menuItems.sortOrder));
  return c.json(items);
});

// --- 카테고리별 메뉴 ---
menuRoutes.get('/category/:id', async (c) => {
  const categoryId = c.req.param('id');
  const items = await db.select()
    .from(menuItems)
    .where(eq(menuItems.categoryId, categoryId))
    .orderBy(asc(menuItems.sortOrder));
  return c.json(items);
});

// --- 메뉴 상세 ---
menuRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!item) return c.json({ error: 'Menu item not found' }, 404);
  return c.json(item);
});

// --- 메뉴 가용성 토글 (매진/재개) ---
menuRoutes.patch('/:id/availability', async (c) => {
  const id = c.req.param('id');
  const { isAvailable } = await c.req.json<{ isAvailable: boolean }>();

  const [updated] = await db.update(menuItems)
    .set({ isAvailable, updatedAt: new Date() })
    .where(eq(menuItems.id, id))
    .returning();

  return c.json(updated);
});
