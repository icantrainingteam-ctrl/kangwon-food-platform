// 메뉴명 → 실제 음식 이미지 매핑
// 나중에 실제 매장 촬영 사진으로 교체 예정
// Unsplash 정적 CDN 이미지 사용 (안정적 로딩 보장)

const MENU_IMAGE_MAP: Record<string, string> = {
  // 한식 메인
  '비빔밥': 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=500&h=400&fit=crop',
  '불고기 정식': 'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?w=500&h=400&fit=crop',
  '제육볶음': 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=500&h=400&fit=crop',
  '닭갈비': 'https://images.unsplash.com/photo-1632709810780-b5a4343cebec?w=500&h=400&fit=crop',

  // 찌개/탕
  '김치찌개': 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500&h=400&fit=crop',
  '된장찌개': 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=500&h=400&fit=crop',
  '순두부찌개': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&h=400&fit=crop',
  '부대찌개 (2인)': 'https://images.unsplash.com/photo-1600289031464-74d374b2d7bc?w=500&h=400&fit=crop',

  // 구이
  '삼겹살 (200g)': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&h=400&fit=crop',
  '목살 (200g)': 'https://images.unsplash.com/photo-1643091577248-e6cb1d285a8f?w=500&h=400&fit=crop',
  '소갈비 (250g)': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&h=400&fit=crop',

  // 퓨전
  '아도보 비빔밥': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
  '시시그 김치볶음밥': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=400&fit=crop',
  '불고기 룸피아': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop',
  '칼라만시 냉면': 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500&h=400&fit=crop',

  // 안주/사이드
  '계란말이': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&h=400&fit=crop',
  '김치전': 'https://images.unsplash.com/photo-1580651214613-f4692d6d138f?w=500&h=400&fit=crop',
  '두부김치': 'https://images.unsplash.com/photo-1583032015879-e5022cb87c3b?w=500&h=400&fit=crop',
  '떡볶이': 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=500&h=400&fit=crop&q=80',

  // 음료
  '콜라/사이다': 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=500&h=400&fit=crop',
  '식혜': 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=500&h=400&fit=crop',
  '칼라만시 에이드': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&h=400&fit=crop',

  // 주류
  '소주': 'https://images.unsplash.com/photo-1574710882113-da49e88445fb?w=500&h=400&fit=crop',
  '맥주 (500ml)': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&h=400&fit=crop',
  '막걸리': 'https://images.unsplash.com/photo-1600956053702-db35abd0b56d?w=500&h=400&fit=crop',
};

export function getMenuImage(menuName: string): string | null {
  return MENU_IMAGE_MAP[menuName] ?? null;
}
