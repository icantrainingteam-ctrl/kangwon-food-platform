const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

// --- Analytics ---
export const api = {
  // KPI
  getKPI: () => fetchAPI<KPIData>('/api/analytics/kpi/today'),
  getMenuMatrix: (days?: number) => fetchAPI<MenuMatrixData>(`/api/analytics/menu-matrix?days=${days ?? 30}`),
  getRFMSegments: () => fetchAPI<RFMData>('/api/analytics/customers/rfm'),
  getSentimentTimeline: (days?: number) => fetchAPI<SentimentTimelineData>(`/api/analytics/sentiment/timeline?days=${days ?? 14}`),
  getRevenueTrend: (days?: number) => fetchAPI<RevenueTrendData>(`/api/analytics/revenue/trend?days=${days ?? 30}`),
  getStaffPerformance: (days?: number) => fetchAPI<StaffPerformanceData[]>(`/api/analytics/staff/performance?days=${days ?? 30}`),
  getMenuRanking: (days?: number, limit?: number) => fetchAPI<MenuRankingItem[]>(`/api/analytics/menu/ranking?days=${days ?? 7}&limit=${limit ?? 10}`),

  // Insights
  getInsights: (limit?: number) => fetchAPI<InsightItem[]>(`/api/insights?limit=${limit ?? 20}`),
  generateInsights: () => fetchAPI<{ generated: number }>('/api/insights/generate', { method: 'POST' }),
  markInsightRead: (id: string) => fetchAPI<InsightItem>(`/api/insights/${id}/read`, { method: 'PATCH' }),

  // Strategy
  getOKR: () => fetchAPI<StrategyNode[]>('/api/strategy/okr'),
  getCampaigns: () => fetchAPI<CampaignItem[]>('/api/strategy/campaigns'),
  updateKPI: (id: string, kpiCurrent: number) => fetchAPI<any>(`/api/strategy/${id}/kpi`, {
    method: 'PATCH',
    body: JSON.stringify({ kpiCurrent }),
  }),

  // Orders
  getTodayOrders: () => fetchAPI<any[]>('/api/orders'),
  getTables: () => fetchAPI<any[]>('/api/tables'),

  // Menu
  getMenu: () => fetchAPI<any[]>('/api/menu'),

  // Staff
  getStaff: () => fetchAPI<any[]>('/api/staff'),

  // Feedback
  getFeedbackStats: () => fetchAPI<FeedbackStats>('/api/feedback/stats'),
  getRecentFeedbacks: () => fetchAPI<any[]>('/api/feedback'),

  // Finance
  getFinanceSources: () => fetchAPI<any[]>('/api/finance/sources'),
  getTransactions: (limit?: number) => fetchAPI<any[]>(`/api/finance/transactions?limit=${limit ?? 50}`),
};

// --- Types ---
export interface KPIData {
  todayRevenue: number;
  todayOrders: number;
  avgOrderAmount: number;
  avgPrepTime: number;
  customerSatisfaction: number;
  feedbackCount: number;
  revenueChangePercent: number;
  yesterdayRevenue: number;
  hourlyRevenue: Array<{ hour: number; revenue: number; orders: number }>;
}

export interface MenuMatrixItem {
  id: string;
  name: string;
  nameEn: string;
  categoryId: string;
  price: number;
  costPrice: number;
  margin: number;
  totalOrders: number;
  totalRevenue: number;
  avgRating: number;
  quadrant: 'star' | 'cash_cow' | 'question_mark' | 'dog';
  isPopular: boolean;
  tags: string[];
}

export interface MenuMatrixData {
  items: MenuMatrixItem[];
  categories: any[];
  summary: {
    totalItems: number;
    stars: number;
    cashCows: number;
    questionMarks: number;
    dogs: number;
    avgMargin: number;
  };
}

export interface RFMData {
  segments: Array<{ segment: string; count: number; avgSpent: number; avgVisits: number }>;
  sentimentDistribution: Array<{ sentiment: string; count: number }>;
  newCustomerTrend: Array<{ date: string; count: number }>;
  totalCustomers: number;
}

export interface SentimentTimelineData {
  timeline: Array<{
    date: string;
    avgRating: number;
    avgSentiment: number;
    count: number;
    positive: number;
    negative: number;
  }>;
  criticalFeedbacks: any[];
}

export interface RevenueTrendData {
  trend: Array<{ date: string; revenue: number; orders: number; avgOrder: number }>;
  paymentDistribution: Array<{ method: string; count: number; total: number }>;
  categoryRevenue: Array<{ categoryId: string; categoryName: string; revenue: number; orders: number }>;
}

export interface StaffPerformanceData {
  id: string;
  name: string;
  role: string;
  ordersServed: number;
  totalRevenue: number;
  avgRating: number;
  feedbackCount: number;
}

export interface MenuRankingItem {
  id: string;
  name: string;
  nameEn: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface InsightItem {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  data: Record<string, unknown>;
  actionSuggestion: string;
  isRead: number;
  createdAt: string;
}

export interface StrategyNode {
  id: string;
  level: string;
  title: string;
  description: string;
  status: string;
  kpiMetric: string;
  kpiTarget: number;
  kpiCurrent: number;
  kpiUnit: string;
  progress: number;
  children: StrategyNode[];
}

export interface CampaignItem {
  id: string;
  name: string;
  type: string;
  status: string;
  targetSegment: string;
  budget: number;
  spent: number;
  revenueGenerated: number;
}

export interface FeedbackStats {
  avgRating: number;
  totalCount: number;
  rating5: number;
  rating4: number;
  rating3: number;
  rating2: number;
  rating1: number;
}
