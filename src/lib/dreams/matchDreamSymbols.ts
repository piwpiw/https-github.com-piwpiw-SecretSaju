/**
 * matchDreamSymbols.ts
 * 꿈 본문에서 사전(dreamDictionary) 상징을 추출하는 순수 로직.
 * React/DOM 의존 없음 — vitest.logic 에서 직접 테스트한다.
 *
 * 오매칭 방지 전략
 *  1) 긴 별칭 우선: 별칭을 (길이 내림차순, 항목 weight 내림차순)으로 정렬해 스캔한다.
 *     예) "물고기"가 먼저 소비되므로 "물"이 같은 글자를 재사용하지 못한다.
 *  2) 구간 소비: 매칭된 글자 인덱스는 소비 처리되어 다른 별칭이 재사용할 수 없다.
 *  3) 1글자 별칭 문맥 규칙: 앞 글자가 한글 음절이면 차단(예: "선물"의 "물"),
 *     뒤 글자는 문장 끝·비한글이거나 조사 허용 목록에 있어야 한다(예: "물이", "물을").
 */

import {
  DREAM_DICTIONARY,
  DreamCategory,
  DreamSymbolEntry,
} from '@/data/dreamDictionary';

export interface DreamMatch {
  symbol: string;
  category: DreamCategory;
  meaning: string;
  advice: string;
  weight: number;
  /** 본문에서 실제로 걸린 별칭들 */
  matchedAliases: string[];
  /** 본문 내 최초 등장 위치 (동점 정렬용) */
  firstIndex: number;
}

export interface DreamMatchResult {
  matched: boolean;
  /** weight 내림차순 상위 MAX_MATCHES개 */
  matches: DreamMatch[];
  /** 상징 조합 해석 (예: 돼지+돈 = 재물 강조) */
  comboInsights: string[];
  /** 미매칭 시 정직한 안내 문구 */
  fallbackMessage?: string;
  /** 종합 조언 한 단락 */
  generalAdvice: string;
}

export const MAX_MATCHES = 3;

/** 1글자 별칭 뒤에 허용되는 조사·의존 형태의 첫 글자 */
const SINGLE_CHAR_NEXT_ALLOWED = new Set([
  '이',
  '가',
  '을',
  '를',
  '은',
  '는',
  '에',
  '도',
  '과',
  '와',
  '의',
  '속',
  // 도구격·한정 조사 — "칼로 베는", "물만 마시는". 조사 뒤 한글 연속
  // 차단 규칙이 함께 있어 "칼로리" 같은 복합어는 걸리지 않는다.
  '로',
  '만',
]);

const HANGUL_SYLLABLE = /[가-힣]/;

interface AliasRef {
  alias: string;
  entry: DreamSymbolEntry;
}

/** 별칭을 길이 내림차순 → weight 내림차순으로 정렬한 전역 목록 (모듈 로드 시 1회 구성) */
const SORTED_ALIASES: AliasRef[] = DREAM_DICTIONARY.flatMap((entry) =>
  entry.aliases.map((alias) => ({ alias, entry }))
).sort((a, b) => {
  if (b.alias.length !== a.alias.length) return b.alias.length - a.alias.length;
  return b.entry.weight - a.entry.weight;
});

function isSingleCharContextOk(text: string, index: number, alias: string): boolean {
  if (alias.length > 1) return true;
  const prev = index > 0 ? text[index - 1] : '';
  // 앞 글자가 한글 음절이면 단어 내부일 가능성이 높다 → 차단 ("선물"의 "물")
  if (prev && HANGUL_SYLLABLE.test(prev)) return false;
  const next = index + alias.length < text.length ? text[index + alias.length] : '';
  // 문장 끝 또는 비한글(공백·문장부호)이면 단독 단어로 본다 ("맑은 물 이었다")
  if (!next || !HANGUL_SYLLABLE.test(next)) return true;
  // 한글이 이어지면 조사 허용 목록에 있을 때만 매칭 ("물이", "물을")
  if (!SINGLE_CHAR_NEXT_ALLOWED.has(next)) return false;
  // 조사 뒤에 또 한글이 붙으면 조사가 아니라 복합어의 일부일 가능성이 높다
  // ("돈가스"의 '가', "별의별"의 '의'). 조사는 어절 끝에서 끝나야 한다.
  const afterParticle = index + alias.length + 1 < text.length ? text[index + alias.length + 1] : '';
  return !afterParticle || !HANGUL_SYLLABLE.test(afterParticle);
}

