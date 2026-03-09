import { getDayPillar, getHourPillar, Stem, Branch } from "@/core/calendar/ganji";
import { SajuProfile } from "@/lib/app/storage";
import { calculateHighPrecisionSaju } from "@/core/api/saju-engine";
import { Element } from "@/core/myeongni/elements";
import { getTenGodSummary } from "@/lib/saju/terminology";
import { parseCivilDate } from "@/lib/saju/civil-date";

export interface HourlyFlowPoint {
  slot: string;
  score: number;
  direction: "up" | "down" | "stable";
  reason: string;
  drivers: string[];
}

export interface DailyFortuneResult {
  date: string;
  score: number;
  weather: "sunny" | "cloudy" | "rain";
  summary: string;
  love: string;
  wealth: string;
  health: string;
  luckyItems: string[];
  premiumInsight: string;
  hourlyScores: number[];
  hourlyTips: string[];
  hourlyFlow: HourlyFlowPoint[];
}

const DAILY_FLOW_WINDOWS = [
  { slot: "06-09", hour: 6, driverSet: ["오행 조화", "용신 연계"] },
  { slot: "09-12", hour: 9, driverSet: ["지지 연결", "중심 축 강화"] },
  { slot: "12-15", hour: 12, driverSet: ["실행 가속", "리듬 정렬"] },
  { slot: "15-18", hour: 15, driverSet: ["의사결정 구간", "조정 필요"] },
  { slot: "18-21", hour: 18, driverSet: ["회복/확장", "외연 접속"] },
  { slot: "21-00", hour: 21, driverSet: ["정리 구간", "수렴" ] },
];

const DAILY_TIPS_KO = [
  "조용한 시작으로 기운의 기준점을 세우세요.",
  "주변과의 소통 톤을 낮추면 흐름이 빨리 정리됩니다.",
  "중요한 실행은 딱 하나, 우선순위를 줄여 성취를 확보하세요.",
  "긴장 구간은 기록 후 천천히 의사결정하세요.",
  "에너지가 회복되는 시간에는 협력 제안 정리가 유리합니다.",
  "하루 종료 전 복기 10분이 다음 루틴 정확도를 올립니다.",
];

const DAILY_TIPS_EN = [
  "Start quietly and lock an intention before action.",
  "Keep communication calm to reduce friction.",
  "One high-impact action per phase keeps execution stable.",
  "Delay high-stakes decisions in the heavy-pressure window.",
  "Use the wind-down block to coordinate support and handoffs.",
  "Capture one insight at the end of the day for tomorrow.",
];

const LUCKY_POOLS_KO = [
  "청량한 물", "연한 하늘색 옷", "숫자 7", "바람이 부는 곳의 산책", "기념 문구 적기", "노란색 메모", "은색 액세서리", "붉은 계열", "소음 낮추기", "자연광", "따뜻한 차 한 잔", "감사 기록", "느린 호흡",
];

const LUCKY_POOLS_EN = [
  "Clear water", "Soft blue outfit", "Number 7", "Short walk", "Journal prompt", "Yellow note", "Silver accessory", "Warm red accent", "Lower noise", "Natural light", "Warm tea", "Gratitude log", "Slow breathing",
];

const STEM_ELEMENTS: Record<Stem, Element> = {
  갑: "목",
  을: "목",
  병: "화",
  정: "화",
  무: "토",
  기: "토",
  경: "금",
  신: "금",
  임: "수",
  계: "수",
};

const BRANCH_ELEMENTS: Record<Branch, Element> = {
  자: "수",
  축: "토",
  인: "목",
  묘: "목",
  진: "토",
  사: "화",
  오: "화",
  미: "토",
  신: "금",
  유: "금",
  술: "토",
  해: "수",
};

const ELEMENT_GENERATION: Record<Element, Element> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

const ELEMENT_CONTROL: Record<Element, Element> = {
  목: "토",
  화: "금",
  토: "수",
  금: "목",
  수: "화",
};

function pseudoRandom(seed: number): number {
  let v = seed >>> 0;
  v ^= v << 13;
  v ^= v >>> 17;
  v ^= v << 5;
  return v >>> 0;
}

