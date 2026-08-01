import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { SIGNUP_REWARDS } from '@/lib/referral/referrals';

type RewardType = 'signup' | 'first_saju' | 'profile_save' | 'referral_success' | 'first_purchase' | 'review';

/**
 * POST /api/rewards/claim
 * Claim a reward for completing an action
 */
export async function POST(req: NextRequest) {
    try {
        const { reward_type } = await req.json() as { reward_type: RewardType };

        if (!reward_type) {
            return NextResponse.json(
                { error: 'Reward type is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Get authenticated user from the request (cookie/bearer token) — the
        // service-role client has no session, so supabase.auth.getUser() would
        // always fail here.
        const { user, error: authError } = await getAuthenticatedUser(req);

        if (authError || !user) {
            return authError || NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if reward already claimed
        const { data: existingReward } = await supabase
            .from('rewards')
            .select('id')
            .eq('user_id', user.id)
            .eq('reward_type', reward_type)
            .single();

        if (existingReward) {
            return NextResponse.json(
                { error: 'Reward already claimed' },
                { status: 400 }
            );
        }

        // Determine jelly amount based on reward type
        let jellies = 0;
        let purpose = '';

        switch (reward_type) {
            case 'signup':
                jellies = SIGNUP_REWARDS.SIGNUP_BONUS;
                purpose = 'Welcome bonus';
                break;
            case 'first_saju':
                jellies = SIGNUP_REWARDS.FIRST_SAJU;
                purpose = 'First saju calculation';
                break;
            case 'profile_save':
                jellies = SIGNUP_REWARDS.PROFILE_SAVE;
                purpose = 'Profile saved';
                break;
            case 'first_purchase':
                jellies = 1; // Bonus jelly on first purchase
                purpose = 'First purchase bonus';
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid reward type' },
                    { status: 400 }
                );
        }

        if (jellies === 0) {
            // No reward for this action
            return NextResponse.json({
                success: true,
                jellies_received: 0,
                message: 'No reward for this action',
            });
        }

        // Create reward record
        const { error: rewardError } = await supabase
            .from('rewards')
            .insert({
                user_id: user.id,
                reward_type,
                jellies,
                metadata: { claimed_at: new Date().toISOString() },
            });

        if (rewardError) {
            console.error('Error creating reward record:', rewardError);
            return NextResponse.json(
                { error: 'Failed to claim reward' },
                { status: 500 }
            );
        }

        // Add jellies to wallet
        const { error: txError } = await supabase
            .from('jelly_transactions')
            .insert({
                user_id: user.id,
                type: 'reward',
                jellies,
                purpose,
                metadata: { reward_type },
            });

        if (txError) {
            console.error('Error adding jellies:', txError);
            return NextResponse.json(
                { error: 'Failed to add jellies' },
                { status: 500 }
            );
        }

        // Manually credit the wallet — no DB trigger updates jelly_wallets on a
        // jelly_transactions insert (same pattern as payment/verify).
        const { data: wallet, error: walletLookupError } = await supabase
            .from('jelly_wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        if (walletLookupError && walletLookupError.code !== 'PGRST116') {
            console.error('Error loading wallet:', walletLookupError);
            return NextResponse.json(
                { error: 'Failed to add jellies' },
                { status: 500 }
            );
        }

        if (wallet) {
            const { error: walletUpdateError } = await supabase
                .from('jelly_wallets')
                .update({ balance: wallet.balance + jellies })
                .eq('user_id', user.id);

            if (walletUpdateError) {
                console.error('Error updating wallet:', walletUpdateError);
                return NextResponse.json(
                    { error: 'Failed to add jellies' },
                    { status: 500 }
                );
            }
        } else {
            const { error: walletInsertError } = await supabase
                .from('jelly_wallets')
                .insert({ user_id: user.id, balance: jellies });

            if (walletInsertError) {
                console.error('Error initializing wallet:', walletInsertError);
                return NextResponse.json(
                    { error: 'Failed to add jellies' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            jellies_received: jellies,
            message: `You received ${jellies} jellies!`,
        });

    } catch (error) {
        console.error('Reward claim error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
