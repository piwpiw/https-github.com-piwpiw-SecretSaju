/**
 * src/app/api/referral/redeem/route.ts
 * Referral Code Redemption API
 *
 * POST /api/referral/redeem
 * Body: { code: string, newUserId: string }
 * - Awards 2 jellies to the inviter and 2 to the new user
 * - Prevents duplicate redemption per user
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const REFERRAL_REWARD_JELLIES = 2;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, newUserId } = body as { code?: string; newUserId?: string };

        if (!code || !newUserId) {
            return NextResponse.json({ error: 'code and newUserId are required' }, { status: 400 });
        }

        // Check if this new user has already redeemed ANY code
        const { data: alreadyRedeemed } = await supabase
            .from('referral_redemptions')
            .select('id')
            .eq('redeemed_by', newUserId)
            .single();

        if (alreadyRedeemed) {
            return NextResponse.json({ error: 'User has already redeemed a referral code' }, { status: 409 });
        }

        // Find the referral code and its owner
        const { data: referral } = await supabase
            .from('referral_codes')
            .select('user_id, code, total_redeemed')
            .eq('code', code.toUpperCase())
            .single();

        if (!referral) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        // Prevent self-referral
        if (referral.user_id === newUserId) {
            return NextResponse.json({ error: 'Cannot redeem your own referral code' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Record the redemption
        await supabase.from('referral_redemptions').insert({
            code,
            inviter_id: referral.user_id,
            redeemed_by: newUserId,
            redeemed_at: now,
        });

        // Award jellies to inviter
        const { data: inviterWallet } = await supabase
            .from('jelly_wallets')
            .select('balance')
            .eq('user_id', referral.user_id)
            .single();

        if (inviterWallet) {
            await supabase
                .from('jelly_wallets')
                .update({ balance: (inviterWallet.balance ?? 0) + REFERRAL_REWARD_JELLIES, updated_at: now })
                .eq('user_id', referral.user_id);

            await supabase.from('jelly_transactions').insert({
                user_id: referral.user_id,
                type: 'earn',
                amount: REFERRAL_REWARD_JELLIES,
                description: `레퍼럴 초대 보상 (${code})`,
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
                .update({ balance: (newUserWallet.balance ?? 0) + REFERRAL_REWARD_JELLIES, updated_at: now })
                .eq('user_id', newUserId);

            await supabase.from('jelly_transactions').insert({
                user_id: newUserId,
                type: 'earn',
                amount: REFERRAL_REWARD_JELLIES,
                description: '레퍼럴 코드 사용 보상',
                created_at: now,
            });
        }

        // Update redemption count on the code
        await supabase
            .from('referral_codes')
            .update({ total_redeemed: (referral.total_redeemed ?? 0) + 1, updated_at: now })
            .eq('code', code);

        return NextResponse.json({
            success: true,
            inviterReward: REFERRAL_REWARD_JELLIES,
            newUserReward: REFERRAL_REWARD_JELLIES,
        });
    } catch (error) {
        console.error('[referral/redeem]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
