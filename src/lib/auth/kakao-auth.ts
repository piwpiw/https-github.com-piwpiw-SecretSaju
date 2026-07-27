'use client';

import { KAKAO_CONFIG, STORAGE_KEYS } from '@/config';
import { isMockMode } from '@/lib/app/use-mock';
import { getSupabaseClient } from '@/lib/integrations/supabase';

const ADMIN_BYPASS_STORAGE_KEY = 'secret_paws_mock_admin';

// How long the localStorage mirror of the session cookie is trusted once the
// cookie itself is gone (e.g. expired, cleared by the server, or blocked).
// Prevents a stale local cache from indefinitely impersonating a logged-in
// session after the server-side session has actually ended (ERR-L004).
const USER_DATA_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const USER_DATA_CACHE_TS_KEY = `${STORAGE_KEYS.USER_DATA}_cached_at`;

declare global {
    interface Window {
        Kakao: any;
    }
}

/**
 * Initialize Kakao SDK
 * Call this once when the app loads
 */
export function initKakao() {
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
        if (!KAKAO_CONFIG.JS_KEY) {
            console.error('Kakao JS Key is not configured. Please set NEXT_PUBLIC_KAKAO_JS_KEY in .env.local');
            return;
        }

        window.Kakao.init(KAKAO_CONFIG.JS_KEY);
        console.log('Kakao SDK initialized');
    }
}

/**
 * Start Kakao login flow
 * Redirects to Kakao OAuth page.
 *
 * Returns true when the OAuth redirect was actually started, false when the
 * attempt failed and the user has already been told why. Callers use the
 * return value to drop any "logging in..." state instead of spinning forever.
 */
