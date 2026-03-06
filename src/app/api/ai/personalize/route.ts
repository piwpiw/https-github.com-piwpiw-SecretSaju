import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedFortune } from '@/lib/ai';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getArchetypeByCode } from '@/lib/archetypes';
import { deductJelly } from '@/lib/wallet-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildCacheKey } from '@/lib/cache';
import { isMockMode } from '@/lib/use-mock';

export const dynamic = 'force-dynamic';

/**
 * [gem-backend] POST /api/ai/personalize
 */
export async function POST(req: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser(req);
        const isMock = isMockMode();

        if (!user && !isMock) {
            return error;
        }

        const body = await req.json();
        const { code, ageGroup, gender } = body;

        if (!code || !ageGroup || !gender) {
            return NextResponse.json({ error: 'Missing code, ageGroup, or gender' }, { status: 400 });
        }

        const archetype = getArchetypeByCode(code, ageGroup);
        if (!archetype) {
            return NextResponse.json({ error: 'Invalid animal code' }, { status: 400 });
        }

        const cacheHash = buildCacheKey(code, ageGroup, gender, 'mini_v1');
        const supabase = getSupabaseAdmin();

        if (supabase && !isMock) {
            const { data: cached, error: cacheError } = await supabase
                .from('ai_responses')
                .select('response_text')
                .eq('request_hash', cacheHash)
                .single();

            if (!cacheError && cached?.response_text) {
                if (!isMock && user) {
                    const deduction = await deductJelly(user.id, 300, `Premium Analysis: ${code}`);
                    if (!deduction.success) {
                        return NextResponse.json(
                            {
                                error: 'Insufficient jellies',
                                code: 'INSUFFICIENT_JELLIES',
                                balance: deduction.currentBalance,
                            },
                            { status: 402 }
                        );
                    }
                }

                return NextResponse.json({ success: true, text: cached.response_text, cached: true });
            }
        }

        const aiText = await generatePersonalizedFortune(
            archetype.animal_name,
            ageGroup,
            gender,
            archetype.base_traits,
            isMock
        );

        if (supabase && !isMock && aiText) {
            await supabase.from('ai_responses').upsert(
                {
                    request_hash: cacheHash,
                    animal_code: code,
                    age_group: ageGroup,
                    gender,
                    response_text: aiText,
                },
                { onConflict: 'request_hash' }
            );
        }

        if (!isMock && user) {
            const deduction = await deductJelly(user.id, 300, `Premium Analysis (Generated): ${code}`);
            if (!deduction.success) {
                return NextResponse.json(
                    {
                        error: 'Insufficient jellies',
                        code: 'INSUFFICIENT_JELLIES',
                        balance: deduction.currentBalance,
                    },
                    { status: 402 }
                );
            }
        }

        return NextResponse.json({ success: true, text: aiText, cached: false });
    } catch (error) {
        console.error('[API/AI] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
