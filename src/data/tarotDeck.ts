export type TarotArcanaType = "major" | "minor";

export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";

export type TarotDeckCard = {
  code: string;
  sequence: number;
  arcana: TarotArcanaType;
  suit: TarotSuit | null;
  name_kr: string;
  name_en: string;
  rank: string | null;
  number: number | null;
  keywords: string[];
  meaning_upright: string;
  meaning_reversed: string;
  image_key: string;
  is_active: boolean;
};

export type TarotDeckCardWithImage = TarotDeckCard & {
  imageUrl: string;
};

export type DrawnTarotCard = TarotDeckCardWithImage & {
  isReversed: boolean;
};

/**
 * 메이저 22장: [영문명, 한글명, 정방향 의미, 역방향 의미].
 *
 * 역방향은 라이더-웨이트 전통대로 "그 카드의 원리가 막히거나 뒤집혀
 * 나타나는 상태"를 카드별로 쓴다. 예전에는 22장 전부가 "○○의 정반대
 * 축인 회피와 지연을 경계하세요"라는 같은 문장이어서, 어떤 메이저를
 * 뽑아도 역방향 해석이 동일했다 — 카드를 뽑는 의미가 없었다.
 */
const MAJOR_ARCANA: TarotDeckCard[] = [
  ["The Fool", "바보", "새로운 시작과 순수함, 낙관적인 모험을 상징합니다.", "설렘이 무모함으로 기울기 쉽습니다. 시작 자체보다 준비 없는 도약이 문제이니, 한 가지만 확인하고 출발하세요."],
  ["The Magician", "마법사", "잠재력의 발현과 집중, 기술의 실천을 상징합니다.", "가진 재능이 흩어져 낭비되는 상태입니다. 여러 가지를 벌이기보다 하나에 도구를 모으세요."],
  ["The High Priestess", "여사제", "직관과 숨은 정보의 인식을 의미합니다.", "직감을 무시하고 겉으로 드러난 말만 따르는 중입니다. 아직 공개되지 않은 사정이 있음을 전제로 판단을 미루세요."],
  ["The Empress", "여황제", "풍요·돌봄·성장 에너지를 나타냅니다.", "돌봄이 과보호로, 풍요가 정체로 굳는 상태입니다. 키우는 손을 잠시 놓아야 자라는 것이 있습니다."],
  ["The Emperor", "황제", "규칙, 구조, 권위를 상징합니다.", "구조가 경직으로, 권위가 독단으로 기우는 상태입니다. 규칙을 지키는 것과 규칙 뒤에 숨는 것을 구분하세요."],
  ["The Hierophant", "교황", "전통, 가르침, 의식을 의미합니다.", "형식과 관례가 본래 목적을 가리는 상태입니다. 왜 하는지 답할 수 없는 절차라면 다시 물을 때입니다."],
  ["The Lovers", "연인", "선택과 관계의 균형을 뜻합니다.", "선택을 미루거나 한쪽으로 기운 관계가 신호입니다. 둘 다 가지려는 마음이 둘 다 잃게 만들 수 있습니다."],
  ["The Chariot", "전차", "통제, 결심, 전환점을 의미합니다.", "방향 없이 속도만 남은 상태입니다. 고삐를 당겨 어디로 가는 중인지부터 다시 정하세요."],
  ["Strength", "힘", "억제된 힘과 내면의 용기를 뜻합니다.", "자기 의심이 용기를 눌러 참는 것과 억누르는 것이 섞여 있습니다. 힘으로 누르지 말고 달래서 다루세요."],
  ["The Hermit", "은둔자", "고독한 성찰과 내면 탐색을 상징합니다.", "성찰이 고립으로 길어진 상태입니다. 등불은 혼자 보려고 켜는 것이 아니니, 한 사람에게는 문을 여세요."],
  ["Wheel of Fortune", "운명의 수레바퀴", "순환과 변화를 나타냅니다.", "흐름을 거슬러 억지로 되돌리려는 상태입니다. 지금은 판을 바꿀 때가 아니라 지나가게 둘 때입니다."],
  ["Justice", "정의", "균형, 공정성, 결정의 책임을 의미합니다.", "저울이 기울었는데 모른 척하는 상태입니다. 결정의 결과를 남 탓으로 돌리는 순간 같은 문제가 반복됩니다."],
  ["The Hanged Man", "매달린 남자", "일시적 유예와 전환적 시야를 뜻합니다.", "기다림이 의미 없는 정체가 된 상태입니다. 희생하고 있다는 느낌만 남았다면 매달린 이유를 다시 물으세요."],
  ["Death", "죽음", "종결이 아닌 전이를 의미합니다.", "끝난 것을 붙잡고 있어 다음이 시작되지 못하는 상태입니다. 놓는 것이 잃는 것은 아닙니다."],
  ["Temperance", "절제", "균형 조절과 조율을 상징합니다.", "한쪽으로 과해진 상태입니다 — 일이든 감정이든 배합이 깨졌습니다. 줄일 것 하나를 정하는 것부터가 조율입니다."],
  ["The Devil", "악마", "집착, 유혹, 강박을 경고합니다.", "묶여 있음을 스스로 알게 된 상태입니다. 사슬이 느슨하다는 것을 확인한 지금이 풀 수 있는 때입니다."],
  ["The Tower", "탑", "급변과 오해 정리를 의미합니다.", "무너져야 할 것을 붙들어 두는 상태입니다. 미룬 붕괴는 사라지지 않고 이자만 붙습니다."],
  ["The Star", "별", "회복과 희망, 장기적 회복탄력성을 뜻합니다.", "희망이 흐려져 자신을 믿지 못하는 상태입니다. 큰 낙관 대신 오늘 회복되는 작은 것 하나를 세어 보세요."],
  ["The Moon", "달", "감정의 그림자와 직관의 검증을 뜻합니다.", "불안이 실제보다 크게 보이는 상태입니다. 안개가 걷히기 직전이니, 확인된 사실만으로 판단하세요."],
  ["The Sun", "태양", "명료함, 성취감, 회복을 상징합니다.", "다 된 듯한 낙관이 마무리를 늦추는 상태입니다. 성취는 유효하니 마지막 확인만 미루지 마세요."],
  ["Judgement", "심판", "재평가와 복귀의 시점을 나타냅니다.", "지난 일을 자책으로만 되새기는 상태입니다. 평가는 끝내고, 부름에 답할지 말지만 정하세요."],
  ["The World", "세계", "완성, 성취, 다음 단계로의 연결을 의미합니다.", "마지막 한 조각을 남겨 둔 미완성 상태입니다. 90%에서 멈춘 일을 닫아야 다음 판이 열립니다."],
].map(([en, kr, desc, reversedDesc], index) => ({
  code: `MA${String(index).padStart(2, "0")}`,
  sequence: index + 1,
  arcana: "major",
  suit: null,
  name_kr: kr,
  name_en: en,
  rank: en,
  number: index,
  keywords: ["major", "arcana", kr, en],
  meaning_upright: `${kr}${topicParticle(kr)} ${desc}`,
  meaning_reversed: `${kr} 역방향: ${reversedDesc}`,
  image_key: `major-${codeSafe(en)}`,
  is_active: true,
}));

