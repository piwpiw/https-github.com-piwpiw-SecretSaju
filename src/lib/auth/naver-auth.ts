/**
 * src/lib/auth/naver-auth.ts
 * 네이버 OAuth 순수 로직 (URL 조립·프로필 파싱·토큰 검증)
 *
 * 카카오와 달리 JS SDK 없이 서버 전용 표준 인가 코드 플로를 쓴다:
 *   /api/auth/naver/login    → 네이버 인가 페이지로 302 (state 쿠키 발급)
 *   /api/auth/naver/callback → state 검증 → 토큰 교환 → 프로필 → 세션 쿠키
 *
 * 네트워크를 타지 않는 함수는 전부 여기에 두어 tests/logic 에서 검증한다.
 */
import { NAVER_CONFIG } from '@/config/env';

/** CSRF 방지용 state 쿠키. OAuth 왕복 10분 안에만 유효하다. */
export const NAVER_STATE_COOKIE = 'secretsaju_naver_oauth_state';
export const NAVER_STATE_TTL_SECONDS = 600;

export type NaverProfile = {
    id: string;
    nickname: string;
    email: string | null;
    profileImage: string | null;
};

/** 네이버 인가 URL. state 는 호출자가 만들어 쿠키에도 같이 심는다. */
export function buildNaverAuthorizeUrl(params: {
    clientId: string;
    redirectUri: string;
    state: string;
}): string {
    const url = new URL(NAVER_CONFIG.AUTH_URL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', params.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('state', params.state);
    return url.toString();
}

/**
 * 네이버 프로필 응답 파싱.
 *
 * 네이버는 HTTP 200 이어도 몸체의 `resultcode` 가 '00' 이 아니면 실패다.
 * id 가 없으면 세션을 만들 수 없으므로 null 을 돌려준다.
 */
export function parseNaverProfile(body: unknown): NaverProfile | null {
    if (!body || typeof body !== 'object') return null;
    const { resultcode, response } = body as {
        resultcode?: string;
        response?: {
            id?: string;
            nickname?: string;
            name?: string;
            email?: string;
            profile_image?: string;
        };
    };

    if (resultcode !== '00' || !response?.id) return null;

    return {
        id: String(response.id),
        nickname: response.nickname || response.name || 'Naver User',
        email: response.email || null,
        profileImage: response.profile_image || null,
    };
}

/**
 * 액세스 토큰으로 네이버 프로필을 조회한다.
 * api-auth 가 요청마다 세션을 검증할 때도 이 함수를 쓴다 (카카오의
 * getKakaoUser 와 같은 역할). 실패하면 null — 만료/위조 토큰이다.
 */
export async function getNaverUser(accessToken: string): Promise<NaverProfile | null> {
    try {
        const response = await fetch(NAVER_CONFIG.PROFILE_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) return null;
        return parseNaverProfile(await response.json());
    } catch (error) {
        console.error('[NAVER-AUTH] Profile fetch failed:', error);
        return null;
    }
}
