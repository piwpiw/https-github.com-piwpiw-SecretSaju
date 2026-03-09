/**
 * Phase 2 예측: 추천 API (SSR/Edge에서 사용 시)
 * GET /api/recommendations?code=GAP_JA&ageGroup=20s
 */

import { NextRequest, NextResponse } from "next/server";
import { getFoodRecommendationsByCode } from "@/data/foodRecommendations";
import { getProductRecommendationsByCode } from "@/data/productRecommendations";
import { PILLAR_CODES } from "@/lib/saju";
import { normalizeAgeGroup } from "@/lib/app/validation";
import { getSupabaseAdmin } from "@/lib/integrations/supabase";

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

    const supabase = getSupabaseAdmin();

    // 1. Fetch from DB in parallel
    const [dbFoods, dbProducts, dbCampaigns] = await Promise.all([
      supabase?.from('food_recommendations').select('*').eq('code', code).limit(5),
      supabase?.from('product_recommendations').select('*').eq('code', code).limit(5),
      supabase?.from('campaigns').select('*').eq('is_active', true).limit(10)
    ]);

    // 2. Fallback to static if DB is empty
    let foods = dbFoods?.data && dbFoods.data.length > 0 ? dbFoods.data : getFoodRecommendationsByCode(code, ageGroup);
    let products = dbProducts?.data && dbProducts.data.length > 0 ? dbProducts.data : getProductRecommendationsByCode(code);
    let campaigns = dbCampaigns?.data || [];

    return NextResponse.json({
      foods,
      products,
      campaigns
    });
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

