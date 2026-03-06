'use client';

import { KAKAO_CONFIG, STORAGE_KEYS } from '@/config';
import { isMockMode } from '@/lib/use-mock';

const ADMIN_BYPASS_STORAGE_KEY = 'secret_paws_mock_admin';

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
 * Redirects to Kakao OAuth page
 */
export function loginWithKakao() {
    if (isMockMode()) {
        console.log('[MOCK] Bypassing Kakao Login');
        document.cookie = `${STORAGE_KEYS.USER_DATA}=${encodeURIComponent(JSON.stringify({ id: 999999, nickname: '테스트유저(Mock)' }))}; path=/; max-age=86400`;
        window.location.href = '/dashboard';
        return;
    }

    if (!window.Kakao) {
        console.error('Kakao SDK not loaded');
        alert('카카오 로그인을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
        return;
    }

    window.Kakao.Auth.authorize({
        redirectUri: KAKAO_CONFIG.REDIRECT_URI,
    });
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
            }
        } catch { }
    } else if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (cached) {
            try {
                parsed = JSON.parse(cached);
            } catch { }
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
