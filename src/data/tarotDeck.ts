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

const MAJOR_ARCANA: TarotDeckCard[] = [
  ["The Fool", "愚者", "새로운 시작과 순수함, 낙관적인 모험을 상징합니다."],
  ["The Magician", "마법사", "잠재력의 발현과 집중, 기술의 실천을 상징합니다."],
  ["The High Priestess", "여사제", "직관과 숨은 정보의 인식을 의미합니다."],
  ["The Empress", "여황제", "풍요·돌봄·성장 에너지를 나타냅니다."],
  ["The Emperor", "황제", "규칙, 구조, 권위를 상징합니다."],
  ["The Hierophant", "교황", "전통, 가르침, 의식을 의미합니다."],
  ["The Lovers", "연인", "선택과 관계의 균형을 뜻합니다."],
  ["The Chariot", "전차", "통제, 결심, 전환점을 의미합니다."],
  ["Strength", "힘", "억제된 힘과 내면의 용기를 뜻합니다."],
  ["The Hermit", "은둔자", "고독한 성찰과 내면 탐색을 상징합니다."],
  ["Wheel of Fortune", "운명의 수레바퀴", "순환과 변화를 나타냅니다."],
  ["Justice", "정의", "균형, 공정성, 결정의 책임을 의미합니다."],
  ["The Hanged Man", "매달린 남자", "일시적 유예와 전환적 시야를 뜻합니다."],
  ["Death", "죽음", "종결이 아닌 전이를 의미합니다."],
  ["Temperance", "절제", "균형 조절과 조율을 상징합니다."],
  ["The Devil", "악마", "집착, 유혹, 강박을 경고합니다."],
  ["The Tower", "탑", "급변과 오해 정리를 의미합니다."],
  ["The Star", "별", "회복과 희망, 장기적 회복탄력성을 뜻합니다."],
  ["The Moon", "달", "감정의 그림자와 직관의 검증을 뜻합니다."],
  ["The Sun", "태양", "명료함, 성취감, 회복을 상징합니다."],
  ["Judgement", "심판", "재평가와 복귀의 시점을 나타냅니다."],
  ["The World", "세계", "완성, 성취, 다음 단계로의 연결을 의미합니다."],
].map(([en, kr, desc], index) => ({
  code: `MA${String(index).padStart(2, "0")}`,
  sequence: index + 1,
  arcana: "major",
  suit: null,
  name_kr: kr,
  name_en: en,
  rank: en,
  number: index,
  keywords: ["major", "arcana", kr, en],
  meaning_upright: `${kr}은 ${desc}`,
  meaning_reversed: `${kr}의 정반대 축인 회피와 지연을 경계하세요. 느려지는 지점에서 리듬을 조절하세요.`,
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
  { short: "J", label_en: "Page", label_kr: "시종" },
  { short: "Q", label_en: "Queen", label_kr: "퀸" },
  { short: "K", label_en: "King", label_kr: "킹" },
];

function codeSafe(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/gi, "-");
}

/**
 * 마이너 아르카나 의미.
 *
 * 예전에는 52장이 전부 같은 문장을 썼다. 역방향은 죄다 "과속, 불균형, 강한
 * 고정관념이 나타나기 쉬운 구간입니다." 였다. 어떤 카드를 뽑아도 결과가
 * 같으니 카드를 뽑는 의미가 없었다.
 *
 * 전통 구조 그대로 수트(어느 영역인가)와 숫자(그 영역의 어느 단계인가)를
 * 조합해 만든다. 4 x 13 = 52장이 서로 다른 문장을 갖는다.
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
  J: { up: "배우는 자리입니다. 서툴러도 해 보는 쪽이 남습니다", down: "재고 따지느라 첫걸음을 못 떼고 있습니다" },
  Q: { up: "품어서 다스리는 자리입니다. 사람이 따릅니다", down: "챙기다 지쳐 마음이 굳어 가고 있습니다" },
  K: { up: "판을 쥐고 이끄는 자리입니다. 결정하면 따라옵니다", down: "쥐려는 힘이 세져 주변이 숨 막혀 합니다" },
};

/** 앞 글자 받침에 따라 을/를 을 고른다 ("태도을" 같은 오타를 막는다) */
function objectParticle(word: string): string {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "을";
  return (code - 0xac00) % 28 === 0 ? "를" : "을";
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
  // Standard and other themes use static files in the public directory
  // e.g. /tarot-decks/standard/MA00.png
  return `/tarot-decks/${theme}/${card.code}.png`;
}
