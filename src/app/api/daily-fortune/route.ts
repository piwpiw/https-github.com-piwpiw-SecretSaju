import { NextRequest, NextResponse } from "next/server";
import { getDayPillarIndex, getPillarNameKo, getPillarCode } from "@/lib/saju";
import { getSupabaseAdmin } from "@/lib/integrations/supabase";

export const dynamic = "force-dynamic";

type Locale = "en" | "ko";

type FortuneResponse = {
  date: string;
  pillarName: string;
  pillarCode: string;
  pillarIndex: number;
  message: string;
  score: number;
  luckyColor?: string;
  luckyNumber?: number;
  element?: string;
  caution?: string;
  locale: Locale;
};

const DAILY_LINES_KO = [
  "오늘은 새로운 시작의 기운이 살아납니다. 과감한 결단이 좋은 성과로 이어질 수 있습니다.",
  "오늘은 흐름이 안정적입니다. 작은 습관을 정리하면 좋은 기회를 잡습니다.",
  "오늘은 체력과 집중력이 모두 높은 편입니다. 마감 전에 미리 점검하세요.",
  "오늘은 인간관계에서 오해가 생기기 쉬운 날입니다. 말보다 행동으로 신뢰를 쌓으세요.",
  "오늘은 직감이 선명합니다. 감각적으로 판단한 결단이 유리합니다.",
  "오늘은 재정의 변동성이 있습니다. 충동 지출은 잠시 미루세요.",
  "오늘은 변화에 유리한 날입니다. 기존 방식의 고집을 내려놓아 보세요.",
  "오늘은 평소보다 일의 속도가 빨라집니다. 집중이 흐트러지지 않게 관리하세요.",
  "오늘은 피로가 쌓이기 쉬운 하루입니다. 휴식 타임을 의도적으로 확보하세요.",
  "오늘은 창의력이 높은 날입니다. 즉시 기록해 두면 좋은 결과를 만듭니다."
];

const DAILY_LINES_EN = [
  "Today starts fresh. A bold decision can create strong momentum.",
  "Today is stable and manageable. Small habits will bring cleaner results.",
  "Energy and focus are high today. Review your work before submission.",
  "Today can cause misunderstandings in communication. Build trust through consistent actions.",
  "Your intuition is sharp today. Decisions guided by instinct may work best.",
  "Expect some financial fluctuations today. Delay impulsive spending.",
  "A change-friendly day. Let go of one old assumption.",
  "Work pace can be faster than usual. Stay focused and maintain rhythm.",
  "Fatigue may build up. Put short breaks into your schedule on purpose.",
  "Creative energy is high. Write down ideas immediately."
];

const FORTUNE_ELEMENTS_KO = ["木", "火", "土", "金", "水"];
const FORTUNE_ELEMENTS_EN = ["Wood", "Fire", "Earth", "Metal", "Water"];
const LUCKY_COLORS_KO = ["청록", "보라", "연두", "분홍", "금빛"];
const LUCKY_COLORS_EN = ["Teal", "Purple", "Olive", "Rose", "Gold"];
const LUCKY_NUMBERS = [1, 3, 5, 7, 8, 9, 2, 4, 6, 0];

const CAUTION_MESSAGES_KO = [
  "불필요한 충돌을 피하고 말조심이 필요한 날입니다.",
  "과로를 조심하세요. 쉬는 시간 없이 밀어붙이면 컨디션이 떨어집니다.",
  "중요한 결정은 감정이 격해질 때는 미루는 편이 좋습니다.",
  "인간관계에서 약속 시간은 지키세요. 작은 무시는 오해를 키웁니다.",
  "자칫 지출이 늘기 쉬운 날입니다. 지갑을 먼저 열기 전에 10초만 멈춰보세요.",
  "감정 기복이 클 수 있으니 수면을 충분히 취하세요."
];

const CAUTION_MESSAGES_EN = [
  "Speak carefully to avoid unnecessary conflicts.",
  "Watch for burnout; pacing is your advantage today.",
  "Delay major decisions if emotions are high.",
  "Keep your promises in relationships to avoid misunderstandings.",
  "This can be a spending-heavy day. Pause before spending.",
  "Watch emotional swings and prioritize sleep."
];

function parseLocale(raw: string | null): Locale {
  return raw === "en" ? "en" : "ko";
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fallbackScore(date: Date): number {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const hash = ((seed * 2654435761) ^ (seed >> 16)) >>> 0;
  return (hash % 71) + 28;
}

function fallbackFortune(date: Date, pillarIndex: number, locale: Locale): {
  message: string;
  score: number;
  luckyColor: string;
  luckyNumber: number;
  element: string;
  caution: string;
} {
  const lineIndex = Math.max(0, Math.min(pillarIndex, DAILY_LINES_KO.length - 1)) % DAILY_LINES_KO.length;
  const lines = locale === "en" ? DAILY_LINES_EN : DAILY_LINES_KO;
  const elements = locale === "en" ? FORTUNE_ELEMENTS_EN : FORTUNE_ELEMENTS_KO;
  const colors = locale === "en" ? LUCKY_COLORS_EN : LUCKY_COLORS_KO;
  const cautions = locale === "en" ? CAUTION_MESSAGES_EN : CAUTION_MESSAGES_KO;

  return {
    message: lines[lineIndex] ?? lines[0],
    score: fallbackScore(date),
    luckyColor: colors[date.getMonth() % colors.length],
    luckyNumber: LUCKY_NUMBERS[date.getDate() % LUCKY_NUMBERS.length],
    element: elements[date.getDate() % elements.length],
    caution: cautions[date.getDate() % cautions.length],
  };
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const locale = parseLocale(query.get("locale"));
    const dateParam = query.get("date");
    const targetDate = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();

    if (Number.isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date. Use YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    const todayStr = toDateString(targetDate);
    const pillarIndex = getDayPillarIndex(targetDate);
    const pillarName = getPillarNameKo(pillarIndex);
    const pillarCode = getPillarCode(pillarIndex);
    const fallback = fallbackFortune(targetDate, pillarIndex, locale);

    let response: FortuneResponse = {
      date: todayStr,
      pillarName,
      pillarCode,
      pillarIndex,
      message: fallback.message,
      score: fallback.score,
      luckyColor: fallback.luckyColor,
      luckyNumber: fallback.luckyNumber,
      element: fallback.element,
      caution: fallback.caution,
      locale,
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: dbFortune, error } = await supabase
        .from("daily_fortunes")
        .select("*")
        .eq("pillar_code", pillarCode)
        .eq("fortune_date", todayStr)
        .single();

      if (!error && dbFortune) {
        response = {
          ...response,
          message: dbFortune.message || response.message,
          score:
            typeof dbFortune.score === "number" && Number.isFinite(dbFortune.score)
              ? dbFortune.score
              : response.score,
          luckyColor: dbFortune.lucky_color || response.luckyColor,
          luckyNumber: dbFortune.lucky_number ?? response.luckyNumber,
          element: (dbFortune.element as string | undefined) || response.element,
          caution: (dbFortune.caution as string | undefined) || response.caution,
        };
      }
    }

    response.score = Math.min(99, Math.max(20, Number(response.score || 20)));

    return NextResponse.json(response);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[api/daily-fortune]", err);
    }
    return NextResponse.json(
      { error: "Daily fortune failed" },
      { status: 500 }
    );
  }
}
