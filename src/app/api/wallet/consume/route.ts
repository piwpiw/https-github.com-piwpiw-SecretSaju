import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/wallet/consume
 * Consume jellies for unlocking features
 */
export async function POST(req: NextRequest) {
    try {
        const { jellies, purpose, profile_id, feature } = await req.json();

        if (!jellies || !purpose) {
            return NextResponse.json(
                { error: 'Jellies and purpose are required' },
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

        // Check wallet balance
        const { data: wallet, error: walletError } = await supabase
            .from('jelly_wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        if (walletError || !wallet) {
            return NextResponse.json(
                { error: 'Wallet not found' },
                { status: 404 }
            );
        }

        if (wallet.balance < jellies) {
            return NextResponse.json(
                { error: 'Insufficient jellies', balance: wallet.balance },
                { status: 400 }
            );
        }

        // Create consumption transaction (triggers will update wallet)
        const { data: transaction, error: txError } = await supabase
            .from('jelly_transactions')
            .insert({
                user_id: user.id,
                type: 'consume',
                jellies,
                purpose,
                metadata: { profile_id, feature },
            })
            .select()
            .single();

        if (txError) {
            console.error('Error creating transaction:', txError);
            return NextResponse.json(
                { error: 'Failed to consume jellies' },
                { status: 500 }
            );
        }

        // If unlocking a feature, record it
        if (profile_id && feature) {
            const { error: unlockError } = await supabase
                .from('unlocks')
                .insert({
                    user_id: user.id,
                    profile_id,
                    feature,
                    jellies_spent: jellies,
                });

            if (unlockError) {
                console.error('Error recording unlock:', unlockError);
                // Don't fail the request, jellies already consumed
            }
        }

        // Get updated balance
        const { data: updatedWallet } = await supabase
            .from('jelly_wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({
            success: true,
            transaction_id: transaction.id,
            jellies_consumed: jellies,
            new_balance: updatedWallet?.balance || 0,
        });

    } catch (error) {
        console.error('Consume jellies error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
