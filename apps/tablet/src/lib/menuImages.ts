// 메뉴명 → 실제 음식 이미지 매핑
// 나중에 실제 촬영 사진으로 교체 예정

const MENU_IMAGE_MAP: Record<string, string> = {
  // 한식 메인
  '비빔밥': 'https://readdy.ai/api/search-image?query=traditional%20Korean%20bibimbap%20in%20stone%20pot%20with%20colorful%20fresh%20vegetables%20carrots%20spinach%20bean%20sprouts%20mushrooms%20perfectly%20cooked%20fried%20egg%20on%20top%20gochujang%20sauce%20on%20side%20professional%20food%20photography%20top%20down%20view%20vibrant%20colors%20clean%20white%20background%20centered%20composition%20appetizing%20presentation&width=500&height=400&seq=menu1ko&orientation=landscape',
  '불고기 정식': 'https://readdy.ai/api/search-image?query=Korean%20bulgogi%20marinated%20grilled%20beef%20with%20caramelized%20edges%20garnished%20with%20sesame%20seeds%20and%20sliced%20green%20onions%20served%20with%20lettuce%20wraps%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20appetizing%20presentation&width=500&height=400&seq=menu2ko&orientation=landscape',
  '제육볶음': 'https://readdy.ai/api/search-image?query=Korean%20spicy%20stir%20fried%20pork%20jeyuk%20bokkeum%20with%20gochujang%20sauce%20onions%20scallions%20on%20white%20plate%20professional%20food%20photography%20clean%20background%20appetizing&width=500&height=400&seq=jeyuk1&orientation=landscape',
  '닭갈비': 'https://readdy.ai/api/search-image?query=Korean%20dakgalbi%20spicy%20stir%20fried%20chicken%20with%20gochujang%20vegetables%20rice%20cake%20in%20large%20pan%20professional%20food%20photography%20appetizing%20top%20view&width=500&height=400&seq=dakgalbi1&orientation=landscape',

  // 찌개/탕
  '김치찌개': 'https://readdy.ai/api/search-image?query=Korean%20kimchi%20jjigae%20in%20traditional%20stone%20pot%20bubbling%20hot%20broth%20with%20tofu%20pork%20kimchi%20vibrant%20red%20color%20steam%20rising%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20appetizing%20presentation&width=500&height=400&seq=menu3ko&orientation=landscape',
  '된장찌개': 'https://readdy.ai/api/search-image?query=Korean%20doenjang%20jjigae%20fermented%20soybean%20paste%20stew%20with%20tofu%20zucchini%20mushrooms%20in%20stone%20pot%20bubbling%20professional%20food%20photography%20clean%20background&width=500&height=400&seq=doenjang1&orientation=landscape',
  '순두부찌개': 'https://readdy.ai/api/search-image?query=Korean%20sundubu%20jjigae%20soft%20tofu%20stew%20bright%20red%20broth%20with%20egg%20seafood%20in%20stone%20pot%20steaming%20professional%20food%20photography%20appetizing&width=500&height=400&seq=sundubu1&orientation=landscape',
  '부대찌개 (2인)': 'https://readdy.ai/api/search-image?query=Korean%20budae%20jjigae%20army%20stew%20with%20ramen%20noodles%20spam%20sausage%20kimchi%20cheese%20in%20large%20pot%20professional%20food%20photography%20appetizing&width=500&height=400&seq=budae1&orientation=landscape',

  // 구이
  '삼겹살 (200g)': 'https://readdy.ai/api/search-image?query=Korean%20samgyeopsal%20grilled%20pork%20belly%20slices%20cooking%20on%20grill%20with%20lettuce%20wraps%20ssamjang%20sauce%20various%20side%20dishes%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20sizzling%20appetizing%20presentation&width=500&height=400&seq=menu4ko&orientation=landscape',
  '목살 (200g)': 'https://readdy.ai/api/search-image?query=Korean%20grilled%20pork%20neck%20moksal%20thick%20slices%20on%20grill%20golden%20brown%20with%20side%20dishes%20professional%20food%20photography%20appetizing&width=500&height=400&seq=moksal1&orientation=landscape',
  '소갈비 (250g)': 'https://readdy.ai/api/search-image?query=Korean%20beef%20short%20ribs%20galbi%20marinated%20grilled%20on%20plate%20garnished%20with%20sesame%20seeds%20scallions%20professional%20food%20photography%20premium%20appetizing&width=500&height=400&seq=galbi1&orientation=landscape',

  // 퓨전
  '아도보 비빔밥': 'https://readdy.ai/api/search-image?query=fusion%20Filipino%20adobo%20Korean%20bibimbap%20in%20stone%20bowl%20with%20adobo%20chicken%20vegetables%20egg%20professional%20food%20photography%20appetizing&width=500&height=400&seq=adobo1&orientation=landscape',
  '시시그 김치볶음밥': 'https://readdy.ai/api/search-image?query=Filipino%20sisig%20Korean%20kimchi%20fried%20rice%20fusion%20dish%20with%20egg%20on%20top%20sizzling%20plate%20professional%20food%20photography%20appetizing&width=500&height=400&seq=sisig1&orientation=landscape',
  '불고기 룸피아': 'https://readdy.ai/api/search-image?query=Korean%20bulgogi%20Filipino%20lumpia%20spring%20rolls%20crispy%20golden%20with%20dipping%20sauce%20professional%20food%20photography%20appetizing&width=500&height=400&seq=lumpia1&orientation=landscape',
  '칼라만시 냉면': 'https://readdy.ai/api/search-image?query=Korean%20cold%20noodles%20naengmyeon%20with%20calamansi%20citrus%20ice%20refreshing%20in%20metal%20bowl%20professional%20food%20photography%20appetizing&width=500&height=400&seq=naeng1&orientation=landscape',

  // 안주/사이드
  '계란말이': 'https://readdy.ai/api/search-image?query=Korean%20egg%20roll%20gyeranmari%20sliced%20on%20plate%20showing%20spiral%20layers%20professional%20food%20photography%20appetizing%20clean%20background&width=500&height=400&seq=egg1&orientation=landscape',
  '김치전': 'https://readdy.ai/api/search-image?query=Korean%20kimchi%20pancake%20jeon%20crispy%20golden%20brown%20sliced%20on%20plate%20with%20dipping%20sauce%20professional%20food%20photography%20appetizing&width=500&height=400&seq=jeon1&orientation=landscape',
  '두부김치': 'https://readdy.ai/api/search-image?query=Korean%20tofu%20with%20stir%20fried%20kimchi%20dubu%20kimchi%20on%20plate%20professional%20food%20photography%20appetizing%20clean%20background&width=500&height=400&seq=dubu1&orientation=landscape',
  '떡볶이': 'https://readdy.ai/api/search-image?query=Korean%20tteokbokki%20spicy%20rice%20cakes%20in%20red%20gochujang%20sauce%20with%20fish%20cake%20boiled%20egg%20garnished%20with%20sesame%20seeds%20and%20green%20onions%20professional%20food%20photography%20clean%20white%20background%20centered%20composition%20vibrant%20red%20color&width=500&height=400&seq=menu6ko&orientation=landscape',

  // 음료
  '콜라/사이다': 'https://readdy.ai/api/search-image?query=cold%20cola%20and%20sprite%20in%20glass%20with%20ice%20cubes%20refreshing%20condensation%20on%20glass%20professional%20beverage%20photography%20clean%20background&width=500&height=400&seq=cola1&orientation=landscape',
  '식혜': 'https://readdy.ai/api/search-image?query=Korean%20sikhye%20sweet%20rice%20punch%20drink%20in%20traditional%20brass%20bowl%20with%20rice%20grains%20floating%20professional%20food%20photography%20clean%20background&width=500&height=400&seq=sikhye1&orientation=landscape',
  '칼라만시 에이드': 'https://readdy.ai/api/search-image?query=fresh%20calamansi%20lemonade%20citrus%20drink%20in%20tall%20glass%20with%20ice%20lime%20slices%20refreshing%20professional%20beverage%20photography%20bright&width=500&height=400&seq=cala1&orientation=landscape',

  // 주류
  '소주': 'https://readdy.ai/api/search-image?query=Korean%20soju%20bottle%20and%20small%20glass%20traditional%20green%20bottle%20professional%20product%20photography%20clean%20background&width=500&height=400&seq=soju1&orientation=landscape',
  '맥주 (500ml)': 'https://readdy.ai/api/search-image?query=cold%20Korean%20beer%20in%20glass%20with%20foam%20head%20golden%20lager%20professional%20beverage%20photography%20clean%20background&width=500&height=400&seq=beer1&orientation=landscape',
  '막걸리': 'https://readdy.ai/api/search-image?query=Korean%20makgeolli%20rice%20wine%20in%20traditional%20bowl%20milky%20white%20with%20bottle%20professional%20beverage%20photography%20clean%20background&width=500&height=400&seq=makgeolli1&orientation=landscape',
};

export function getMenuImage(menuName: string): string | null {
  return MENU_IMAGE_MAP[menuName] ?? null;
}
