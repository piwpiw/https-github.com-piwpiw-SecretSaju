import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { generateReferralCode, REFERRAL_REWARDS } from '@/lib/referral/referrals';

/**
 * POST /api/referrals/create
 * Create a unique referral code for the authenticated user
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();

        // Get user from session
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user already has a referral code
        const { data: existing } = await supabase
            .from('referrals')
            .select('referral_code')
            .eq('referrer_user_id', user.id)
            .limit(1)
            .single();

        if (existing) {
            return NextResponse.json({
                referral_code: existing.referral_code,
                already_exists: true,
            });
        }

        // Generate unique code
        let referralCode: string;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            referralCode = generateReferralCode();

            // Check if code is unique
            const { data: duplicate } = await supabase
                .from('referrals')
                .select('id')
                .eq('referral_code', referralCode)
                .single();

            if (!duplicate) {
                break; // Code is unique
            }

            attempts++;
        }

        if (attempts >= maxAttempts) {
            return NextResponse.json(
                { error: 'Failed to generate unique referral code' },
                { status: 500 }
            );
        }

        // Create referral record
        const { data: referral, error: insertError } = await supabase
            .from('referrals')
            .insert({
                referrer_user_id: user.id,
                referral_code: referralCode!,
                referrer_reward_jellies: REFERRAL_REWARDS.REFERRER,
                referred_reward_jellies: REFERRAL_REWARDS.REFERRED,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating referral:', insertError);
            return NextResponse.json(
                { error: 'Failed to create referral code' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            referral_code: referral.referral_code,
            reward_jellies: REFERRAL_REWARDS.REFERRER,
        });

    } catch (error) {
        console.error('Referral creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
