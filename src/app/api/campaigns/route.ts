import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CampaignRow = {
  id: string;
  source: string;
  title: string;
  landing_url: string | null;
  description: string | null;
  reward_info: string | null;
  category: string | null;
  image_url: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "8");
    const safeLimit = Number.isNaN(limit) ? 8 : Math.min(Math.max(limit, 1), 20);
    const source = request.nextUrl.searchParams.get("source");
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("campaigns")
      .select("id,source,title,landing_url,description,reward_info,category,image_url,is_active,updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(safeLimit);

    if (source && source !== "all") {
      query = query.eq("source", source);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ campaigns: [], error: error.message }, { status: 200 });
    }

    const campaigns = (data || []).map((item: CampaignRow) => ({
      id: item.id,
      source: item.source,
      title: item.title,
      link: item.landing_url || "",
      description: item.description || "",
      reward: item.reward_info || "",
      category: item.category || "",
      imageUrl: item.image_url || "",
      isActive: item.is_active ?? false,
      updatedAt: item.updated_at || "",
    }));

    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json(
      { campaigns: [], error: error instanceof Error ? error.message : "campaigns_fetch_failed" },
      { status: 500 }
    );
  }
}
