import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_KEYS } from '@/config';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getKakaoUser } from '@/lib/kakao-auth';

export type AuthResult =
    | { user: { id: string; kakaoId: number; email?: string | null }; error: null }
    | { user: null; error: NextResponse };

/**
 * Validates Kakao Token from Cookie and returns the corresponding Supabase User ID (UUID).
 * @param request NextRequest
 * @returns AuthResult
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
    const accessToken = request.cookies.get(STORAGE_KEYS.KAKAO_TOKEN)?.value;

    if (!accessToken && process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true') {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 })
        };
    }

    // Verify with Kakao
    const kakaoUser = await getKakaoUser(accessToken || '');
    if (!kakaoUser) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized: Invalid Kakao session' }, { status: 401 })
        };
    }

    // Get Supabase User
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Service Unavailable: Database error' }, { status: 503 })
        };
    }

    // [Token Diet] Zero-Waste UPSERT: Create user if not exists, and return ID in one DB call.
    const { data: user, error: userError } = await supabase
        .from('users')
        .upsert({
            kakao_id: kakaoUser.id,
            email: kakaoUser.kakao_account?.email || null,
            name: kakaoUser.kakao_account?.profile?.nickname || '익명 동물',
            profile_image_url: kakaoUser.kakao_account?.profile?.profile_image_url || null,
            last_login_at: new Date().toISOString(),
        }, { onConflict: 'kakao_id' })
        .select('id')
        .single();

    if (userError || !user) {
        console.error('[API-AUTH] User UPSERT Failed:', userError);
        return {
            user: null,
            error: NextResponse.json({ error: 'User sync failed', code: 'USER_SYNC_ERROR' }, { status: 500 })
        };
    }

    // Auto-create Wallet if not exists (Zero-Waste Insert)
    const { error: walletError } = await supabase
        .from('jelly_wallets')
        .insert({ user_id: user.id, balance: 1000 }) // 신규 가입 축하금 1000 젤리
        .select()
        .single();

    // Ignore wallet conflict error (already exists)
    if (walletError && walletError.code !== '23505') {
        console.error('[API-AUTH] Wallet Creation Failed:', walletError);
    }

    return {
        user: { id: user.id, kakaoId: kakaoUser.id, email: kakaoUser.kakao_account?.email },
        error: null
    };
}