function pick(seed: number, list: string[]): string {
  return list[Math.abs(seed) % list.length];
}

function weatherFromScore(score: number): "sunny" | "cloudy" | "rain" {
  if (score >= 76) return "sunny";
  if (score >= 60) return "cloudy";
  return "rain";
}

function elementDiff(a: Element, b: Element): number {
  return a === b ? 30 : ELEMENT_GENERATION[a] === b ? 15 : ELEMENT_CONTROL[b] === a ? 12 : -8;
}

function relationDrivers(isAligned: boolean, isRisk: boolean, isEvening: boolean): string[] {
  const drivers = ["오행 흐름", "일지 연계", isAligned ? "용신 가점" : "변화성" ];
  if (isRisk) drivers.push("지지 충돌 위험");
  if (isEvening) drivers.push("말미 정리 필요");
  return drivers;
}

function calculateOneSipsong(selfStem: Stem, target: Stem): string {
  const selfElement = STEM_ELEMENTS[selfStem];
  const targetElement = STEM_ELEMENTS[target];
  const samePolarity = ((selfStem === "갑" || selfStem === "병" || selfStem === "무" || selfStem === "경" || selfStem === "임")
    === (target === "갑" || target === "병" || target === "무" || target === "경" || target === "임"));

  if (selfElement === targetElement) return samePolarity ? "정재" : "편재";
  if (ELEMENT_GENERATION[selfElement] === targetElement) return samePolarity ? "식신" : "상관";
  if (ELEMENT_CONTROL[selfElement] === targetElement) return samePolarity ? "편인" : "정인";
  if (ELEMENT_CONTROL[targetElement] === selfElement) return samePolarity ? "정관" : "편관";
  return samePolarity ? "정인" : "편인";
}

