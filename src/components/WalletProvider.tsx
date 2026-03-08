'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserFromCookie } from '@/lib/kakao-auth';

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

interface WalletContextType {
    isAdmin: boolean;
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

    // Persistence & Server Sync
    useEffect(() => {
        // Optimistic UI from Local Storage
        const savedWallet = localStorage.getItem('secret_paws_wallet');
        if (savedWallet) {
            try {
                const { churu, nyang } = JSON.parse(savedWallet);
                setChuru(churu);
                setNyang(nyang);
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
        const fetchBalance = async () => {
            if (!hasAuthenticatedUser && mockAdmin !== 'true' && !cookieAdmin) {
                return;
            }
            try {
                const res = await fetch('/api/wallet/balance');
                if (res.ok) {
                    const data = await res.json();
                    if (data.balance !== undefined) {
                        setChuru(data.balance);
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
                console.error("Failed to sync wallet balance", err);
                setSyncIssue({
                    scope: 'wallet',
                    code: 'WALLET_FETCH_FAILED',
                    summary: '지갑 잔액 요청 중 네트워크 오류가 발생했습니다.',
                    detail: err instanceof Error ? err.message : '알 수 없는 fetch 오류',
                    severity: 'error',
                });
            }
        };

        fetchBalance();
    }, []);

    useEffect(() => {
        localStorage.setItem('secret_paws_wallet', JSON.stringify({ churu, nyang }));
    }, [churu, nyang]);

    const addChuru = (amount: number) => setChuru((prev) => prev + amount);
    const consumeChuru = (amount: number) => {
        if (isAdmin) return true; // Admin bypass
        if (churu >= amount) {
            setChuru((prev) => prev - amount);
            return true;
        }
        return false;
    };

    const addNyang = (amount: number) => setNyang((prev) => prev + amount);
    const consumeNyang = (amount: number) => {
        if (isAdmin) return true;
        if (nyang >= amount) {
            setNyang((prev) => prev - amount);
            return true;
        }
        return false;
    };

    const visibleChuru = isAdmin ? ADMIN_BALANCE_PREVIEW : churu;

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