const MINOR_SUITS: Array<{ suit: TarotSuit; name_kr: string; symbol: string; color: string; code: string }> = [
  { suit: "wands", name_kr: "완즈", symbol: "🔥", color: "#f59e0b", code: "WA" },
  { suit: "cups", name_kr: "컵", symbol: "💧", color: "#ec4899", code: "CU" },
  { suit: "swords", name_kr: "소드", symbol: "⚔", color: "#64748b", code: "SW" },
  { suit: "pentacles", name_kr: "펜타클", symbol: "🌾", color: "#22c55e", code: "PE" },
];

const MINOR_RANKS: Array<{ short: string; label_en: string; label_kr: string }> = [
  { short: "A", label_en: "Ace", label_kr: "에이스" },
  { short: "2", label_en: "Two", label_kr: "2" },
  { short: "3", label_en: "Three", label_kr: "3" },
  { short: "4", label_en: "Four", label_kr: "4" },
  { short: "5", label_en: "Five", label_kr: "5" },
  { short: "6", label_en: "Six", label_kr: "6" },
  { short: "7", label_en: "Seven", label_kr: "7" },
  { short: "8", label_en: "Eight", label_kr: "8" },
  { short: "9", label_en: "Nine", label_kr: "9" },
  { short: "10", label_en: "Ten", label_kr: "10" },
  // 코트 카드는 네 장이다. 트럼프(J/Q/K)와 달리 타로에는 기사(Knight)가 있다.
  // 예전에는 J/Q/K 세 장만 있어서 수트마다 13장, 덱 전체가 74장이었다.
  // 78장이어야 하는 덱에서 기사 넉 장이 통째로 빠져 있었다.
  { short: "P", label_en: "Page", label_kr: "시종" },
  { short: "N", label_en: "Knight", label_kr: "기사" },
  { short: "Q", label_en: "Queen", label_kr: "여왕" },
  { short: "K", label_en: "King", label_kr: "왕" },
];

