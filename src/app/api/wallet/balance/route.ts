import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_KEYS } from '@/config';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getKakaoUser } from '@/lib/kakao-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // 1. Auth Check (via Kakao Token)
        const accessToken = request.cookies.get(STORAGE_KEYS.KAKAO_TOKEN)?.value;
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Resolve Kakao User ID
        const kakaoUser = await getKakaoUser(accessToken);
        if (!kakaoUser) {
            return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        // 3. Get Wallet Balance via Join on Users table
        // We know kakao_id, we need wallet.
        // Query: Select balance from jelly_wallets where user_id in (select id from users where kakao_id = ?)

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('kakao_id', kakaoUser.id)
            .single();

        if (userError || !user) {
            // User might need sync if not found
            return NextResponse.json({ error: 'User not found in database', code: 'USER_NOT_SYNCED' }, { status: 404 });
        }

        const { data: wallet, error: walletError } = await supabase
            .from('jelly_wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        if (walletError && walletError.code === 'PGRST116') {
            // Wallet doesn't exist yet -> return 0 or create one?
            // Ideally create one.
            const { data: newWallet, error: createError } = await supabase
                .from('jelly_wallets')
                .insert({ user_id: user.id, balance: 0 })
                .select('balance')
                .single();

            if (createError) throw createError;
            return NextResponse.json({ balance: newWallet.balance });
        }

        if (walletError) throw walletError;

        return NextResponse.json({ balance: wallet.balance });

    } catch (error) {
        console.error('Wallet Balance API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
