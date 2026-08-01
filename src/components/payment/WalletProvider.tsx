'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FREE_LAUNCH } from '@/config/constants';
import {
    BALANCE_UPDATE_EVENT,
    addJelly as engineAddJelly,
    consumeJelly as engineConsumeJelly,
    getBalance,
    isAdminUser,
    isAuthenticatedUser,
    setCachedBalance,
} from '@/lib/payment/jelly-wallet';

interface WalletContextType {
    /** 표시용 젤리 잔액 — jelly-wallet 엔진(secret_paws_jelly_wallet)의 현재 값. */
    jelly: number;
    /** 무료 오픈 기간 여부 — 잔액 배지 등 표시를 바꾸는 데 쓴다. */
    isFreeLaunch: boolean;
    isAdmin: boolean;
    /** 젤리 적립 (환불/보상). reason 은 트랜잭션 히스토리에 남는다. */
    addJelly: (amount: number, reason: string) => void;
    /**
     * 젤리 차감. 무료 기간/관리자는 차감 없이 성공. 로그인 사용자는 서버가
     * 원자적으로 차감하고, 비로그인 사용자는 로컬 지갑에서 동기 차감한다.
     * 진행 중(in-flight)에는 후속 호출을 거부한다 — 연타 이중 차감 방지.
     */
    consumeJelly: (amount: number, purpose: string) => Promise<boolean>;
    /** 로컬 지갑 재읽기 + (로그인 시) 서버 잔액 재동기화. */
    refresh: () => void;
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
    // 잔액의 진실 공급원은 jelly-wallet 엔진이다. 이 state 는 표시용 미러이고,
    // 엔진의 모든 잔액 변경이 BALANCE_UPDATE_EVENT 를 쏘므로 그 이벤트로 재읽는다.
    const [jelly, setJelly] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [syncIssue, setSyncIssue] = useState<WalletContextType['syncIssue']>(null);

    // 서버 차감이 비동기라 state/ref 만으로는 연타 원자성을 만들 수 없다.
    // in-flight 가드: 진행 중이면 후속 consumeJelly 호출을 즉시 거부한다.
    const consumeInFlightRef = useRef(false);

    const readLocal = useCallback(() => {
        setJelly(getBalance());
    }, []);

    const syncFromServer = useCallback(async (signal?: AbortSignal) => {
        // 비로그인 + 비관리자는 서버 지갑이 없다 — 로컬 값이 곧 진실이다.
        if (!isAuthenticatedUser() && !isAdminUser()) return;
        try {
            const res = await fetch('/api/wallet/balance', { signal });
            if (res.ok) {
                const data = await res.json();
                if (data.isAdmin) {
                    setIsAdmin(true);
                }
                // configured:false(게스트/미구성)나 degraded:true(서버 장애 폴백)의
                // balance:0 으로 로컬 캐시를 덮어쓰지 않는다.
                if (
                    typeof data.balance === 'number' &&
                    data.configured !== false &&
                    data.degraded !== true
                ) {
                    setCachedBalance(data.balance);
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
            // Network failure: silently fall back to the local wallet value.
            // No console noise, no broken UI banner.
            setSyncIssue(null);
        }
    }, []);

    useEffect(() => {
        // 최초 로컬 읽기 — 엔진이 이 시점에 지갑 생성/웰컴 보너스/레거시(churu)
        // 마이그레이션을 수행한다.
        readLocal();
        setIsAdmin(isAdminUser());

        // 엔진의 모든 잔액 변경(JellyBalance 와 같은 이벤트)으로 재읽기 —
        // 두 UI 가 항상 같은 값을 보여준다.
        window.addEventListener(BALANCE_UPDATE_EVENT, readLocal);
        // 다른 탭에서의 변경도 반영.
        window.addEventListener('storage', readLocal);

        const controller = new AbortController();
        void syncFromServer(controller.signal);

        return () => {
            window.removeEventListener(BALANCE_UPDATE_EVENT, readLocal);
            window.removeEventListener('storage', readLocal);
            controller.abort();
        };
    }, [readLocal, syncFromServer]);

    const addJelly = useCallback((amount: number, reason: string) => {
        engineAddJelly(amount, reason);
        // 엔진이 이벤트를 쏘지만, 리스너 등록 전 호출 등 경계 상황을 위해 직접도 갱신.
        setJelly(getBalance());
    }, []);

    const consumeJelly = useCallback(async (amount: number, purpose: string) => {
        if (consumeInFlightRef.current) return false;
        consumeInFlightRef.current = true;
        try {
            const result = await engineConsumeJelly(amount, purpose);
            setJelly(getBalance());
            return result.success;
        } finally {
            consumeInFlightRef.current = false;
        }
    }, []);

    const refresh = useCallback(() => {
        readLocal();
        setIsAdmin(isAdminUser());
        void syncFromServer();
    }, [readLocal, syncFromServer]);

    return (
        <WalletContext.Provider
            value={{
                jelly,
                isFreeLaunch: FREE_LAUNCH,
                isAdmin,
                addJelly,
                consumeJelly,
                refresh,
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
