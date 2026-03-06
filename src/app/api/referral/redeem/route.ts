/**
 * src/app/api/referral/redeem/route.ts
 * Referral Code Redemption API
 *
 * POST /api/referral/redeem
 * Body: { code?: string, referral_code?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { REFERRAL_REWARDS } from '@/lib/referrals';

const normalizeReferralCode = (value: string) => value.trim().toUpperCase();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, referral_code } = body as { code?: string; referral_code?: string };
        const rawCode = code ?? referral_code;

        if (!rawCode) {
            return NextResponse.json({ error: 'code is required' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        const authResult = await getAuthenticatedUser(req);
        if (authResult.error) {
            return authResult.error;
        }

        const newUserId = authResult.user.id;
        const normalizedCode = normalizeReferralCode(rawCode);

        // Find referral record by code
        const { data: referral, error: referralError } = await supabase
            .from('referrals')
            .select('*')
            .eq('referral_code', normalizedCode)
            .single();

        if (referralError) {
            if (referralError.code === 'PGRST116') {
                return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
            }

            console.error('[referral/redeem] Failed to find referral:', referralError);
            return NextResponse.json({ error: 'Failed to lookup referral code' }, { status: 500 });
        }

        if (!referral) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        // Prevent user from redeeming more than one referral code
        const { data: existingClaim, error: existingClaimError } = await supabase
            .from('referrals')
            .select('id')
            .eq('referred_user_id', newUserId)
            .limit(1)
            .single();

        if (existingClaimError && existingClaimError.code !== 'PGRST116') {
            console.error('[referral/redeem] Failed to check existing redemption:', existingClaimError);
            return NextResponse.json({ error: 'Failed to verify referral claim status' }, { status: 500 });
        }

        if (existingClaim) {
            return NextResponse.json({ error: 'User has already redeemed a referral code' }, { status: 409 });
        }

        // Prevent duplicate redemption
        if (referral.reward_claimed) {
            return NextResponse.json({ error: 'User has already redeemed a referral code' }, { status: 409 });
        }

        // Prevent self-referral
        if (referral.referrer_user_id === newUserId) {
            return NextResponse.json({ error: 'Cannot redeem your own referral code' }, { status: 400 });
        }

        const inviterReward = Number(referral.referrer_reward_jellies || REFERRAL_REWARDS.REFERRER);
        const referredReward = Number(referral.referred_reward_jellies || REFERRAL_REWARDS.REFERRED);
        const now = new Date().toISOString();

        const { error: updateError } = await supabase
            .from('referrals')
            .update({
                referred_user_id: newUserId,
                reward_claimed: true,
                claimed_at: now,
            })
            .eq('id', referral.id);

        if (updateError) {
            console.error('[referral/redeem] Failed to mark referral:', updateError);
            return NextResponse.json({ error: 'Failed to redeem referral code' }, { status: 500 });
        }

        // Award jellies to referrer
        const { data: inviterWallet } = await supabase
            .from('jelly_wallets')
            .select('balance')
            .eq('user_id', referral.referrer_user_id)
            .single();

        if (inviterWallet) {
            await supabase
                .from('jelly_wallets')
                .update({
                    balance: (inviterWallet.balance ?? 0) + inviterReward,
                    updated_at: now,
                })
                .eq('user_id', referral.referrer_user_id);

            await supabase.from('jelly_transactions').insert({
                user_id: referral.referrer_user_id,
                type: 'reward',
                jellies: inviterReward,
                purpose: `Referral reward (${normalizedCode})`,
                metadata: { referral_code: normalizedCode, type: 'referrer_reward' },
                created_at: now,
            });
        }

        // Award jellies to new user
        const { data: newUserWallet } = await supabase
            .from('jelly_wallets')
            .select('balance')
            .eq('user_id', newUserId)
            .single();

        if (newUserWallet) {
            await supabase
                .from('jelly_wallets')
                .update({
                    balance: (newUserWallet.balance ?? 0) + referredReward,
                    updated_at: now,
                })
                .eq('user_id', newUserId);

            await supabase.from('jelly_transactions').insert({
                user_id: newUserId,
                type: 'reward',
                jellies: referredReward,
                purpose: 'Welcome bonus from referral',
                metadata: { referral_code: normalizedCode, type: 'referred_reward' },
                created_at: now,
            });
        }

        await supabase.from('rewards').insert([
            {
                user_id: referral.referrer_user_id,
                reward_type: 'referral_success',
                jellies: inviterReward,
                metadata: { referral_code: normalizedCode },
            },
            {
                user_id: newUserId,
                reward_type: 'signup',
                jellies: referredReward,
                metadata: { referral_code: normalizedCode },
            },
        ]);

        return NextResponse.json({
            success: true,
            inviterReward,
            newUserReward: referredReward,
            referralCode: normalizedCode,
        });
    } catch (error) {
        console.error('[referral/redeem]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