function codeSafe(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/gi, "-");
}

/**
 * 마이너 아르카나 의미.
 *
 * 예전에는 마이너 전부가 같은 문장을 썼다. 역방향은 죄다 "과속, 불균형, 강한
 * 고정관념이 나타나기 쉬운 구간입니다." 였다. 어떤 카드를 뽑아도 결과가
 * 같으니 카드를 뽑는 의미가 없었다.
 *
 * 전통 구조 그대로 수트(어느 영역인가)와 숫자(그 영역의 어느 단계인가)를
 * 조합해 만든다. 4 x 14 = 56장이 서로 다른 문장을 갖는다.
 */
const SUIT_MEANING: Record<TarotSuit, { area: string; verb: string; caution: string }> = {
  wands: { area: "일과 추진력", verb: "밀고 나가는 힘", caution: "서두르다 태우는 에너지" },
  cups: { area: "감정과 관계", verb: "마음을 나누는 힘", caution: "감정에 잠기는 흐름" },
  swords: { area: "생각과 대화", verb: "판단하고 말하는 힘", caution: "말이 앞서 생기는 갈등" },
  pentacles: { area: "돈과 현실", verb: "쌓아 올리는 힘", caution: "손에 쥐려다 굳는 태도" },
};

const RANK_MEANING: Record<string, { up: string; down: string }> = {
  A: { up: "이제 막 씨앗이 심어졌습니다. 작게 시작할수록 잘 자랍니다", down: "시작만 반복하고 뿌리를 못 내리는 중입니다" },
  "2": { up: "둘 사이에서 저울질하는 자리입니다. 고르면 가벼워집니다", down: "결정을 미루는 사이 둘 다 놓치고 있습니다" },
  "3": { up: "혼자보다 같이 할 때 커집니다. 손을 내밀어 보세요", down: "각자 다른 곳을 보고 있어 힘이 흩어집니다" },
  "4": { up: "자리를 잡았습니다. 지킬 것과 놓을 것을 정할 때입니다", down: "안전한 자리에 머무느라 굳어 가고 있습니다" },
  "5": { up: "부딪히고 모자란 구간입니다. 버티는 것 자체가 성과입니다", down: "다툼이 길어져 서로 지치고 있습니다" },
  "6": { up: "고비를 넘겼습니다. 받은 만큼 돌려주면 더 순해집니다", down: "회복이 더뎌 과거를 자꾸 돌아보게 됩니다" },
  "7": { up: "시험대에 섰습니다. 조금만 더 버티면 판이 바뀝니다", down: "혼자 다 지려다 버거워진 상태입니다" },
  "8": { up: "손에 익어 속도가 붙습니다. 지금 흐름을 타세요", down: "빨라진 만큼 놓치는 것이 늘고 있습니다" },
  "9": { up: "거의 다 왔습니다. 마지막 한 걸음이 남았습니다", down: "다 온 줄 알고 힘을 뺀 상태입니다" },
  "10": { up: "한 바퀴를 다 돌았습니다. 매듭짓고 다음을 여세요", down: "혼자 너무 많이 짊어져 넘치고 있습니다" },
  P: { up: "배우는 자리입니다. 서툴러도 해 보는 쪽이 남습니다", down: "재고 따지느라 첫걸음을 못 떼고 있습니다" },
  N: { up: "움직여서 뚫는 자리입니다. 지금은 속도가 무기입니다", down: "방향을 안 정한 채 달려 헛돌고 있습니다" },
  Q: { up: "품어서 다스리는 자리입니다. 사람이 따릅니다", down: "챙기다 지쳐 마음이 굳어 가고 있습니다" },
  K: { up: "판을 쥐고 이끄는 자리입니다. 결정하면 따라옵니다", down: "쥐려는 힘이 세져 주변이 숨 막혀 합니다" },
};

