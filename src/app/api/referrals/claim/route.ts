import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';

/**
 * POST /api/referrals/claim
 * Claim referral bonus when a new user signs up with a referral code
 */
export async function POST(req: NextRequest) {
    try {
        const { referral_code } = await req.json();

        if (!referral_code) {
            return NextResponse.json(
                { error: 'Referral code is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Get authenticated user (the one being referred)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find referral by code
        const { data: referral, error: findError } = await supabase
            .from('referrals')
            .select('*')
            .eq('referral_code', referral_code)
            .single();

        if (findError || !referral) {
            return NextResponse.json(
                { error: 'Invalid referral code' },
                { status: 404 }
            );
        }

        // Check if already claimed
        if (referral.reward_claimed) {
            return NextResponse.json(
                { error: 'Referral code already used' },
                { status: 400 }
            );
        }

        // Can't refer yourself
        if (referral.referrer_user_id === user.id) {
            return NextResponse.json(
                { error: 'Cannot use your own referral code' },
                { status: 400 }
            );
        }

        // Update referral with referred user
        const { error: updateError } = await supabase
            .from('referrals')
            .update({
                referred_user_id: user.id,
                reward_claimed: true,
                claimed_at: new Date().toISOString(),
            })
            .eq('id', referral.id);

        if (updateError) {
            console.error('Error updating referral:', updateError);
            return NextResponse.json(
                { error: 'Failed to claim referral' },
                { status: 500 }
            );
        }

        // Give jellies to referrer
        const userIdentifier = 'email' in user && user.email ? user.email : user.id;
        const { error: referrerTxError } = await supabase
            .from('jelly_transactions')
            .insert({
                user_id: referral.referrer_user_id,
                type: 'reward',
                jellies: referral.referrer_reward_jellies,
                purpose: `Referral reward: ${userIdentifier}`,
                metadata: { referral_id: referral.id },
            });

        if (referrerTxError) {
            console.error('Error giving referrer reward:', referrerTxError);
        }

        // Give jellies to referred user (new user)
        const { error: referredTxError } = await supabase
            .from('jelly_transactions')
            .insert({
                user_id: user.id,
                type: 'reward',
                jellies: referral.referred_reward_jellies,
                purpose: 'Welcome bonus from referral',
                metadata: { referral_id: referral.id },
            });

        if (referredTxError) {
            console.error('Error giving referred user reward:', referredTxError);
        }

        // Record rewards in rewards table
        await supabase.from('rewards').insert([
            {
                user_id: referral.referrer_user_id,
                reward_type: 'referral_success',
                jellies: referral.referrer_reward_jellies,
                metadata: { referral_id: referral.id },
            },
            {
                user_id: user.id,
                reward_type: 'signup',
                jellies: referral.referred_reward_jellies,
                metadata: { referral_id: referral.id },
            },
        ]);

        return NextResponse.json({
            success: true,
            jellies_received: referral.referred_reward_jellies,
            message: `Welcome! You received ${referral.referred_reward_jellies} jellies!`,
        });

    } catch (error) {
        console.error('Referral claim error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
