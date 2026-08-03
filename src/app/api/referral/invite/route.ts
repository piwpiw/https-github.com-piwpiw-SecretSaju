/**
 * src/app/api/referral/invite/route.ts
 * Referral Invite Landing (초대 링크 유입 지점)
 *
 * GET /api/referral/invite?ref=CODE (code= 도 허용)
 *
 * 공유되는 초대 링크가 가리키는 서버 랜딩. 홈(/)이나 레이아웃을 수정하지 않고도
 * 유입 시점에 코드를 보관하기 위해, 여기서 클라이언트가 읽을 수 있는
 * (httpOnly=false) 쿠키를 심은 뒤 기존 컨벤션인 /?ref=CODE 로 리다이렉트한다.
 *
 * 이후 흐름: 로그인 완료 → /mypage 의 ReferralCard(useReferralAutoRedeem)가
 * 쿠키/localStorage 의 코드를 읽어 /api/referral/redeem 을 자동 호출한다.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    PENDING_REFERRAL_COOKIE,
    PENDING_REFERRAL_TTL_SECONDS,
    REFERRAL_QUERY_PARAM,
    normalizePendingReferralCode,
} from '@/components/referral/referral-attribution';

export async function GET(req: NextRequest) {
    const rawCode =
        req.nextUrl.searchParams.get(REFERRAL_QUERY_PARAM) ??
        req.nextUrl.searchParams.get('code');
    const code = normalizePendingReferralCode(rawCode);

    const redirectUrl = new URL('/', req.url);
    if (code) {
        // /?ref=CODE 형태를 유지해, 홈에서 클라이언트 캡처가 추가되더라도
        // 그대로 동작하게 한다.
        redirectUrl.searchParams.set(REFERRAL_QUERY_PARAM, code);
    }

    const response = NextResponse.redirect(redirectUrl);

    if (code) {
        response.cookies.set(PENDING_REFERRAL_COOKIE, code, {
            // 클라이언트(useReferralAutoRedeem)가 읽고 폐기해야 하므로 httpOnly 금지.
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: PENDING_REFERRAL_TTL_SECONDS,
            path: '/',
        });
    }

    return response;
}
