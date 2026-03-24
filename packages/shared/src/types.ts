// ========================================
// 강원푸드 플랫폼 - 공유 타입 정의
// ========================================

// --- 서빙 시스템 (국대떡볶이 + 한국형 직접 서빙 하이브리드) ---
export type ServiceMode = 'counter' | 'table_tablet' | 'staff_order';
// counter: 국대떡볶이식 카운터 주문 → 진동벨 → 셀프 픽업
// table_tablet: 태블릿 주문 → 한국인 직접 서빙
// staff_order: 직원이 직접 주문 받음 (전통)

export type OrderFlow = {
  mode: ServiceMode;
  steps: OrderFlowStep[];
};

export type OrderFlowStep = {
  step: number;
  name: string;
  actor: 'customer' | 'staff' | 'kitchen' | 'system';
  description: string;
};

// --- 주문 관련 ---
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type PaymentMethod = 'cash' | 'card' | 'gcash' | 'customer_card';

// --- 메뉴 ---
export interface MenuItemView {
  id: string;
  name: string;
  nameEn: string;
  nameTl?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  categoryName: string;
  allergens: string[];
  tags: string[];
  prepTimeMinutes: number;
  isAvailable: boolean;
  isPopular: boolean;
  avgRating: number;
}

export interface CartItem {
  menuItem: MenuItemView;
  quantity: number;
  specialRequest?: string;
}

// --- 주문 ---
export interface OrderView {
  id: string;
  orderNumber: number;
  tableNumber?: number;
  items: OrderItemView[];
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  customerName?: string;
  staffName?: string;
  createdAt: string;
  estimatedReadyAt?: string;
}

export interface OrderItemView {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialRequest?: string;
  status: OrderItemStatus;
}

// --- 주방 디스플레이 (KDS) ---
export interface KitchenOrderView {
  id: string;
  orderNumber: number;
  tableNumber?: number;
  serviceMode: ServiceMode;
  items: KitchenItemView[];
  totalPrepTime: number; // 예상 총 조리 시간
  elapsedTime: number; // 경과 시간 (초)
  priority: 'normal' | 'rush' | 'vip';
  buzzerNumber?: number;
  createdAt: string;
}

export interface KitchenItemView {
  id: string;
  name: string;
  quantity: number;
  specialRequest?: string;
  status: OrderItemStatus;
  prepTimeMinutes: number;
  recipe?: string;
}

// --- 서빙 알림 (한국인 직원용) ---
export interface ServingAlert {
  id: string;
  orderId: string;
  orderNumber: number;
  tableNumber?: number;
  serviceMode: ServiceMode;
  alertType: 'ready_for_pickup' | 'ready_for_serving' | 'buzzer_call' | 'customer_request';
  message: string; // "3번 테이블 김치찌개 외 2건 서빙 준비 완료"
  staffId?: string;
  staffName?: string;
  createdAt: string;
  acknowledgedAt?: string;
}

// --- 실시간 이벤트 ---
export type WSEventType =
  | 'order:created'
  | 'order:confirmed'
  | 'order:status_changed'
  | 'order:item_preparing'
  | 'order:item_ready'
  | 'order:ready'
  | 'order:served'
  | 'order:paid'
  | 'order:cancelled'
  | 'table:status_changed'
  | 'kitchen:alert'
  | 'serving:alert'
  | 'buzzer:ring'
  | 'inventory:low_stock'
  | 'insight:new'
  | 'kpi:updated';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}

// --- 대시보드 KPI ---
export interface DashboardKPI {
  todayRevenue: number;
  todayOrders: number;
  avgOrderAmount: number;
  avgPrepTime: number; // 분
  customerSatisfaction: number; // 1-5
  tableUtilization: number; // %
  topMenuItems: Array<{ name: string; count: number; revenue: number }>;
  hourlyRevenue: Array<{ hour: number; revenue: number; orders: number }>;
}

// --- 전략 ---
export interface StrategyView {
  id: string;
  level: 'objective' | 'key_result' | 'tactic' | 'action';
  title: string;
  description?: string;
  status: string;
  kpiMetric?: string;
  kpiTarget?: number;
  kpiCurrent?: number;
  kpiUnit?: string;
  progress: number; // 0-100%
  children: StrategyView[];
  assignedTo?: string;
  dueDate?: string;
}