/** 상징 조합 해석 규칙 — 두 상징이 함께 매칭되면 문구를 추가한다 */
const COMBO_RULES: { pair: [string, string]; insight: string }[] = [
  {
    pair: ['돼지', '돈'],
    insight:
      '돼지와 돈이 함께 등장했습니다. 전통 해몽에서 재물운이 겹으로 강조되는 조합으로, 금전 관련 결정에 특히 주목할 시기로 읽습니다.',
  },
  {
    pair: ['돼지', '똥'],
    insight:
      '돼지와 똥의 조합은 전통 해몽의 대표적인 재물 강세 신호로 읽습니다. 뜻밖의 수입이나 좋은 거래 소식을 기대해볼 만합니다.',
  },
  {
    pair: ['용', '하늘'],
    insight:
      '용이 하늘과 함께 나타났습니다. 전통적으로 등용문·승천의 구도로, 오래 준비한 일이 공식적으로 인정받는 큰 성취의 조합으로 읽습니다.',
  },
  {
    pair: ['용', '비행'],
    insight:
      '용과 비상의 조합입니다. 전통적으로 도약과 출세의 기운이 겹치는 구도로, 활동 무대가 한 단계 넓어진다는 신호로 읽습니다.',
  },
  {
    pair: ['죽음', '아기'],
    insight:
      '죽음과 아기가 함께 등장했습니다. 낡은 국면의 완결과 새 생명의 시작이 겹치는, 전통 해몽에서 가장 뚜렷한 "완전한 재출발"의 조합으로 읽습니다.',
  },
  {
    pair: ['물', '물고기'],
    insight:
      '물과 물고기의 조합은 전통적으로 재물이 흐르고 기회가 헤엄쳐 들어오는 구도로 읽습니다. 흐름을 타는 판단이 유리한 시기입니다.',
  },
  {
    pair: ['이빨 빠짐', '피'],
    insight:
      '이가 빠지며 피가 나는 조합은 전통 해몽에서 손실 뒤에 재물이 따라붙는 구도로 읽어, 흉몽의 기운이 상당 부분 상쇄된다고 봅니다.',
  },
  {
    pair: ['뱀', '아기'],
    insight:
      '뱀과 아기의 조합은 전통적으로 태몽의 가능성을 강하게 시사하는 구도로 읽습니다. 새 인연이나 새 프로젝트의 잉태로도 해석됩니다.',
  },
  {
    pair: ['호랑이', '아기'],
    insight:
      '호랑이와 아기의 조합은 전통 해몽에서 기개 있는 자손·성과를 예고하는 태몽 구도로 읽습니다.',
  },
  {
    pair: ['불', '집'],
    insight:
      '집에 불이 나는 조합은 전통 해몽에서 집안과 사업이 활활 일어나는 번창의 신호로 읽습니다.',
  },
  {
    pair: ['배(선박)', '폭풍'],
    insight:
      '폭풍 속에서 배를 모는 조합입니다. 전통 해몽에서 시련의 한복판을 통과하는 항해 구도로, 버텨내면 큰 전환과 성취가 따른다는 신호로 읽습니다.',
  },
  {
    pair: ['강(江)', '배(선박)'],
    insight:
      '강을 배로 건너는 조합은 전통적으로 인생의 큰 전환을 순조롭게 통과하는 구도로 읽습니다. 재물의 흐름을 타고 다음 단계로 넘어간다는 신호입니다.',
  },
  {
    pair: ['쌀밥', '두꺼비'],
    insight:
      '쌀과 두꺼비가 함께 등장했습니다. 전통 해몽에서 곳간이 차오르는 대표적 재물 조합으로, 살림의 기반이 든든해지는 신호로 읽습니다.',
  },
  {
    pair: ['거울', '옛 연인'],
    insight:
      '거울과 옛 연인의 조합은 과거의 관계를 통해 지금의 나를 비춰보는 구도로 읽습니다. 미련보다는 정리와 성찰의 신호로 해석됩니다.',
  },
  {
    pair: ['옛 연인', '키스'],
    insight:
      '옛 연인과의 입맞춤 조합은 전통적으로 지나간 인연보다 그 시절의 나에 대한 그리움이 비친 장면으로 읽습니다. 재회의 예고보다 현재 관계를 점검하라는 신호로 해석됩니다.',
  },
  {
    pair: ['병원', '목욕'],
    insight:
      '병원과 씻는 장면의 조합은 몸과 마음의 회복·정화가 함께 진행되는 구도로 읽습니다. 쉼과 치유에 시간을 내라는 신호입니다.',
  },
  {
    pair: ['곰', '아기'],
    insight:
      '곰과 아기의 조합은 전통 해몽에서 우직하고 건강한 자손·성과를 예고하는 태몽 구도로 읽습니다.',
  },
];

