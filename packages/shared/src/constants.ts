// ========================================
// 강원푸드 플랫폼 - 상수 정의
// ========================================

import type { OrderFlow } from './types';

// --- 서비스 모드별 주문 흐름 ---
export const ORDER_FLOWS: Record<string, OrderFlow> = {
  // 국대떡볶이식: 카운터 주문 → 진동벨 → 셀프 픽업
  counter: {
    mode: 'counter',
    steps: [
      { step: 1, name: '메뉴 확인', actor: 'customer', description: '벽면 메뉴판 또는 태블릿 키오스크로 메뉴 확인' },
      { step: 2, name: '카운터 주문', actor: 'customer', description: '카운터에서 주문 및 결제 (선결제)' },
      { step: 3, name: '진동벨 수령', actor: 'customer', description: '진동벨 번호 받고 자리에서 대기' },
      { step: 4, name: '조리', actor: 'kitchen', description: 'KDS에 주문 표시, 조리 시작' },
      { step: 5, name: '진동벨 알림', actor: 'system', description: '조리 완료 시 진동벨 울림' },
      { step: 6, name: '픽업/서빙', actor: 'staff', description: '한국인 직원이 직접 테이블로 서빙 (또는 고객 픽업)' },
    ],
  },
  // 태블릿 주문식: 테이블 태블릿 → 주방 → 한국인 직접 서빙
  table_tablet: {
    mode: 'table_tablet',
    steps: [
      { step: 1, name: 'QR 체크인', actor: 'customer', description: 'QR 스캔으로 테이블 세션 시작' },
      { step: 2, name: '태블릿 주문', actor: 'customer', description: '태블릿에서 메뉴 탐색 및 주문' },
      { step: 3, name: '주문 확인', actor: 'staff', description: '한국인 직원이 주문 확인 및 추천 멘트' },
      { step: 4, name: '조리', actor: 'kitchen', description: 'KDS에 주문 자동 전달, 조리 시작' },
      { step: 5, name: '서빙 알림', actor: 'system', description: '조리 완료 → 서빙 담당 직원에게 알림' },
      { step: 6, name: '직접 서빙', actor: 'staff', description: '한국인 직원이 메뉴 설명과 함께 서빙' },
      { step: 7, name: '추가 주문', actor: 'customer', description: '태블릿으로 추가 주문 가능 (세션 유지)' },
      { step: 8, name: '테이블 결제', actor: 'customer', description: '태블릿 또는 카운터에서 결제' },
    ],
  },
  // 전통식: 직원 주문 접수
  staff_order: {
    mode: 'staff_order',
    steps: [
      { step: 1, name: '착석', actor: 'customer', description: '테이블 안내 후 착석' },
      { step: 2, name: '주문 접수', actor: 'staff', description: '한국인 직원이 메뉴판으로 추천 및 주문 접수' },
      { step: 3, name: '주문 입력', actor: 'staff', description: 'POS/태블릿에 주문 입력' },
      { step: 4, name: '조리', actor: 'kitchen', description: 'KDS에 주문 전달, 조리 시작' },
      { step: 5, name: '직접 서빙', actor: 'staff', description: '한국인 직원이 서빙 + 메뉴 설명' },
      { step: 6, name: '결제', actor: 'staff', description: '카운터 결제' },
    ],
  },
};

// --- 서빙 교육 체크리스트 ---
export const SERVING_TRAINING_CHECKLIST = [
  { id: 'greet', category: '인사', item: '고객 입장 시 한국어+영어 인사', required: true },
  { id: 'seat', category: '안내', item: '테이블 안내 및 메뉴판/태블릿 설명', required: true },
  { id: 'recommend', category: '추천', item: '오늘의 추천 메뉴 안내 (AI 추천 기반)', required: true },
  { id: 'explain', category: '설명', item: '한국 음식 먹는 방법 설명 (현지인 고객)', required: true },
  { id: 'serve', category: '서빙', item: '음식 서빙 시 메뉴명 + 먹는 팁 안내', required: true },
  { id: 'check', category: '확인', item: '서빙 후 2분 내 맛 확인 방문', required: true },
  { id: 'refill', category: '리필', item: '반찬/물 리필 상태 수시 확인', required: true },
  { id: 'feedback', category: '피드백', item: '식사 완료 후 피드백 요청 (태블릿 안내)', required: false },
  { id: 'farewell', category: '인사', item: '퇴장 시 감사 인사 + 재방문 유도', required: true },
];

// --- 통화 ---
export const CURRENCY = 'PHP';
export const CURRENCY_SYMBOL = '₱';

// --- 색상 ---
export const BRAND_COLORS = {
  primary: '#f97316', // orange-500
  secondary: '#1e293b', // slate-800
  accent: '#10b981', // emerald-500
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// --- 진동벨 설정 ---
export const BUZZER_CONFIG = {
  maxBuzzers: 30,
  buzzerTimeout: 600, // 10분 (초)
  alertRepeat: 3, // 3회 반복 진동
};
