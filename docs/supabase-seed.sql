-- ========================================
-- 강원 (KANGWON) 초기 데이터 시드
-- Supabase SQL Editor에서 실행
-- ========================================

-- 1. 테이블 (12개)
INSERT INTO tables (number, name, seats, status) VALUES
(1, '홀 1번', 4, 'available'), (2, '홀 2번', 4, 'available'),
(3, '홀 3번', 4, 'available'), (4, '홀 4번', 4, 'available'),
(5, '홀 5번', 4, 'available'), (6, '홀 6번', 4, 'available'),
(7, '홀 7번', 4, 'available'), (8, '홀 8번', 4, 'available'),
(9, '룸 A', 6, 'available'), (10, '룸 B', 6, 'available'),
(11, '룸 C', 6, 'available'), (12, '룸 D', 6, 'available');

-- 2. 직원 (7명 - 한국인 직접 서빙)
INSERT INTO staff (name, name_en, role, pin) VALUES
('김철수', 'Kim Cheolsu', 'manager', '1234'),
('이영희', 'Lee Younghee', 'procurement', '2345'),
('박지민', 'Park Jimin', 'marketing', '3456'),
('최서연', 'Choi Seoyeon', 'chef', '4567'),
('정민수', 'Jung Minsu', 'server', '5678'),
('강하나', 'Kang Hana', 'server', '6789'),
('윤재호', 'Yoon Jaeho', 'chef', '7890');

-- 3. 메뉴 카테고리
INSERT INTO menu_categories (id, name, name_en, name_tl, sort_order, icon, is_active) VALUES
(gen_random_uuid(), '한식 메인', 'Korean Main', 'Korean Main', 1, 'utensils', true),
(gen_random_uuid(), '찌개/탕', 'Stew & Soup', 'Stew & Soup', 2, 'soup', true),
(gen_random_uuid(), '구이', 'Grilled', 'Inihaw', 3, 'flame', true),
(gen_random_uuid(), '퓨전', 'Fusion', 'Fusion', 4, 'sparkles', true),
(gen_random_uuid(), '안주/사이드', 'Side Dishes', 'Side Dishes', 5, 'salad', true),
(gen_random_uuid(), '음료', 'Beverages', 'Inumin', 6, 'cup-soda', true),
(gen_random_uuid(), '주류', 'Alcohol', 'Alak', 7, 'beer', true);

-- 4. 메뉴 아이템 (카테고리 ID 동적 참조)
-- 한식 메인
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '비빔밥', 'Bibimbap', 350, 120, 12, true, false, '[]'::jsonb FROM menu_categories WHERE name = '한식 메인';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '불고기 정식', 'Bulgogi Set', 450, 180, 15, true, false, '[]'::jsonb FROM menu_categories WHERE name = '한식 메인';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '제육볶음', 'Spicy Pork', 380, 140, 12, false, false, '[]'::jsonb FROM menu_categories WHERE name = '한식 메인';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '닭갈비', 'Dak-galbi', 420, 160, 15, false, false, '[]'::jsonb FROM menu_categories WHERE name = '한식 메인';

-- 찌개/탕
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '김치찌개', 'Kimchi Jjigae', 320, 100, 10, true, false, '[]'::jsonb FROM menu_categories WHERE name = '찌개/탕';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '된장찌개', 'Doenjang Jjigae', 300, 90, 10, false, false, '[]'::jsonb FROM menu_categories WHERE name = '찌개/탕';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '순두부찌개', 'Sundubu Jjigae', 320, 95, 10, false, false, '[]'::jsonb FROM menu_categories WHERE name = '찌개/탕';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '부대찌개 (2인)', 'Army Stew (2p)', 580, 200, 15, false, false, '[]'::jsonb FROM menu_categories WHERE name = '찌개/탕';

-- 구이
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '삼겹살 (200g)', 'Samgyeopsal', 500, 220, 5, true, false, '[]'::jsonb FROM menu_categories WHERE name = '구이';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '목살 (200g)', 'Pork Neck', 480, 200, 5, false, false, '[]'::jsonb FROM menu_categories WHERE name = '구이';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '소갈비 (250g)', 'Beef Short Rib', 850, 450, 5, false, false, '[]'::jsonb FROM menu_categories WHERE name = '구이';

-- 퓨전 (강원 × 필리핀)
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '아도보 비빔밥', 'Adobo Bibimbap', 380, 130, 12, false, false, '["new","fusion"]'::jsonb FROM menu_categories WHERE name = '퓨전';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '시시그 김치볶음밥', 'Sisig Kimchi Fried Rice', 350, 120, 10, false, false, '["new","fusion","popular"]'::jsonb FROM menu_categories WHERE name = '퓨전';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '불고기 룸피아', 'Bulgogi Lumpia', 280, 90, 8, false, false, '["new","fusion"]'::jsonb FROM menu_categories WHERE name = '퓨전';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '칼라만시 냉면', 'Calamansi Naengmyeon', 320, 100, 10, false, true, '["new","fusion","seasonal"]'::jsonb FROM menu_categories WHERE name = '퓨전';