export async function generateDailyFortune(profile: SajuProfile, locale: "ko" | "en" = "ko", targetDate: Date = new Date()): Promise<DailyFortuneResult> {
  const baseSeed = `${targetDate.toISOString().slice(0, 10)}|${profile.id}|${profile.birthdate}`;
  const dayIndex = getDayPillar(targetDate).ganjiIndex;
  const seedBase = Array.from(baseSeed).reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 2166136261) >>> 0;

  const todayPillar = getDayPillar(targetDate);
  const todayStem = todayPillar.stem;
  const todayBranch = todayPillar.branch;
  const todayElement = STEM_ELEMENTS[todayStem];

  const birthDate = parseCivilDate(profile.birthdate) ?? new Date(1990, 0, 1, 12, 0, 0, 0);
  const saju = await calculateHighPrecisionSaju({
    birthDate,
    birthTime: profile.birthTime || "12:00",
    gender: profile.gender === "male" ? "M" : "F",
    calendarType: profile.calendarType,
  });

  const selfStem = saju.fourPillars.day.stem;
  const sipsong = calculateOneSipsong(selfStem, todayStem);

  const yongshin = saju.yongshin.primary.element;
  const heeshin = saju.yongshin.secondary.element;
  const kisin = saju.yongshin.unfavorable.element;

  let baseScore = 65;
  if (todayElement === yongshin) baseScore += 12;
  else if (todayElement === heeshin) baseScore += 8;
  else if (todayElement === kisin) baseScore -= 14;

  if (todayBranch === "인" || todayBranch === "묘") baseScore += 2;
  if (todayBranch === "신" || todayBranch === "유") baseScore -= 2;

  const baseFactor = (seedBase % 20) - 10;
  const score = Math.max(45, Math.min(98, baseScore + baseFactor));

  const dateStr = targetDate.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
    month: "long",
    day: "numeric",
    weekday: "long",
    year: locale === "en" ? "numeric" : undefined,
  });

  const summary = getTenGodSummary(sipsong, locale);

  const luckyPool = locale === "ko" ? LUCKY_POOLS_KO : LUCKY_POOLS_EN;
  const luckyItems = [
    luckyPool[(seedBase % luckyPool.length + luckyPool.length) % luckyPool.length],
    luckyPool[(pseudoRandom(seedBase) % luckyPool.length + luckyPool.length) % luckyPool.length],
    luckyPool[(pseudoRandom(seedBase + 55) % luckyPool.length + luckyPool.length) % luckyPool.length],
  ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 3);

  let love = locale === "ko" ? "서로의 감정을 먼저 듣고, 결정을 뒤로 미루면 오해를 줄일 수 있습니다." : "Listening first and deciding second reduces misunderstanding.";
  if (sipsong === "정관" || sipsong === "식신") {
    love = locale === "ko" ? "의견과 표현을 단계적으로 분리하면 관계의 밀도가 안정적으로 형성됩니다." : "Separating expression from judgment improves relational rhythm.";
  }

  let wealth = locale === "ko" ? "지출보다 누적을 우선해 구조화된 소비와 기록을 유지하세요." : "Prioritize preserving capital with structured spending and logs.";
  if (sipsong === "편재" || sipsong === "식신") {
    wealth = locale === "ko" ? "기회 비용을 먼저 계산하면 수익 구간을 빠르게 포착할 수 있습니다." : "Filtering opportunities by cost of effort improves yield.";
  }

  const health = locale === "ko" ? "에너지의 고점과 저점을 기록해 체력 회복 타이밍을 맞추세요." : "Track high and low energy windows and restore intentionally.";

  const hourlyFlow: HourlyFlowPoint[] = DAILY_FLOW_WINDOWS.map((window, index) => {
    const anchor = new Date(targetDate);
    anchor.setHours(window.hour, 0, 0, 0);
    const hourPillar = getHourPillar(anchor, todayPillar.stemIndex);
    const hourEl = STEM_ELEMENTS[hourPillar.stem];
    const branchEl = BRANCH_ELEMENTS[hourPillar.branch];

    let flow = score + (index - 2) * 3;
    const aligned = hourEl === yongshin || branchEl === yongshin;
    const risky = hourEl === kisin || branchEl === kisin;
    const relationBonus = elementDiff(todayElement, hourEl) / 4;
    const dayIndexAdjust = Math.sin((dayIndex + index) / 3) * 6;

    flow += (aligned ? 11 : 0);
    flow -= (risky ? 9 : 0);
    flow += relationBonus;
    flow += Math.round(dayIndexAdjust);

    const drivers = relationDrivers(aligned, risky, index >= 4);

    return {
      slot: window.slot,
      score: Math.max(35, Math.min(99, Math.round(flow))),
      direction: index === 0 ? "stable" : flow >= (score + index - 2) ? "up" : "down",
      reason: locale === "ko"
        ? `${window.driverSet.join(", ")}: ${window.slot} 구간은 ${hourPillar.branch}지지와 ${window.hour}시축으로 ${aligned ? "상향 신호" : "중립~변동"}이 동시 확인됩니다.`
        : `${window.driverSet.join(", ")}: ${window.slot} is a ${aligned ? "supportive" : "neutral-to-volatile"} segment from ${hourPillar.branch} with time anchor ${window.hour}:00.`,
      drivers,
    };
  });

  const hourlyScores = hourlyFlow.map((entry) => entry.score);
  const hourlyTips = hourlyFlow.map((_entry, idx) => (locale === "ko" ? pick(seedBase + idx * 77, DAILY_TIPS_KO) : pick(seedBase + idx * 77, DAILY_TIPS_EN)));

  const premiumInsight = locale === "ko"
    ? `일간 '${todayStem}(${todayElement})'와 용신 '${yongshin}', 피로 요소 '${kisin}'의 상호작용을 기준으로 시간대별 가동 강도를 조절한 결과, '${sipsong}' 패턴에서는 ${hourlyFlow[2].slot}가 핵심 실행 구간으로 보입니다.`
    : `Align with the day stem '${todayStem}(${todayElement})', favorable '${yongshin}', and sensitive factor '${kisin}'. In '${sipsong}' flow, ${hourlyFlow[2].slot} is the main execution window.`;

  return {
    date: dateStr,
    score,
    weather: weatherFromScore(score),
    summary,
    love,
    wealth,
    health,
    luckyItems,
    premiumInsight,
    hourlyScores,
    hourlyTips,
    hourlyFlow,
  };
}