/** 앞 글자에 받침이 있는가. 한글이 아니면 판단하지 않는다 */
export function hasFinalConsonant(word: string): boolean | null {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return null;
  return (code - 0xac00) % 28 !== 0;
}

/** 앞 글자 받침에 따라 을/를 을 고른다 ("태도을" 같은 오타를 막는다) */
export function objectParticle(word: string): string {
  const final = hasFinalConsonant(word);
  return final === false ? "를" : "을";
}

/** 앞 글자 받침에 따라 와/과 를 고른다. 받침이 있으면 "과" ("목와" 방지) */
export function connectiveParticle(word: string): string {
  const final = hasFinalConsonant(word);
  return final === true ? "과" : "와";
}

/**
 * 앞 글자 받침에 따라 은/는 을 고른다.
 *
 * 메이저 22장의 설명이 `${이름}은` 으로 고정돼 있었다. 카드 이름 절반이
 * 받침 없이 끝나서 "마법사은", "악마은", "세계은" 처럼 나왔다.
 */
export function topicParticle(word: string): string {
  const final = hasFinalConsonant(word);
  return final === false ? "는" : "은";
}

function minorUpright(suit: TarotSuit, rank: string, nameKr: string) {
  const s = SUIT_MEANING[suit];
  const r = RANK_MEANING[rank];
  return `${nameKr}: ${s.area}에서 ${r.up}. ${s.verb}이 살아나는 자리입니다.`;
}

function minorReversed(suit: TarotSuit, rank: string, nameKr: string) {
  const s = SUIT_MEANING[suit];
  const r = RANK_MEANING[rank];
  return `${nameKr}(역방향): ${s.area}에서 ${r.down}. ${s.caution}${objectParticle(s.caution)} 먼저 살펴보세요.`;
}

function buildMinorDeck(startSequence: number) {
  const rows: TarotDeckCard[] = [];
  let seq = startSequence;
  MINOR_SUITS.forEach(({ suit, name_kr, code }) => {
    MINOR_RANKS.forEach(({ short, label_en, label_kr }, rankIndex) => {
      const nameKr = `${name_kr} ${label_kr}`;
      const nameEn = `${label_en} of ${suit}`;
      rows.push({
        code: `${code}${String(rankIndex + 1).padStart(2, "0")}-${short}`,
        sequence: seq,
        arcana: "minor",
        suit,
        name_kr: nameKr,
        name_en: nameEn,
        rank: short,
        number: rankIndex + 1,
        keywords: ["minor", suit, short, label_kr],
        meaning_upright: minorUpright(suit, short, nameKr),
        meaning_reversed: minorReversed(suit, short, nameKr),
        image_key: `${suit}-${short.toLowerCase()}`,
        is_active: true,
      });
      seq += 1;
    });
  });
  return rows;
}

const FALLBACK_TAROT_DECK: TarotDeckCard[] = [...MAJOR_ARCANA, ...buildMinorDeck(23)];

const palette = (suit: TarotSuit | null) => {
  if (suit === null) return "#8b5cf6";
  const matched = MINOR_SUITS.find((item) => item.suit === suit);
  return matched?.color ?? "#94a3b8";
};

const iconBySuit = (suit: TarotSuit | null) => {
  if (suit === null) return "🃏";
  const matched = MINOR_SUITS.find((item) => item.suit === suit);
  return matched?.symbol ?? "✨";
};

const arcanaLabel = (card: TarotDeckCard) => {
  if (card.arcana === "major") return "Major Arcana";
  return `Minor Arcana ${card.suit}`;
};

