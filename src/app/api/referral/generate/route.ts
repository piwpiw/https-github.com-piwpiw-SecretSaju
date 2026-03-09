/**
 * src/app/api/referral/generate/route.ts
 * Referral Code Generation API
 *
 * POST /api/referral/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/config';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { generateReferralCode, REFERRAL_REWARDS } from '@/lib/referral/referrals';

function buildReferralUrl(referralCode: string) {
    const baseUrl = APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://secretsaju.example.com';
    return `${baseUrl}/?ref=${encodeURIComponent(referralCode)}`;
}

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();
        const authResult = await getAuthenticatedUser(req);
        if (authResult.error) {
            return authResult.error;
        }

        const userId = authResult.user.id;

        // Return existing code when available
        const { data: existing, error: existingError } = await supabase
            .from('referrals')
            .select('referral_code')
            .eq('referrer_user_id', userId)
            .limit(1)
            .single();

        if (existingError && existingError.code !== 'PGRST116') {
            console.error('[referral/generate] Failed to check existing referral:', existingError);
            return NextResponse.json({ error: 'Failed to check existing referral code' }, { status: 500 });
        }

        if (existing?.referral_code) {
            return NextResponse.json({
                code: existing.referral_code,
                referral_code: existing.referral_code,
                referralUrl: buildReferralUrl(existing.referral_code),
                already_exists: true,
            });
        }

        let referralCode = '';
        let insertData = null;

        for (let attempts = 0; attempts < 10; attempts++) {
            const candidate = generateReferralCode();
            const { data: duplicate, error: duplicateError } = await supabase
                .from('referrals')
                .select('id')
                .eq('referral_code', candidate)
                .single();

            if (duplicateError && duplicateError.code !== 'PGRST116') {
                console.error('[referral/generate] Failed to check duplicate code:', duplicateError);
                return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
            }

            if (duplicate) {
                continue;
            }

            const { data: created, error: createError } = await supabase
                .from('referrals')
                .insert({
                    referrer_user_id: userId,
                    referral_code: candidate,
                    referrer_reward_jellies: REFERRAL_REWARDS.REFERRER,
                    referred_reward_jellies: REFERRAL_REWARDS.REFERRED,
                })
                .select('referral_code')
                .single();

            if (createError) {
                if (createError.code === '23505') {
                    continue;
                }

                console.error('[referral/generate] Failed to create referral:', createError);
                return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
            }

            referralCode = created?.referral_code || candidate;
            insertData = created;
            break;
        }

        if (!referralCode) {
            return NextResponse.json({ error: 'Failed to generate unique referral code' }, { status: 500 });
        }

        return NextResponse.json({
            code: referralCode,
            referral_code: referralCode,
            referralUrl: buildReferralUrl(referralCode),
            reward_jellies: REFERRAL_REWARDS.REFERRED,
            already_exists: false,
            referral: insertData,
        });
    } catch (error) {
        console.error('[referral/generate]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
