/**
 * GET /api/auth/naver/login — 네이버 인가 페이지로 보낸다.
 *
 * state 를 만들어 httpOnly 쿠키에 심고 같은 값을 인가 URL 에 실어 보낸다.
 * 콜백에서 두 값이 일치해야만 토큰 교환을 진행한다 (CSRF 방지).
 */
import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG, NAVER_CONFIG } from '@/config/env';
import {
    NAVER_STATE_COOKIE,
    NAVER_STATE_TTL_SECONDS,
    buildNaverAuthorizeUrl,
} from '@/lib/auth/naver-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    if (!NAVER_CONFIG.isConfigured) {
        // 누락된 환경변수 이름은 서버 로그에만 남긴다.
        console.error('Naver is not configured:', NAVER_CONFIG.error);
        const url = new URL('/auth/callback', request.url);
        url.searchParams.set('error', 'naver_not_configured');
        url.searchParams.set('provider', 'naver');
        return NextResponse.redirect(url);
    }

    // BASE_URL 미설정 환경(로컬 등)에서는 요청 origin 으로 대체한다.
    // 네이버 토큰 교환은 redirect_uri 재검증을 하지 않아 왕복 간 불일치 위험이 없다.
    const redirectUri = APP_CONFIG.BASE_URL
        ? NAVER_CONFIG.REDIRECT_URI
        : new URL('/api/auth/naver/callback', request.url).toString();

    const state = crypto.randomUUID();
    const authorizeUrl = buildNaverAuthorizeUrl({
        clientId: NAVER_CONFIG.CLIENT_ID,
        redirectUri,
        state,
    });

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(NAVER_STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: NAVER_STATE_TTL_SECONDS,
        path: '/',
    });
    return response;
}
