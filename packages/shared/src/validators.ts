import { z } from 'zod';

// --- 주문 생성 ---
export const createOrderSchema = z.object({
  tableId: z.string().uuid().optional(),
  tableNumber: z.number().int().min(1).optional(),
  sessionToken: z.string().optional(),
  customerId: z.string().uuid().optional(),
  serviceMode: z.enum(['counter', 'table_tablet', 'staff_order']),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
    specialRequest: z.string().max(500).optional(),
  })).min(1),
  specialRequest: z.string().max(1000).optional(),
  buzzerNumber: z.number().int().min(1).max(30).optional(), // 국대떡볶이식
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// --- 주문 상태 업데이트 ---
export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled']),
  staffId: z.string().uuid().optional(),
});

// --- 주문 아이템 상태 업데이트 (주방용) ---
export const updateOrderItemStatusSchema = z.object({
  orderItemId: z.string().uuid(),
  status: z.enum(['preparing', 'ready', 'served', 'cancelled']),
});

// --- 결제 ---
export const processPaymentSchema = z.object({
  orderId: z.string().uuid(),
  paymentMethod: z.enum(['cash', 'card', 'gcash', 'customer_card']),
  amount: z.number().positive(),
  discountCode: z.string().optional(),
  splitPayment: z.array(z.object({
    method: z.enum(['cash', 'card', 'gcash']),
    amount: z.number().positive(),
  })).optional(),
});

// --- 고객 피드백 ---
export const createFeedbackSchema = z.object({
  orderId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// --- 메뉴 아이템 ---
export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  nameTl: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  costPrice: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  allergens: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  prepTimeMinutes: z.number().int().min(1).max(120).optional(),
});

// --- 테이블 세션 ---
export const startTableSessionSchema = z.object({
  tableNumber: z.number().int().min(1),
  guestCount: z.number().int().min(1).max(20).optional(),
  customerPhone: z.string().optional(),
});

// --- 직원 PIN 로그인 ---
export const staffPinLoginSchema = z.object({
  pin: z.string().length(4),
});

// --- 거래 (재무) ---
export const createTransactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  sourceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })).optional(),
});
