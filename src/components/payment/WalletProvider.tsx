'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getUserFromCookie } from '@/lib/auth/kakao-auth';
import { FREE_LAUNCH } from '@/config/constants';

const ADMIN_STORAGE_KEY = 'secret_paws_mock_admin';
const ADMIN_BALANCE_PREVIEW = 999999999;
const ADMIN_EMAILS = ['piwpiw@naver.com'];
const ADMIN_COOKIE_NAME = 'secret_paws_mock_admin';
const AUTH_SESSION_COOKIE_NAMES = ['sb-', 'auth-session'];

function hasCookieAdminFlag(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie
        .split('; ')
        .some((row) => row.startsWith(`${ADMIN_COOKIE_NAME}=`) && row.split('=')[1] === 'true');
}

function hasAuthSessionCookie(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie
        .split('; ')
        .some((row) => AUTH_SESSION_COOKIE_NAMES.some((prefix) => row.startsWith(prefix)));
}

/**
 * 무료 오픈 기간에 노출할 잔액.
 *
 * 소비 게이트가 두 가지 모양으로 흩어져 있다 — 어떤 화면은 `consumeChuru(n)`의
 * 반환값을 보고, 어떤 화면은 `churu < n` 을 직접 비교한다(예: `saju/page.tsx`,
 * `tojeong/page.tsx`). 그래서 소비를 no-op으로 만드는 것만으로는 부족하고,
 * 노출 잔액 자체가 어떤 요금보다도 커야 10곳 전부가 열린다.
 * 화면에는 숫자 대신 "무료"로 표시하므로(JellyBalance) 사용자가 이 값을
 * 실제 보유 젤리로 오해하지 않는다.
 */
const FREE_LAUNCH_BALANCE = 999999;

interface WalletContextType {
    isAdmin: boolean;
    /** 무료 오픈 기간 여부 — 잔액 배지 등 표시를 바꾸는 데 쓴다. */
    isFreeLaunch: boolean;
    churu: number; // Coins
    nyang: number; // Points
    addChuru: (amount: number) => void;
    consumeChuru: (amount: number) => boolean;
    addNyang: (amount: number) => void;
    consumeNyang: (amount: number) => boolean;
    syncIssue: {
        scope: 'wallet';
        code: string;
        summary: string;
        detail: string;
        severity: 'info' | 'warning' | 'error';
    } | null;
    clearSyncIssue: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [churu, setChuru] = useState(0);
    const [nyang, setNyang] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [syncIssue, setSyncIssue] = useState<WalletContextType['syncIssue']>(null);

    // 잔액의 동기적 진실 공급원. consumeChuru 가 렌더 클로저의 낡은 state 로
    // 검사하면 연타 시 같은 잔액을 두 번 통과시켜 이중 차감·음수가 가능했다.
    // 검사와 차감을 ref 에서 원자적으로 수행하고 state 는 표시용으로만 갱신한다.
    const churuRef = useRef(0);
    const nyangRef = useRef(0);
    const applyChuru = (next: number) => {
        churuRef.current = next;
        setChuru(next);
    };
    const applyNyang = (next: number) => {
        nyangRef.current = next;
        setNyang(next);
    };

    // Persistence & Server Sync
    useEffect(() => {
        // Optimistic UI from Local Storage
        const savedWallet = localStorage.getItem('secret_paws_wallet');
        if (savedWallet) {
            try {
                const { churu, nyang } = JSON.parse(savedWallet);
                applyChuru(churu);
                applyNyang(nyang);
            } catch (e) { }
        }

        // Mock Admin Check
        const mockAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
        const cookieAdmin = hasCookieAdminFlag();
        if (mockAdmin === 'true' || cookieAdmin) {
            setIsAdmin(true);
        }

        const cookieUser = getUserFromCookie();
        const email = cookieUser?.email?.toLowerCase();
        const hasAuthenticatedUser = Boolean(cookieUser?.id || email || hasAuthSessionCookie());
        if (email && ADMIN_EMAILS.includes(email)) {
            setIsAdmin(true);
        }

        // Verify with DB
        const controller = new AbortController();
        const fetchBalance = async () => {
            if (!hasAuthenticatedUser && mockAdmin !== 'true' && !cookieAdmin) {
                return;
            }
            try {
                const res = await fetch('/api/wallet/balance', { signal: controller.signal });
                if (res.ok) {
                    const data = await res.json();
                    if (data.balance !== undefined) {
                        applyChuru(data.balance);
                    }
                    if (data.isAdmin !== undefined) {
                        setIsAdmin((prev) => prev || data.isAdmin);
                    }
                    setSyncIssue(null);
                    return;
                }
                const detail = res.status === 401
                    ? '로그인 세션이 없어 지갑 잔액을 서버에서 가져오지 못했습니다.'
                    : `지갑 잔액 API가 ${res.status} 상태를 반환했습니다.`;
                setSyncIssue({
                    scope: 'wallet',
                    code: `WALLET_HTTP_${res.status}`,
                    summary: '지갑 잔액 동기화에 실패했습니다.',
                    detail,
                    severity: res.status >= 500 ? 'error' : 'warning',
                });
            } catch (err) {
                // Request was cancelled on unmount — expected, not an error.
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return;
                }
                // Network failure: silently fall back to the local wallet value
                // already loaded above. No console noise, no broken UI banner.
                setSyncIssue(null);
            }
        };

        fetchBalance();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        localStorage.setItem('secret_paws_wallet', JSON.stringify({ churu, nyang }));
    }, [churu, nyang]);

    const addChuru = (amount: number) => applyChuru(churuRef.current + amount);
    const consumeChuru = (amount: number) => {
        if (FREE_LAUNCH) return true; // 무료 오픈 기간 — 차감하지 않는다
        if (isAdmin) return true; // Admin bypass
        // ref 기준 검사→차감이 같은 동기 블록에서 끝나므로, 연타로 두 번
        // 호출돼도 두 번째 호출은 이미 차감된 잔액을 본다.
        if (churuRef.current < amount) return false;
        applyChuru(churuRef.current - amount);
        return true;
    };

    const addNyang = (amount: number) => applyNyang(nyangRef.current + amount);
    const consumeNyang = (amount: number) => {
        if (FREE_LAUNCH) return true;
        if (isAdmin) return true;
        if (nyangRef.current < amount) return false;
        applyNyang(nyangRef.current - amount);
        return true;
    };

    const visibleChuru = FREE_LAUNCH
        ? FREE_LAUNCH_BALANCE
        : isAdmin
            ? ADMIN_BALANCE_PREVIEW
            : churu;

    return (
        <WalletContext.Provider
            value={{
                churu: visibleChuru,
                nyang,
                addChuru,
                consumeChuru,
                addNyang,
                consumeNyang,
                isAdmin,
                isFreeLaunch: FREE_LAUNCH,
                syncIssue,
                clearSyncIssue: () => setSyncIssue(null),
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
