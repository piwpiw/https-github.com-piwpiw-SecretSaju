import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const authResult = await getAuthenticatedUser(request);
    if (authResult.error) return authResult.error;
    if (!authResult.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    try {
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
