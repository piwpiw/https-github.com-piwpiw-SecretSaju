/**
 * GET /api/auth/naver/callback — 네이버 인가 코드 콜백.
 *
 * 카카오 콜백(src/app/api/auth/kakao/callback/route.ts)과 같은 구조:
 * state 검증 → 토큰 교환 → 프로필 조회 → users upsert(naver_id) →
 * 토큰·사용자 쿠키 설정 → /mypage. 실패는 전부 /auth/callback 으로
 * 리다이렉트해 기존 오류 UI 가 처리한다.
 */
import { NextRequest, NextResponse } from 'next/server';
import { NAVER_CONFIG, STORAGE_KEYS } from '@/config';
import { sendWelcomeEmail, MAIL_RETRY_TTL_SECONDS } from '@/lib/integrations/mail';
import { NAVER_STATE_COOKIE, parseNaverProfile } from '@/lib/auth/naver-auth';

const WELCOME_RETRY_COOKIE = 'secretsaju_welcome_email_retry';

function redirectToAuthCallback(request: NextRequest, params: Record<string, string>) {
    const url = new URL('/auth/callback', request.url);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    const response = NextResponse.redirect(url);
    response.cookies.delete(NAVER_STATE_COOKIE);
    return response;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
        console.error('Naver OAuth error:', error);
        return redirectToAuthCallback(request, {
            error: 'provider_error',
            provider: 'naver',
            provider_error: error,
            ...(errorDescription ? { provider_error_description: errorDescription } : {}),
        });
    }

    if (!code) {
        return redirectToAuthCallback(request, {
            error: 'no_code',
            provider: 'naver',
            provider_error: 'missing_code',
        });
    }

    if (!NAVER_CONFIG.isConfigured) {
        console.error('Naver is not configured:', NAVER_CONFIG.error);
        return redirectToAuthCallback(request, { error: 'naver_not_configured', provider: 'naver' });
    }

    // CSRF 방지: 로그인 시작 때 심은 state 쿠키와 반드시 일치해야 한다.
    const expectedState = request.cookies.get(NAVER_STATE_COOKIE)?.value;
    if (!expectedState || !state || expectedState !== state) {
        return redirectToAuthCallback(request, {
            error: 'oauth_callback_error',
            provider: 'naver',
            provider_error: 'state_mismatch',
        });
    }

    try {
        let shouldRetryWelcomeEmail = false;

        const tokenResponse = await fetch(NAVER_CONFIG.TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: NAVER_CONFIG.CLIENT_ID,
                client_secret: NAVER_CONFIG.CLIENT_SECRET,
                code,
                state,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            return redirectToAuthCallback(request, {
                error: 'provider_error',
                provider: 'naver',
                provider_error: tokenData.error || 'token_exchange_failed',
                provider_error_description: tokenData.error_description || 'OAuth token exchange failed',
            });
        }

        const profileResponse = await fetch(NAVER_CONFIG.PROFILE_URL, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const user = parseNaverProfile(await profileResponse.json());

        if (!user) {
            return redirectToAuthCallback(request, {
                error: 'login_failed',
                provider: 'naver',
                provider_error: 'naver_userinfo_failed',
            });
        }

        try {
            const { getSupabaseAdmin } = await import('@/lib/integrations/supabase');
            const supabaseAdmin = getSupabaseAdmin();

            if (supabaseAdmin) {
                const { data: existingUser, error: existingUserError } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('naver_id', user.id)
                    .maybeSingle();

                if (existingUserError) {
                    // naver_id 컬럼 자체가 없으면 마이그레이션 011 미적용이다.
                    console.error(
                        'Naver user lookup failed (마이그레이션 011_add_naver_auth 적용 여부 확인):',
                        existingUserError,
                    );
                    return redirectToAuthCallback(request, {
                        error: 'login_failed',
                        provider: 'naver',
                        provider_error: 'naver_user_lookup_failed',
                    });
                }

                const { error: syncError } = await supabaseAdmin.from('users').upsert(
                    {
                        naver_id: user.id,
                        nickname: user.nickname,
                        email: user.email,
                        auth_provider: 'naver',
                        profile_image_url: user.profileImage,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'naver_id' },
                );

                if (syncError) {
                    console.error('Naver Supabase sync error:', syncError);
                    return redirectToAuthCallback(request, {
                        error: 'login_failed',
                        provider: 'naver',
                        provider_error: 'naver_user_sync_failed',
                    });
                }

                if (!existingUser && user.email) {
                    const mailResult = await sendWelcomeEmail(user.email, user.nickname || 'New User');
                    if (!mailResult.success) {
                        console.warn('[Naver Callback] Welcome email failed:', mailResult.error);
                        shouldRetryWelcomeEmail = true;
                    }
                }
            }
        } catch (dbError) {
            console.error('Database connection failed during Naver sync:', dbError);
        }

        const response = NextResponse.redirect(new URL('/mypage', request.url));
        response.cookies.delete(NAVER_STATE_COOKIE);

        response.cookies.set(STORAGE_KEYS.NAVER_TOKEN, tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: Number(tokenData.expires_in) || 3600,
            path: '/',
        });

        // 헤더 등 클라이언트 UI 가 로그인 상태를 그리는 데 쓰는 쿠키 (카카오와 동일)
        response.cookies.set(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify({
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                profileImage: user.profileImage,
                provider: 'naver',
            }),
            {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: Number(tokenData.expires_in) || 3600,
                path: '/',
            },
        );

        if (shouldRetryWelcomeEmail) {
            response.cookies.set(WELCOME_RETRY_COOKIE, '1', {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: MAIL_RETRY_TTL_SECONDS,
                path: '/',
            });
        }

        return response;
    } catch (callbackError) {
        console.error('Naver login error:', callbackError);
        return redirectToAuthCallback(request, {
            error: 'login_failed',
            provider: 'naver',
            provider_error: 'naver_callback_error',
        });
    }
}
