/**
 * POST /api/auth/logout — 서버 측 세션 쿠키 제거.
 *
 * KAKAO_TOKEN / NAVER_TOKEN 은 httpOnly 라 클라이언트 JS(clearCookie)로는
 * 지워지지 않는다. 예전에는 로그아웃해도 이 쿠키가 남아, UI 만 로그아웃될 뿐
 * 서버 API(getAuthenticatedUser)는 계속 인증된 상태였다 — 공용 기기에서
 * 다음 사용자가 이전 사용자의 지갑·기록에 접근할 수 있는 결함이다.
 * httpOnly 쿠키는 반드시 서버 응답으로만 만료시킬 수 있다.
 */
import { NextResponse } from 'next/server';
import { STORAGE_KEYS } from '@/config';

export const dynamic = 'force-dynamic';

const SESSION_COOKIES = [
    STORAGE_KEYS.KAKAO_TOKEN,
    STORAGE_KEYS.NAVER_TOKEN,
    STORAGE_KEYS.USER_DATA,
    STORAGE_KEYS.AUTH_SESSION_TOKEN,
    STORAGE_KEYS.MCP_TOKEN,
    STORAGE_KEYS.MCP_REFRESH_TOKEN,
] as const;

export async function POST() {
    const response = NextResponse.json({ success: true });
    for (const name of SESSION_COOKIES) {
        response.cookies.set(name, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });
    }
    return response;
}