export function loginWithKakao(): boolean {
    if (isMockMode()) {
        console.log('[MOCK] Bypassing Kakao Login');
        document.cookie = `${STORAGE_KEYS.USER_DATA}=${encodeURIComponent(JSON.stringify({ id: 999999, nickname: '테스트유저(Mock)' }))}; path=/; max-age=86400`;
        window.location.href = '/dashboard';
        return true;
    }

    // Kakao login is optional at launch. Without a JS key the SDK can never be
    // initialized, so fail with a clear message instead of throwing from
    // Kakao.Auth.authorize() on an uninitialized SDK (the SDK object can be
    // present on pages that load it for sharing).
    if (!KAKAO_CONFIG.JS_KEY) {
        console.error('Kakao JS Key is not configured. Please set NEXT_PUBLIC_KAKAO_JS_KEY in .env.local');
        alert('카카오 로그인은 현재 준비 중입니다. 구글 또는 이메일 로그인을 이용해 주세요.');
        return false;
    }

    // Kakao rejects a relative redirect_uri, which is what we would build if the
    // base URL is missing. Stop before sending the user to a broken URL.
    if (!/^https?:\/\//.test(KAKAO_CONFIG.REDIRECT_URI)) {
        console.error('Kakao redirect URI is not an absolute URL:', KAKAO_CONFIG.REDIRECT_URI);
        alert('카카오 로그인 설정이 올바르지 않습니다. 다른 로그인 수단을 이용해 주세요.');
        return false;
    }

    if (!window.Kakao?.Auth) {
        console.error('Kakao SDK not loaded');
        alert('카카오 로그인을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
        return false;
    }

    try {
        if (!window.Kakao.isInitialized?.()) {
            window.Kakao.init(KAKAO_CONFIG.JS_KEY);
        }

        window.Kakao.Auth.authorize({
            redirectUri: KAKAO_CONFIG.REDIRECT_URI,
        });
        return true;
    } catch (error) {
        console.error('Kakao authorize error:', error);
        alert('카카오 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        return false;
    }
}

/**
 * Logout from Kakao
 */
export function logoutKakao() {
    if (window.Kakao?.Auth) {
        window.Kakao.Auth.logout(() => {
            console.log('Logged out from Kakao');
        });
    }
}

/**
 * Kakao User Info Interface
 */
export interface KakaoUser {
    id: number;
    kakao_account: {
        profile?: {
            nickname: string;
            profile_image_url?: string;
            thumbnail_image_url?: string;
        };
        email?: string;
        email_needs_agreement?: boolean;
    };
    properties?: {
        nickname?: string;
        profile_image?: string;
    };
}

/**
 * Get Kakao user information
 * @param accessToken - Kakao access token
 */
export async function getKakaoUser(accessToken: string): Promise<KakaoUser | null> {
    if (isMockMode()) {
        return {
            id: 999999,
            kakao_account: { profile: { nickname: '테스트유저(Mock)' }, email: 'mock@secretsaju.com' }
        };
    }

    try {
        const response = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Kakao user fetch error:', error);
        return null;
    }
}

/**
 * Get user data from cookie
 */
export interface UserFromCookie {
    id: string | number;
    nickname: string;
    email?: string;
    profileImage?: string;
    auth_provider?: string | null;
    provider_user_id?: string | null;
}

function normalizeProviderUserId(value: unknown): string | null {
    if (value === null || value === undefined || value === '') return null;

    if (typeof value === 'number' || typeof value === 'bigint') {
        return String(value);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    return null;
}

export function getUserFromCookie(): UserFromCookie | null {
    if (typeof window === 'undefined') return null;

    if (isMockMode()) {
        return {
            id: 999999,
            nickname: '테스트유저(Mock)',
            email: 'mock@secretsaju.com'
        };
    }

    const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${STORAGE_KEYS.USER_DATA}=`));

    let parsed: any = null;

    if (userCookie) {
        try {
            parsed = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(parsed));
                localStorage.setItem(USER_DATA_CACHE_TS_KEY, String(Date.now()));
            }
        } catch { }
    } else if (typeof localStorage !== 'undefined') {
        const cachedAt = Number(localStorage.getItem(USER_DATA_CACHE_TS_KEY) || 0);
        const isFresh = cachedAt > 0 && Date.now() - cachedAt < USER_DATA_CACHE_TTL_MS;
        if (isFresh) {
            const cached = localStorage.getItem(STORAGE_KEYS.USER_DATA);
            if (cached) {
                try {
                    parsed = JSON.parse(cached);
                } catch { }
            }
        } else {
            // Cookie is gone and the cache is stale (or was never timestamped,
            // e.g. from before this fix) — treat the session as expired rather
            // than trusting old local data indefinitely.
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            localStorage.removeItem(USER_DATA_CACHE_TS_KEY);
        }
    }

    if (!parsed) return null;

    return {
        id: parsed.id ?? '',
        nickname: parsed.nickname ?? 'Guest',
        email: parsed.email,
        profileImage: parsed.profileImage ?? parsed.profile_image_url,
        auth_provider: parsed.auth_provider ?? null,
        provider_user_id: normalizeProviderUserId(parsed.provider_user_id ?? parsed.providerUserId),
    };
}

/**
 * Clear user session
 */
export function clearUserSession() {
    if (typeof window === 'undefined') return;

    // Supabase keeps its own session in localStorage under `sb-*` keys, which the
    // manual cleanup below does not touch. Without this, `ProfileProvider`'s
    // `resolveUserId()` — which asks `supabase.auth.getUser()` first — still
    // resolves the *previous* user after logout and loads their saved profiles.
    // On a shared device that is a cross-user data leak.
    //
    // Fire-and-forget on purpose: this function is synchronous and is called from
    // click handlers that navigate immediately afterwards. A failure here must not
    // block the rest of the local cleanup, which is what actually logs the user out
    // of this app.
    try {
        void getSupabaseClient()?.auth.signOut().catch(() => { });
    } catch { }

    if (typeof sessionStorage !== 'undefined') {
        try {
            sessionStorage.removeItem('kakao_access_token');
            sessionStorage.removeItem('kakao_refresh_token');
            sessionStorage.removeItem('mcp_access_token');
            sessionStorage.removeItem('mcp_id_token');
            sessionStorage.removeItem('mcp_code_verifier');
            sessionStorage.removeItem('mcp_oauth_state');
        } catch { }
    }

    if (typeof localStorage !== 'undefined') {
        try {
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            localStorage.removeItem(USER_DATA_CACHE_TS_KEY);
            localStorage.removeItem(ADMIN_BYPASS_STORAGE_KEY);
            localStorage.removeItem('mcp_access_token');
            localStorage.removeItem('mcp_refresh_token');
            localStorage.removeItem('mcp_id_token');
            localStorage.removeItem('mcp_state');
            localStorage.removeItem('mcp_code_verifier');
            localStorage.removeItem('kakao_access_token');
            localStorage.removeItem('kakao_refresh_token');
        } catch { }
    }

        const clearCookie = (name: string) => {
            const base = `${name}=; Max-Age=0; path=/; SameSite=Lax;`;
            document.cookie = base;
            document.cookie = `${base} domain=${window.location.hostname};`;
            document.cookie = `${base} domain=.${window.location.hostname};`;
        if (window.location.protocol === 'https:') {
            document.cookie = `${base} Secure;`;
            document.cookie = `${base} domain=${window.location.hostname}; Secure;`;
            document.cookie = `${base} domain=.${window.location.hostname}; Secure;`;
        }
    };

    clearCookie(STORAGE_KEYS.KAKAO_TOKEN);
    clearCookie(STORAGE_KEYS.USER_DATA);
    clearCookie(STORAGE_KEYS.MCP_TOKEN);
    clearCookie(STORAGE_KEYS.MCP_REFRESH_TOKEN);
    clearCookie(STORAGE_KEYS.MCP_STATE);
    clearCookie(STORAGE_KEYS.MCP_CODE_VERIFIER);
    clearCookie(STORAGE_KEYS.AUTH_SESSION_TOKEN);
    clearCookie(ADMIN_BYPASS_STORAGE_KEY);

    logoutKakao();
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
    return getUserFromCookie() !== null;
}
