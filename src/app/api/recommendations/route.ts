/**
 * Phase 2 예측: 추천 API (SSR/Edge에서 사용 시)
 * GET /api/recommendations?code=GAP_JA&ageGroup=20s
 */

import { NextRequest, NextResponse } from "next/server";
import { getFoodRecommendationsByCode } from "@/data/foodRecommendations";
import { getProductRecommendationsByCode } from "@/data/productRecommendations";
import { PILLAR_CODES } from "@/lib/saju";
import { normalizeAgeGroup } from "@/lib/validation";

export type AgeGroup = "10s" | "20s" | "30s";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const ageGroupParam = request.nextUrl.searchParams.get("ageGroup");
    const ageGroup = normalizeAgeGroup(ageGroupParam);

    if (!code || !PILLAR_CODES.includes(code)) {
      return NextResponse.json(
        { error: "Invalid or missing code" },
        { status: 400 }
      );
    }

    const foods = getFoodRecommendationsByCode(code, ageGroup);
    const products = getProductRecommendationsByCode(code);

    return NextResponse.json({ foods, products });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[api/recommendations]", err);
    }
    return NextResponse.json(
      { error: "Recommendations failed" },
      { status: 500 }
    );
  }
}
