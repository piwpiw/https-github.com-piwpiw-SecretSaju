import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedFortune } from '@/lib/ai';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getArchetypeByCode } from '@/lib/archetypes';
import { deductJelly } from '@/lib/wallet-server';
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * [gem-backend] POST /api/ai/personalize
 * 인증된 유저만 젤리를 소모하고 AI 텍스트 생성 API 호출 가능.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Auth Validation (Using the gem-backend optimized pattern)
        const { user, error } = await getAuthenticatedUser(req);
        const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

        if (!user && !isMock) {
            return error;
        }

        // 2. Request Parsing
        const body = await req.json();
        const { code, ageGroup, gender } = body;

        if (!code || !ageGroup || !gender) {
            return NextResponse.json({ error: 'Missing code, ageGroup, or gender' }, { status: 400 });
        }

        // 3. Archetype Fetching
        const archetype = getArchetypeByCode(code, ageGroup);
        if (!archetype) {
            return NextResponse.json({ error: 'Invalid animal code' }, { status: 400 });
        }

        // 4. Token Diet: Caching Layer to Prevent OpenAI Billing Bombs
        const cacheHash = `${code}_${ageGroup}_${gender}_mini_v1`;
        const supabase = getSupabaseAdmin();

        if (supabase && !isMock) {
            const { data: cached } = await supabase
                .from('ai_responses')
                .select('response_text')
                .eq('request_hash', cacheHash)
                .single();

            if (cached?.response_text) {
                console.log(`[AI Cache Hit] Reusing generated text for: ${cacheHash}`);

                // 5. Deduct 300 Jellies (MVP: Always deduct for the premium value)
                if (!isMock && user) {
                    const deduction = await deductJelly(user.id, 300, `Premium Analysis: ${code}`);
                    if (!deduction.success) {
                        return NextResponse.json({
                            error: '젤리가 부족합니다.',
                            code: 'INSUFFICIENT_JELLIES',
                            balance: deduction.currentBalance
                        }, { status: 402 });
                    }
                }

                return NextResponse.json({ success: true, text: cached.response_text, cached: true });
            }
        }

        // 5. OpenAI Generate (Cache Miss or Mock)
        console.log(`[AI Cache Miss] Calling OpenAI for: ${cacheHash}`);
        const aiText = await generatePersonalizedFortune(
            archetype.animal_name,
            ageGroup,
            gender,
            archetype.base_traits,
            isMock
        );

        // 6. Save to Cache
        if (supabase && !isMock && aiText) {
            await supabase.from('ai_responses').upsert({
                request_hash: cacheHash,
                animal_code: code,
                age_group: ageGroup,
                gender: gender,
                response_text: aiText
            }, { onConflict: 'request_hash' });
        }

        // 7. Deduct 300 Jellies for fresh generation
        if (!isMock && user) {
            const deduction = await deductJelly(user.id, 300, `Premium Analysis (Generated): ${code}`);
            if (!deduction.success) {
                return NextResponse.json({
                    error: '젤리가 부족합니다.',
                    code: 'INSUFFICIENT_JELLIES',
                    balance: deduction.currentBalance
                }, { status: 402 });
            }
        }

        return NextResponse.json({ success: true, text: aiText, cached: false });

    } catch (error: any) {
        console.error('[API/AI] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
