import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request);

        // Guest / unauthenticated, or an expected auth/config failure (401/503):
        // degrade gracefully instead of surfacing an error to the global wallet
        // provider that mounts on every page. Only genuine 5xx faults pass through.
        if (authResult.error) {
            if (authResult.error.status >= 500) return authResult.error;
            return NextResponse.json({ balance: 0, isAdmin: false, configured: false });
        }
        if (!authResult.user) {
            return NextResponse.json({ balance: 0, isAdmin: false, configured: false });
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json({ balance: 0, isAdmin: false, configured: false });
        }

        const { data: wallet, error: walletError } = await supabase
            .from('jelly_wallets')
            .select('balance')
            .eq('user_id', authResult.user.id)
            .single();

        if (walletError && walletError.code === 'PGRST116') {
            const { data: newWallet, error: createError } = await supabase
                .from('jelly_wallets')
                .insert({ user_id: authResult.user.id, balance: 0 })
                .select('balance')
                .single();

            if (createError) throw createError;
            return NextResponse.json({ balance: newWallet.balance, isAdmin: authResult.user.isAdmin ?? false });
        }

        if (walletError) throw walletError;

        return NextResponse.json({
            balance: wallet.balance,
            isAdmin: authResult.user.isAdmin ?? false,
        });
    } catch (error) {
        console.error('Wallet Balance API Error:', error);
        return NextResponse.json({ balance: 0, isAdmin: false, degraded: true });
    }
}
