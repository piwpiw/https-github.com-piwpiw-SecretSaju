import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { deductJelly } from '@/lib/payment/wallet-server';

/**
 * POST /api/wallet/consume
 * Consume jellies for unlocking features
 */
export async function POST(req: NextRequest) {
    try {
        // A malformed/empty body is a client error, not a server fault — parsing it
        // inside the outer try would surface as a 500.
        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        const { jellies, purpose, profile_id, feature } = body ?? {};

        if (!jellies || !purpose) {
            return NextResponse.json(
                { error: 'Jellies and purpose are required' },
                { status: 400 }
            );
        }

        if (!Number.isFinite(Number(jellies)) || Number(jellies) <= 0) {
            return NextResponse.json(
                { error: 'Jellies must be a positive number' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Get authenticated user
        const { user, error: authError } = await getAuthenticatedUser(req as any);

        if (authError || !user) {
            return authError || NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // [Admin Pass] Admins don't consume jellies
        if (user.isAdmin) {
            return NextResponse.json({
                success: true,
                transaction_id: 'admin-bypass-' + Date.now(),
                jellies_consumed: 0,
                new_balance: 999999,
                isAdmin: true
            });
        }

        // Atomically deduct balance + record the transaction via RPC `deduct_jellies`.
        // No DB trigger updates jelly_wallets on a bare jelly_transactions insert,
        // so a plain insert here would consume nothing (see wallet-server.ts).
        const deduction = await deductJelly(user.id, Number(jellies), purpose, { profile_id, feature });

        if (!deduction.success) {
            if (deduction.error === 'Wallet not found') {
                return NextResponse.json(
                    { error: 'Wallet not found' },
                    { status: 404 }
                );
            }

            // Covers both the pre-check ('Insufficient jellies') and the RPC race
            // failure ('Insufficient balance or user not found').
            if (typeof deduction.error === 'string' && deduction.error.includes('Insufficient')) {
                return NextResponse.json(
                    {
                        error: 'Insufficient jellies',
                        code: 'INSUFFICIENT_JELLIES',
                        balance: deduction.currentBalance,
                    },
                    { status: 402 }
                );
            }

            console.error('Error consuming jellies:', deduction.error);
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

        return NextResponse.json({
            success: true,
            jellies_consumed: jellies,
            new_balance: deduction.remainingBalance ?? 0,
        });

    } catch (error) {
        console.error('Consume jellies error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
