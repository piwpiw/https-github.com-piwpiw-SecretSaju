/**
 * src/components/referral/referral-attribution.ts
 *
 * 초대 링크 유입(?ref=CODE)이 로그인 완료 후 자동 상환까지 살아남도록
 * 코드 보관/조회/폐기를 담당하는 헬퍼 모음.
 *
 * 전체 흐름:
 *  1. 공유 링크(/api/referral/invite?ref=CODE)가 서버에서 쿠키를 심고
 *     /?ref=CODE 로 리다이렉트한다 (레이아웃/홈 페이지 수정 없이 유입을 잡는 지점).
 *  2. 클라이언트에서는 마운트 시 현재 URL 의 ?ref= 값을 localStorage 에도 백업한다.
 *  3. 로그인 후 useReferralAutoRedeem 훅이 보관된 코드를 읽어
 *     /api/referral/redeem 을 자동 호출한다.
 *  4. 성공 또는 확정적 실패(중복/본인 코드 등 4xx)면 코드를 폐기한다.
 *
 * 순수 함수(normalize/extract/parse)는 서버 라우트와 node 테스트에서도 동작하고,
 * 브라우저 래퍼(capture/read/clear)는 window/document 가드를 갖는다.
 */

export const PENDING_REFERRAL_COOKIE = 'secretsaju_pending_referral';
export const PENDING_REFERRAL_STORAGE_KEY = 'secretsaju_pending_referral';
export const REFERRAL_QUERY_PARAM = 'ref';
export const PENDING_REFERRAL_TTL_SECONDS = 30 * 24 * 60 * 60; // 30일

// 서버(generateReferralCode)는 USER + [A-Z2-9]{6} 형식을 만들지만, 수동 발급
// 코드 가능성을 고려해 보관 단계에서는 느슨하게 받는다. 최종 검증은 서버
// (/api/referral/redeem)가 수행한다.
const CODE_PATTERN = /^[A-Z0-9]{4,24}$/;

/** 문자열을 대문자 정규화하고, 코드 형식이 아니면 null 을 반환한다. */
export function normalizePendingReferralCode(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const code = raw.trim().toUpperCase();
    return CODE_PATTERN.test(code) ? code : null;
}

/** location.search 형태의 쿼리 문자열에서 ?ref= 코드를 추출한다. */
export function extractReferralCodeFromSearch(search: string): string | null {
    try {
        const params = new URLSearchParams(search);
        return normalizePendingReferralCode(params.get(REFERRAL_QUERY_PARAM));
    } catch {
        return null;
    }
}

/** document.cookie 형태의 문자열에서 보관된 초대 코드를 파싱한다. */
export function parsePendingReferralCookie(cookieHeader: string): string | null {
    const target = cookieHeader
        .split('; ')
        .find((row) => row.startsWith(`${PENDING_REFERRAL_COOKIE}=`));
    if (!target) return null;

    const value = target.slice(PENDING_REFERRAL_COOKIE.length + 1);
    try {
        return normalizePendingReferralCode(decodeURIComponent(value));
    } catch {
        return null;
    }
}

// ─── 브라우저 전용 래퍼 ─────────────────────────────────────────────

/** 현재 URL 의 ?ref= 코드를 localStorage 에 보관한다 (있을 때만). */
export function captureReferralCodeFromLocation(): string | null {
    if (typeof window === 'undefined') return null;
    const code = extractReferralCodeFromSearch(window.location.search);
    if (!code) return null;
    try {
        window.localStorage.setItem(PENDING_REFERRAL_STORAGE_KEY, code);
    } catch {
        // localStorage 불가(시크릿 모드 등) — 쿠키 경로가 남아 있으므로 무시.
    }
    return code;
}

/** 보관된 초대 코드를 읽는다: localStorage 우선, 없으면 쿠키. */
export function readPendingReferralCode(): string | null {
    if (typeof window !== 'undefined') {
        try {
            const stored = normalizePendingReferralCode(
                window.localStorage.getItem(PENDING_REFERRAL_STORAGE_KEY)
            );
            if (stored) return stored;
        } catch {
            // ignore — 쿠키 폴백으로 진행
        }
    }
    if (typeof document === 'undefined') return null;
    return parsePendingReferralCookie(document.cookie);
}

/** 보관된 초대 코드를 모든 저장소(localStorage + 쿠키)에서 폐기한다. */
export function clearPendingReferralCode(): void {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.removeItem(PENDING_REFERRAL_STORAGE_KEY);
        } catch {
            // ignore
        }
    }
    if (typeof document !== 'undefined') {
        document.cookie = `${PENDING_REFERRAL_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
    }
}
