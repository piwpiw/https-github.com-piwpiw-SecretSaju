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

        // 3. Get User ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('kakao_id', kakaoUser.id)
            .single();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 4. Fetch History
        const { data: history, error: historyError } = await supabase
            .from('jelly_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (historyError) throw historyError;

        return NextResponse.json({ history });

    } catch (error) {
        console.error('Wallet History API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