function escapeText(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makeCardSvgImage(card: TarotDeckCard): string {
  const color = palette(card.suit);
  const icon = iconBySuit(card.suit);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 620" role="img" aria-label="${escapeText(card.name_kr)}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="55%" stop-color="${color}"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="400" height="620" rx="24" fill="url(#bg)" stroke="#334155" stroke-width="2"/>
      <rect x="18" y="18" width="364" height="584" rx="18" fill="rgba(15,23,42,0.78)" stroke="${color}" stroke-width="3"/>
      <text x="200" y="66" text-anchor="middle" fill="#e2e8f0" font-size="21" font-family="Arial" font-weight="700">${escapeText(card.name_en)}</text>
      <text x="200" y="108" text-anchor="middle" fill="#f8fafc" font-size="72">${escapeText(icon)}</text>
      <text x="200" y="166" text-anchor="middle" fill="#cbd5e1" font-size="34" font-family="Arial" font-weight="700">${escapeText(card.code)}</text>
      <rect x="52" y="196" width="296" height="2" fill="#475569"/>
      <text x="200" y="244" text-anchor="middle" fill="#e2e8f0" font-size="34" font-family="Arial">${escapeText(card.name_kr)}</text>
      <text x="200" y="290" text-anchor="middle" fill="#94a3b8" font-size="20" font-family="Arial">${escapeText(arcanaLabel(card))}</text>
      <rect x="68" y="336" width="264" height="2" fill="#475569"/>
      <text x="200" y="380" text-anchor="middle" fill="#cbd5e1" font-size="18" font-family="Arial">${escapeText(card.keywords.join(" · "))}</text>
      <text x="34" y="455" fill="#e2e8f0" font-size="20" font-family="Arial">Upright</text>
      <text x="34" y="486" fill="#94a3b8" font-size="14" font-family="Arial">${escapeText(card.meaning_upright)}</text>
      <text x="34" y="540" fill="#fca5a5" font-size="20" font-family="Arial">Reversed</text>
      <text x="34" y="572" fill="#cbd5e1" font-size="14" font-family="Arial">${escapeText(card.meaning_reversed)}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ────────────────────────── 주제·포지션 렌즈 ────────────────────────── */

/**
 * 질문 주제. 카드 의미(위 테이블)는 그대로 두고, 그 의미를 "어느 영역에
 * 적용해 읽을지"만 바꾼다 — 주제별로 새 점괘를 지어내는 것이 아니라
 * 같은 카드 의미의 적용 렌즈만 달라진다는 것이 이 설계의 정직성 규칙이다.
 */
export type TarotTopic = "today" | "love" | "work" | "money";

export const TAROT_TOPICS: Array<{ key: TarotTopic; label: string; frame: string }> = [
  { key: "today", label: "오늘의 흐름", frame: "오늘 하루의 흐름으로 읽으면" },
  { key: "love", label: "연애·관계", frame: "관계의 흐름으로 읽으면" },
  { key: "work", label: "일·커리어", frame: "일과 커리어의 흐름으로 읽으면" },
  { key: "money", label: "돈·재물", frame: "돈과 재물의 흐름으로 읽으면" },
];

/** 과거/현재/미래 포지션이 카드 의미에 붙이는 시간 프레임 */
const POSITION_TAILS = [
  "이 기운은 이미 지나온 자리에 깔려 있습니다. 지금을 만든 배경으로 읽으세요.",
  "지금 한가운데서 작동하고 있는 기운입니다. 현재 선택에 가장 크게 걸립니다.",
  "지금 흐름을 바꾸지 않으면 향하게 되는 방향입니다. 아직 정해진 결과는 아닙니다.",
] as const;

/**
 * 카드 1장의 최종 리딩 문장: 주제 프레임 + 카드 고유 의미(정/역) + 포지션 꼬리.
 * 78장 × 정/역 2 × 포지션 3 × 주제 4 = 1,872 조합이 전부 이 함수를 지나며,
 * tests/logic/tarot-reading.test.ts 가 전수를 검사한다.
 */
export function buildTopicReading(
  card: Pick<DrawnTarotCard, "meaning_upright" | "meaning_reversed" | "isReversed">,
  positionIndex: 0 | 1 | 2,
  topic: TarotTopic,
): string {
  const topicEntry = TAROT_TOPICS.find((entry) => entry.key === topic) ?? TAROT_TOPICS[0];
  const core = card.isReversed ? card.meaning_reversed : card.meaning_upright;
  return `${topicEntry.frame} — ${core} ${POSITION_TAILS[positionIndex]}`;
}

/**
 * 스프레드 전체의 구조적 관찰. 점괘를 새로 만들지 않고, 뽑힌 3장의
 * 구성(수트 지배·메이저 비중·역방향 수)에서 기계적으로 판정 가능한
 * 사실만 문장으로 만든다.
 */
export function describeSpreadPattern(cards: DrawnTarotCard[]): string[] {
  if (!cards.length) return [];
  const notes: string[] = [];

  const suitCounts = new Map<TarotSuit, number>();
  cards.forEach((card) => {
    if (card.suit) suitCounts.set(card.suit, (suitCounts.get(card.suit) ?? 0) + 1);
  });
  for (const [suit, count] of suitCounts) {
    if (count >= 2) {
      const meta = SUIT_MEANING[suit];
      const label = MINOR_SUITS.find((item) => item.suit === suit)?.name_kr ?? suit;
      notes.push(`${label} 카드가 ${count}장 — ${meta.area} 주제가 이 스프레드의 중심입니다.`);
    }
  }

  const majorCount = cards.filter((card) => card.arcana === "major").length;
  if (majorCount >= 2) {
    notes.push(`메이저 아르카나가 ${majorCount}장 — 일상 단위보다 큰, 인생 단위의 흐름이 걸려 있다는 구성입니다.`);
  }

  const reversedCount = cards.filter((card) => card.isReversed).length;
  if (reversedCount >= 2) {
    notes.push(`역방향이 ${reversedCount}장 — 밀어붙이기보다 멈춰서 재정비하라는 신호가 겹쳐 있습니다.`);
  }

  if (!notes.length) {
    notes.push("한쪽으로 쏠린 구성이 아닙니다 — 세 카드를 같은 무게로 읽으면 됩니다.");
  }
  return notes;
}

type DeckFilterOptions = {
  arcana?: TarotArcanaType[];
  suit?: TarotSuit[];
  isActiveOnly?: boolean;
};

export function getTarotDeckRows(options: DeckFilterOptions = {}): TarotDeckCard[] {
  const { arcana, suit, isActiveOnly = true } = options;
  let deck = [...FALLBACK_TAROT_DECK];

  if (arcana?.length) deck = deck.filter((card) => arcana.includes(card.arcana));
  if (suit?.length) deck = deck.filter((card) => card.suit !== null && suit.includes(card.suit));
  if (isActiveOnly) deck = deck.filter((card) => card.is_active);

  return deck.sort((a, b) => a.sequence - b.sequence);
}

export type TarotTheme = "standard" | "svg_fallback";
export const DEFAULT_TAROT_THEME: TarotTheme = "standard";

export function buildTarotDeckCards(theme: TarotTheme = DEFAULT_TAROT_THEME): TarotDeckCardWithImage[] {
  return getTarotDeckRows().map((card) => ({
    ...card,
    imageUrl: card.image_key ? resolveTarotImageUrl(card, theme) : "",
  }));
}

export function pickCardsFromDeck(cards: TarotDeckCard[], count: number, theme: TarotTheme = DEFAULT_TAROT_THEME) {
  const deck = [...cards];
  const selected: DrawnTarotCard[] = [];

  while (selected.length < count && deck.length > 0) {
    const idx = Math.floor(Math.random() * deck.length);
    const chosen = deck[idx];
    deck.splice(idx, 1);
    selected.push({
      ...chosen,
      imageUrl: resolveTarotImageUrl(chosen, theme),
      isReversed: Math.random() < 0.35,
    });
  }

  return selected;
}

export function resolveTarotImageUrl(card: TarotDeckCard, theme: TarotTheme = DEFAULT_TAROT_THEME): string {
  if (theme === "svg_fallback") {
    return makeCardSvgImage(card);
  }
  // 카드 그림은 JPEG 다. 생성 모델이 JPEG 를 돌려주고, 채색 일러스트라
  // 무손실로 둘 이유가 없다. PNG 로 두면 같은 그림이 3배 이상 무겁다.
  // e.g. /tarot-decks/standard/MA00.jpg
  return `/tarot-decks/${theme}/${card.code}.jpg`;
}