const FALLBACK_MESSAGE =
  '입력하신 내용에서 사전에 등록된 상징을 찾지 못했습니다. 없는 상징을 억지로 붙이는 대신, 꿈의 장면·감정·색·인물 등을 조금 더 구체적으로 적어 주시면 다시 분석해 드립니다.';

const FALLBACK_ADVICE =
  '상징이 뚜렷하지 않은 꿈은 대개 하루의 잔상 정리에 가깝습니다. 가장 선명했던 장면 하나와 그때의 감정 하나만 기록해 두면, 반복되는 신호를 잡는 데 큰 도움이 됩니다.';

function buildGeneralAdvice(matches: DreamMatch[]): string {
  const categories = Array.from(new Set(matches.map((m) => m.category)));
  const lead = `이번 꿈에서는 ${matches.map((m) => m.symbol).join(', ')} 상징이 두드러집니다.`;
  const tone = `${categories.join('·')} 기운이 중심이니, ${matches[0].advice}`;
  return `${lead} ${tone}`;
}

/**
 * 꿈 본문에서 사전 상징을 추출한다.
 * - 긴 별칭 우선 + 구간 소비 + 1글자 문맥 규칙으로 오매칭을 막는다.
 * - weight 내림차순(동점: 먼저 등장한 순) 상위 MAX_MATCHES개를 반환한다.
 */
export function matchDreamSymbols(rawText: string): DreamMatchResult {
  const text = (rawText ?? '').trim();
  if (!text) {
    return {
      matched: false,
      matches: [],
      comboInsights: [],
      fallbackMessage: FALLBACK_MESSAGE,
      generalAdvice: FALLBACK_ADVICE,
    };
  }

  const consumed = new Array<boolean>(text.length).fill(false);
  const found = new Map<string, DreamMatch>();

  for (const { alias, entry } of SORTED_ALIASES) {
    let from = 0;
    while (from <= text.length - alias.length) {
      const idx = text.indexOf(alias, from);
      if (idx === -1) break;
      from = idx + 1;

      // 이미 소비된 글자와 겹치면 재사용 금지
      let overlaps = false;
      for (let i = idx; i < idx + alias.length; i += 1) {
        if (consumed[i]) {
          overlaps = true;
          break;
        }
      }
      if (overlaps) continue;

      if (!isSingleCharContextOk(text, idx, alias)) continue;

      for (let i = idx; i < idx + alias.length; i += 1) consumed[i] = true;

      const existing = found.get(entry.symbol);
      if (existing) {
        if (!existing.matchedAliases.includes(alias)) existing.matchedAliases.push(alias);
        existing.firstIndex = Math.min(existing.firstIndex, idx);
      } else {
        found.set(entry.symbol, {
          symbol: entry.symbol,
          category: entry.category,
          meaning: entry.meaning,
          advice: entry.advice,
          weight: entry.weight,
          matchedAliases: [alias],
          firstIndex: idx,
        });
      }
      from = idx + alias.length;
    }
  }

  const ranked = Array.from(found.values()).sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.firstIndex - b.firstIndex;
  });

  const matches = ranked.slice(0, MAX_MATCHES);

  if (matches.length === 0) {
    return {
      matched: false,
      matches: [],
      comboInsights: [],
      fallbackMessage: FALLBACK_MESSAGE,
      generalAdvice: FALLBACK_ADVICE,
    };
  }

  // 조합 판정은 표시 상위 3개가 아니라 **매칭된 전체 상징** 기준이다.
  // top-3 로 자르면 사전이 커질수록 고가중치 상징에 밀려 조합 멤버가
  // 3위 밖으로 빠지고, 조합 해석이 조용히 사라진다.
  const symbolSet = new Set(found.keys());
  const comboInsights = COMBO_RULES.filter(
    ({ pair }) => symbolSet.has(pair[0]) && symbolSet.has(pair[1])
  ).map(({ insight }) => insight);

  return {
    matched: true,
    matches,
    comboInsights,
    generalAdvice: buildGeneralAdvice(matches),
  };
}

export default matchDreamSymbols;
