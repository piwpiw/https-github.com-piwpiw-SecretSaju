import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_KEYS } from '@/config';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getKakaoUser } from '@/lib/kakao-auth';

export type AuthResult =
    | { user: { id: string; kakaoId: number }; error: null }
    | { user: null; error: NextResponse };

/**
 * Validates Kakao Token from Cookie and returns the corresponding Supabase User ID (UUID).
 * @param request NextRequest
 * @returns AuthResult
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
    const accessToken = request.cookies.get(STORAGE_KEYS.KAKAO_TOKEN)?.value;

    if (!accessToken) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 })
        };
    }

    // Verify with Kakao
    const kakaoUser = await getKakaoUser(accessToken);
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

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('kakao_id', kakaoUser.id)
        .single();

    if (userError || !user) {
        return {
            user: null,
            error: NextResponse.json({ error: 'User not synced', code: 'USER_NOT_FOUND' }, { status: 404 })
        };
    }

    return {
        user: { id: user.id, kakaoId: kakaoUser.id },
        error: null
    };
}
