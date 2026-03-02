/**
 * src/app/api/referral/generate/route.ts
 * Referral Code Generation API
 *
 * POST /api/referral/generate
 * Body: { userId: string }
 * Returns: { code: string, referralUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { APP_CONFIG } from '@/config';

function generateCode(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body as { userId?: string };

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Check if user already has a referral code
        const { data: existing } = await supabase
            .from('referral_codes')
            .select('code')
            .eq('user_id', userId)
            .single();

        const baseUrl = APP_CONFIG.BASE_URL || 'https://secretsaju.example.com';
        if (existing?.code) {
            const referralUrl = `${baseUrl}/join?ref=${existing.code}`;
            return NextResponse.json({ code: existing.code, referralUrl });
        }

        // Generate a unique code
        let code = generateCode();
        let attempts = 0;
        while (attempts < 5) {
            const { data: conflict } = await supabase
                .from('referral_codes')
                .select('code')
                .eq('code', code)
                .single();

            if (!conflict) break;
            code = generateCode();
            attempts++;
        }

        // Upsert the code
        await supabase.from('referral_codes').upsert({
            user_id: userId,
            code,
            created_at: new Date().toISOString(),
            total_redeemed: 0,
        }, { onConflict: 'user_id' });

        const referralUrl = `${baseUrl}/join?ref=${code}`;
        return NextResponse.json({ code, referralUrl });
    } catch (error) {
        console.error('[referral/generate]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
