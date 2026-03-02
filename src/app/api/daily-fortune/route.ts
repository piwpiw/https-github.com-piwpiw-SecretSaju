/**
 * Phase 2 예측: 오늘의 개소리 (매일 자정 업데이트)
 * GET /api/daily-fortune → 오늘 날짜 기준 일주 인덱스로 한 줄 예언
 */

import { NextRequest, NextResponse } from "next/server";
import { getDayPillarIndex, getPillarNameKo, getPillarCode } from "@/lib/saju";
import { getSupabaseAdmin } from "@/lib/supabase";

const DAILY_LINES: string[] = [
  "오늘은 팀장님 눈 피해라. 물린다.",
  "오늘은 말 조심. 입만 열면 다 남의 일로 들림.",
  "오늘은 재물운 상승. 소액이라도 모아두기.",
  "오늘은 감정 기복 큼. 중요한 결정은 내일로.",
  "오늘은 인연의 날. 오래 끊긴 사람 연락 올 수 있음.",
  "오늘은 몸 챙기기. 무리하지 말 것.",
  "오늘은 독서/공부운. 한 줄이라도 읽어두기.",
  "오늘은 외출보다 집이 나음.",
  "오늘은 말 한마디가 인연을 바꿈. 부드럽게.",
  "오늘은 돈 쓰는 걸 멈추면 이득.",
];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const pillarIndex = getDayPillarIndex(today);
    const pillarName = getPillarNameKo(pillarIndex);
    const pillarCode = getPillarCode(pillarIndex);

    // 1. Try to fetch from DB
    const supabase = getSupabaseAdmin();
    let message = "";
    let score = null;

    if (supabase) {
      const { data: dbFortune } = await supabase
        .from('daily_fortunes')
        .select('*')
        .eq('pillar_code', pillarCode)
        .eq('fortune_date', todayStr)
        .single();

      if (dbFortune) {
        message = dbFortune.message;
        score = dbFortune.score;
      }
    }

    // 2. Fallback to hardcoded logic if no DB entry
    if (!message) {
      const lineIndex = Math.max(0, Math.min(pillarIndex, DAILY_LINES.length - 1)) % DAILY_LINES.length;
      message = DAILY_LINES[lineIndex] ?? DAILY_LINES[0];
    }

    return NextResponse.json({
      date: todayStr,
      pillarName,
      pillarCode,
      message,
      score,
      pillarIndex
    });
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
