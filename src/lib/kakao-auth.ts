'use client';

import { KAKAO_CONFIG, STORAGE_KEYS } from '@/config';

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
export function getUserFromCookie(): { id: number; nickname: string; email?: string } | null {
    if (typeof window === 'undefined') return null;

    const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${STORAGE_KEYS.USER_DATA}=`));

    if (!userCookie) return null;

    try {
        return JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
    } catch {
        return null;
    }
}

/**
 * Clear user session
 */
export function clearUserSession() {
    if (typeof window === 'undefined') return;

    document.cookie = `${STORAGE_KEYS.KAKAO_TOKEN}=; Max-Age=0; path=/`;
    document.cookie = `${STORAGE_KEYS.USER_DATA}=; Max-Age=0; path=/`;
    logoutKakao();
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
    return getUserFromCookie() !== null;
}