-- 안주/사이드
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '계란말이', 'Egg Roll', 180, 40, 8, false, false, '[]'::jsonb FROM menu_categories WHERE name = '안주/사이드';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '김치전', 'Kimchi Pancake', 220, 60, 10, false, false, '[]'::jsonb FROM menu_categories WHERE name = '안주/사이드';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '두부김치', 'Tofu Kimchi', 250, 70, 8, false, false, '[]'::jsonb FROM menu_categories WHERE name = '안주/사이드';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '떡볶이', 'Tteokbokki', 200, 60, 10, false, false, '[]'::jsonb FROM menu_categories WHERE name = '안주/사이드';

-- 음료
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '콜라/사이다', 'Coke/Sprite', 80, 25, 1, false, false, '[]'::jsonb FROM menu_categories WHERE name = '음료';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '식혜', 'Sikhye', 100, 30, 1, false, false, '[]'::jsonb FROM menu_categories WHERE name = '음료';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '칼라만시 에이드', 'Calamansi Ade', 120, 35, 3, false, false, '[]'::jsonb FROM menu_categories WHERE name = '음료';

-- 주류
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '소주', 'Soju', 200, 80, 1, true, false, '[]'::jsonb FROM menu_categories WHERE name = '주류';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '맥주 (500ml)', 'Beer', 180, 70, 1, false, false, '[]'::jsonb FROM menu_categories WHERE name = '주류';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '막걸리', 'Makgeolli', 250, 90, 1, false, false, '[]'::jsonb FROM menu_categories WHERE name = '주류';
INSERT INTO menu_items (category_id, name, name_en, price, cost_price, prep_time_minutes, is_popular, is_seasonal, tags)
SELECT id, '산미구엘', 'San Miguel', 150, 60, 1, false, false, '[]'::jsonb FROM menu_categories WHERE name = '주류';

-- 5. 자금 원장
INSERT INTO financial_sources (name, type, initial_balance, current_balance) VALUES
('현금 (금고)', 'cash', 500000, 500000),
('법인 카드', 'card', 10000000, 10000000),
('G-Cash', 'gcash', 2000000, 2000000);

-- 6. 비용 카테고리
INSERT INTO expense_categories (name, "group", sort_order) VALUES
('식자재-육류', '식자재', 1), ('식자재-수산', '식자재', 2),
('식자재-농산', '식자재', 3), ('식자재-공산품/양념', '식자재', 4),
('주류/음료', '식자재', 5), ('인건비-정직원', '인건비', 10),
('인건비-아르바이트', '인건비', 11), ('월세', '고정비', 20),
('공과금(전기/수도/가스)', '고정비', 21), ('통신/인터넷', '고정비', 22),
('포장용기', '운영비', 30), ('소모품(휴지/세제)', '운영비', 31),
('유지보수/수리', '운영비', 32), ('가스/연료', '운영비', 33),
('광고/홍보', '마케팅', 40), ('세금/행정', '기타', 50),
('기타', '기타', 99);

-- 7. OKR (전략 목표)
DO $$
DECLARE obj_id uuid;
BEGIN
  INSERT INTO strategies (level, title, description, status, kpi_metric, kpi_target, kpi_current, kpi_unit)
  VALUES ('objective', '6개월 내 매출 50% 성장 달성', '아이캔의 강원푸드 인수 후 첫 반기 목표. 퓨전 메뉴 + 데이터 기반 운영으로 달성.', 'active', 'monthly_revenue', 15000000, 0, 'PHP')
  RETURNING id INTO obj_id;

  INSERT INTO strategies (parent_id, level, title, status, kpi_metric, kpi_target, kpi_current, kpi_unit) VALUES
  (obj_id, 'key_result', '퓨전 메뉴로 객단가 20% 향상', 'active', 'avg_order_amount', 540, 450, 'PHP'),
  (obj_id, 'key_result', '마케팅으로 신규 고객 월 30% 증가', 'active', 'new_customers_monthly', 130, 100, '명'),
  (obj_id, 'key_result', '고객 만족도 4.5 이상 유지', 'active', 'avg_rating', 4.5, 0, '점');
END $$;

-- 완료!
SELECT
  (SELECT COUNT(*) FROM tables) as tables_count,
  (SELECT COUNT(*) FROM staff) as staff_count,
  (SELECT COUNT(*) FROM menu_categories) as categories_count,
  (SELECT COUNT(*) FROM menu_items) as menu_items_count,
  (SELECT COUNT(*) FROM financial_sources) as sources_count,
  (SELECT COUNT(*) FROM expense_categories) as expense_cats_count,
  (SELECT COUNT(*) FROM strategies) as strategies_count;
