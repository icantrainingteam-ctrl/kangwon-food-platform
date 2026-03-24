import { db } from './client';
import {
  tables,
  menuCategories,
  menuItems,
  staff,
  financialSources,
  expenseCategories,
  ingredients,
  suppliers,
  strategies,
} from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // --- Tables (테이블 배치) ---
  const tableData = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    name: i < 8 ? `홀 ${i + 1}번` : `룸 ${String.fromCharCode(65 + i - 8)}`,
    seats: i < 8 ? 4 : 6,
    status: 'available' as const,
  }));
  await db.insert(tables).values(tableData);
  console.log('  ✅ Tables seeded (12개)');

  // --- Staff (한국인 직원 - 직접 서빙) ---
  const staffData = [
    { name: '김철수', nameEn: 'Kim Cheolsu', role: 'manager' as const, pin: '1234' },
    { name: '이영희', nameEn: 'Lee Younghee', role: 'procurement' as const, pin: '2345' },
    { name: '박지민', nameEn: 'Park Jimin', role: 'marketing' as const, pin: '3456' },
    { name: '최서연', nameEn: 'Choi Seoyeon', role: 'chef' as const, pin: '4567' },
    { name: '정민수', nameEn: 'Jung Minsu', role: 'server' as const, pin: '5678' },
    { name: '강하나', nameEn: 'Kang Hana', role: 'server' as const, pin: '6789' },
    { name: '윤재호', nameEn: 'Yoon Jaeho', role: 'chef' as const, pin: '7890' },
  ];
  await db.insert(staff).values(staffData);
  console.log('  ✅ Staff seeded (7명 - 한국인 직접 서빙)');

  // --- Menu Categories ---
  const categoryData = [
    { name: '한식 메인', nameEn: 'Korean Main', nameTl: 'Korean Main', sortOrder: 1, icon: 'utensils' },
    { name: '찌개/탕', nameEn: 'Stew & Soup', nameTl: 'Stew & Soup', sortOrder: 2, icon: 'soup' },
    { name: '구이', nameEn: 'Grilled', nameTl: 'Inihaw', sortOrder: 3, icon: 'flame' },
    { name: '퓨전', nameEn: 'Fusion', nameTl: 'Fusion', sortOrder: 4, icon: 'sparkles' },
    { name: '안주/사이드', nameEn: 'Side Dishes', nameTl: 'Side Dishes', sortOrder: 5, icon: 'salad' },
    { name: '음료', nameEn: 'Beverages', nameTl: 'Inumin', sortOrder: 6, icon: 'cup-soda' },
    { name: '주류', nameEn: 'Alcohol', nameTl: 'Alak', sortOrder: 7, icon: 'beer' },
  ];
  const insertedCategories = await db.insert(menuCategories).values(categoryData).returning();
  console.log('  ✅ Menu categories seeded (7개)');

  // Category ID lookup
  const catMap = Object.fromEntries(insertedCategories.map(c => [c.name, c.id]));

  // --- Menu Items ---
  const menuData = [
    // 한식 메인
    { categoryId: catMap['한식 메인'], name: '비빔밥', nameEn: 'Bibimbap', price: '350', costPrice: '120', prepTimeMinutes: 12, isPopular: true, recipe: '1. 밥 200g을 그릇에 담는다.\n2. 준비된 나물(시금치, 콩나물, 고사리, 도라지 등)을 색깔별로 예쁘게 올린다.\n3. 가운데 볶은 쇠고기를 올린다.\n4. 계란 프라이를 반숙으로 조리하여 올린다.\n5. 고추장 1스푼, 참기름 1티스푼을 곁들여 나간다.' },
    { categoryId: catMap['한식 메인'], name: '불고기 정식', nameEn: 'Bulgogi Set', price: '450', costPrice: '180', prepTimeMinutes: 15, isPopular: true, recipe: '1. 달궈진 팬에 양념된 소고기 불고기 200g을 올린다.\n2. 양파 50g, 대파 30g, 당근 약간을 함께 넣고 강불에 3분간 빠르게 볶는다.\n3. 고기가 익으면 참기름 1티스푼과 깨소금을 뿌린다.\n4. 뚝배기나 철판에 옮겨 담고, 밥 1공기, 쌈채소와 함께 서빙한다.' },
    { categoryId: catMap['한식 메인'], name: '제육볶음', nameEn: 'Spicy Pork', price: '380', costPrice: '140', prepTimeMinutes: 12, recipe: '1. 양념된 돼지고기 200g을 중불에 볶는다.\n2. 양파, 양배추, 대파를 넣고 강불로 올려 불맛을 낸다.\n3. 깨소금으로 마무리하여 접시에 담는다.' },
    { categoryId: catMap['한식 메인'], name: '닭갈비', nameEn: 'Dak-galbi', price: '420', costPrice: '160', prepTimeMinutes: 15, recipe: '1. 철판에 양배추, 고구마, 가래떡을 깐다.\n2. 양념 닭다리살을 중앙에 올리고 중불에서 5분간 익힌다.\n3. 타지 않게 저어가며 채소 숨이 죽고 고기가 익을 때까지 볶는다.' },
    // 찌개/탕
    { categoryId: catMap['찌개/탕'], name: '김치찌개', nameEn: 'Kimchi Jjigae', price: '320', costPrice: '100', prepTimeMinutes: 10, isPopular: true, recipe: '1. 뚝배기에 묵은지 100g과 돼지고기 70g을 넣고 참기름에 살짝 볶는다.\n2. 사골육수 300ml를 붓고 끓인다.\n3. 끓어오르면 양파, 대파, 두부 3조각을 넣는다.\n4. 고춧가루 약간으로 색을 내고 2분 더 끓여 서빙한다.' },
    { categoryId: catMap['찌개/탕'], name: '된장찌개', nameEn: 'Doenjang Jjigae', price: '300', costPrice: '90', prepTimeMinutes: 10, recipe: '1. 뚝배기에 멸치육수 300ml를 붓고 된장 1.5스푼을 푼다.\n2. 애호박, 양파, 감자를 썰어 넣고 끓인다.\n3. 끓어오르면 두부와 대파를 넣고 2분 끓인다.' },
    { categoryId: catMap['찌개/탕'], name: '순두부찌개', nameEn: 'Sundubu Jjigae', price: '320', costPrice: '95', prepTimeMinutes: 10, recipe: '1. 뚝배기에 고추기름 1스푼, 파, 다진마늘, 바지락을 넣고 볶는다.\n2. 육수를 붓고 끓인다.\n3. 순두부 1봉지를 넣고, 계란 1개를 깨서 넣는다.' },
    { categoryId: catMap['찌개/탕'], name: '부대찌개 (2인)', nameEn: 'Army Stew (2p)', price: '580', costPrice: '200', prepTimeMinutes: 15, recipe: '1. 전골냄비에 햄, 소시지, 김치, 베이크드빈스, 두부를 돌려 담는다.\n2. 가운데 라면사리와 치즈를 올린다.\n3. 육수 600ml를 붓고, 양념장을 올려 테이블용 버너와 함께 서빙한다.' },
    // 구이
    { categoryId: catMap['구이'], name: '삼겹살 (200g)', nameEn: 'Samgyeopsal', price: '500', costPrice: '220', prepTimeMinutes: 5, isPopular: true },
    { categoryId: catMap['구이'], name: '목살 (200g)', nameEn: 'Pork Neck', price: '480', costPrice: '200', prepTimeMinutes: 5 },
    { categoryId: catMap['구이'], name: '소갈비 (250g)', nameEn: 'Beef Short Rib', price: '850', costPrice: '450', prepTimeMinutes: 5 },
    // 퓨전 (강원 × 필리핀)
    { categoryId: catMap['퓨전'], name: '아도보 비빔밥', nameEn: 'Adobo Bibimbap', price: '380', costPrice: '130', prepTimeMinutes: 12, tags: ['new', 'fusion'] },
    { categoryId: catMap['퓨전'], name: '시시그 김치볶음밥', nameEn: 'Sisig Kimchi Fried Rice', price: '350', costPrice: '120', prepTimeMinutes: 10, tags: ['new', 'fusion', 'popular'] },
    { categoryId: catMap['퓨전'], name: '불고기 룸피아', nameEn: 'Bulgogi Lumpia', price: '280', costPrice: '90', prepTimeMinutes: 8, tags: ['new', 'fusion'] },
    { categoryId: catMap['퓨전'], name: '칼라만시 냉면', nameEn: 'Calamansi Naengmyeon', price: '320', costPrice: '100', prepTimeMinutes: 10, tags: ['new', 'fusion', 'seasonal'] },
    // 안주/사이드
    { categoryId: catMap['안주/사이드'], name: '계란말이', nameEn: 'Egg Roll', price: '180', costPrice: '40', prepTimeMinutes: 8 },
    { categoryId: catMap['안주/사이드'], name: '김치전', nameEn: 'Kimchi Pancake', price: '220', costPrice: '60', prepTimeMinutes: 10 },
    { categoryId: catMap['안주/사이드'], name: '두부김치', nameEn: 'Tofu Kimchi', price: '250', costPrice: '70', prepTimeMinutes: 8 },
    { categoryId: catMap['안주/사이드'], name: '떡볶이', nameEn: 'Tteokbokki', price: '200', costPrice: '60', prepTimeMinutes: 10 },
    // 음료
    { categoryId: catMap['음료'], name: '콜라/사이다', nameEn: 'Coke/Sprite', price: '80', costPrice: '25', prepTimeMinutes: 1 },
    { categoryId: catMap['음료'], name: '식혜', nameEn: 'Sikhye', price: '100', costPrice: '30', prepTimeMinutes: 1 },
    { categoryId: catMap['음료'], name: '칼라만시 에이드', nameEn: 'Calamansi Ade', price: '120', costPrice: '35', prepTimeMinutes: 3 },
    // 주류
    { categoryId: catMap['주류'], name: '소주', nameEn: 'Soju', price: '200', costPrice: '80', prepTimeMinutes: 1, isPopular: true },
    { categoryId: catMap['주류'], name: '맥주 (500ml)', nameEn: 'Beer', price: '180', costPrice: '70', prepTimeMinutes: 1 },
    { categoryId: catMap['주류'], name: '막걸리', nameEn: 'Makgeolli', price: '250', costPrice: '90', prepTimeMinutes: 1 },
    { categoryId: catMap['주류'], name: '산미구엘', nameEn: 'San Miguel', price: '150', costPrice: '60', prepTimeMinutes: 1 },
  ];
  await db.insert(menuItems).values(menuData.map(m => ({
    ...m,
    isPopular: m.isPopular ?? false,
    isSeasonal: m.tags?.includes('seasonal') ?? false,
    tags: m.tags ?? [],
    recipe: (m as any).recipe ?? null,
  })));
  console.log('  ✅ Menu items seeded (26개 - 퓨전 메뉴 포함)');

  // --- Financial Sources ---
  await db.insert(financialSources).values([
    { name: '현금 (금고)', type: 'cash', initialBalance: '500000', currentBalance: '500000' },
    { name: '법인 카드', type: 'card', initialBalance: '10000000', currentBalance: '10000000' },
    { name: 'G-Cash', type: 'gcash', initialBalance: '2000000', currentBalance: '2000000' },
  ]);
  console.log('  ✅ Financial sources seeded');

  // --- Expense Categories ---
  const expCats = [
    { name: '식자재-육류', group: '식자재', sortOrder: 1 },
    { name: '식자재-수산', group: '식자재', sortOrder: 2 },
    { name: '식자재-농산', group: '식자재', sortOrder: 3 },
    { name: '식자재-공산품/양념', group: '식자재', sortOrder: 4 },
    { name: '주류/음료', group: '식자재', sortOrder: 5 },
    { name: '인건비-정직원', group: '인건비', sortOrder: 10 },
    { name: '인건비-아르바이트', group: '인건비', sortOrder: 11 },
    { name: '월세', group: '고정비', sortOrder: 20 },
    { name: '공과금(전기/수도/가스)', group: '고정비', sortOrder: 21 },
    { name: '통신/인터넷', group: '고정비', sortOrder: 22 },
    { name: '포장용기', group: '운영비', sortOrder: 30 },
    { name: '소모품(휴지/세제)', group: '운영비', sortOrder: 31 },
    { name: '유지보수/수리', group: '운영비', sortOrder: 32 },
    { name: '가스/연료', group: '운영비', sortOrder: 33 },
    { name: '광고/홍보', group: '마케팅', sortOrder: 40 },
    { name: '세금/행정', group: '기타', sortOrder: 50 },
    { name: '기타', group: '기타', sortOrder: 99 },
  ];
  await db.insert(expenseCategories).values(expCats);
  console.log('  ✅ Expense categories seeded (17개)');

  // --- Strategies (초기 OKR) ---
  const objective = await db.insert(strategies).values({
    level: 'objective',
    title: '6개월 내 매출 50% 성장 달성',
    description: '아이캔의 강원푸드 인수 후 첫 반기 목표. 퓨전 메뉴 + 데이터 기반 운영으로 달성.',
    status: 'active',
    kpiMetric: 'monthly_revenue',
    kpiTarget: '15000000',
    kpiCurrent: '0',
    kpiUnit: 'PHP',
  }).returning();

  await db.insert(strategies).values([
    {
      parentId: objective[0].id,
      level: 'key_result',
      title: '퓨전 메뉴로 객단가 20% 향상',
      status: 'active',
      kpiMetric: 'avg_order_amount',
      kpiTarget: '540',
      kpiCurrent: '450',
      kpiUnit: 'PHP',
    },
    {
      parentId: objective[0].id,
      level: 'key_result',
      title: '마케팅으로 신규 고객 월 30% 증가',
      status: 'active',
      kpiMetric: 'new_customers_monthly',
      kpiTarget: '130',
      kpiCurrent: '100',
      kpiUnit: '명',
    },
    {
      parentId: objective[0].id,
      level: 'key_result',
      title: '고객 만족도 4.5 이상 유지',
      status: 'active',
      kpiMetric: 'avg_rating',
      kpiTarget: '4.5',
      kpiCurrent: '0',
      kpiUnit: '점',
    },
  ]);
  console.log('  ✅ Strategies seeded (OKR 1 Objective + 3 Key Results)');

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
