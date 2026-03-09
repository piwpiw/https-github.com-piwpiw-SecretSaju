import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
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

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
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
