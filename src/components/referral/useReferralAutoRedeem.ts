'use client';

/**
 * src/components/referral/useReferralAutoRedeem.ts
 *
 * 초대 코드 자동 상환 훅.
 *
 * - 마운트 시: 현재 URL 의 ?ref= 코드를 localStorage 에 백업한다
 *   (초대 링크 /api/referral/invite 가 심어 둔 쿠키의 클라이언트 보조 경로).
 * - 로그인 상태가 되면: 보관된 코드가 있을 때 /api/referral/redeem 을 1회
 *   자동 호출한다.
 *   · 성공 → 1회성 안내 문구 반환 + 잔액 갱신 + 코드 폐기
 *   · 확정적 실패(400/404/409: 중복·본인 코드·무효 코드) → 조용히 폐기
 *   · 일시적 실패(네트워크/5xx) → 코드를 유지해 다음 방문 때 재시도
 *
 * 카카오 콜백은 서버 리다이렉트(/mypage)라 클라이언트 보관값을 직접 못 읽으므로,
 * 사용자가 로그인 후 도달하는 /mypage 의 ReferralCard 에서 이 훅이 실행된다.
 */

import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/app/analytics';
import { triggerBalanceUpdate } from '@/components/shop/JellyBalance';
import {
    captureReferralCodeFromLocation,
    clearPendingReferralCode,
    readPendingReferralCode,
} from '@/components/referral/referral-attribution';

export function useReferralAutoRedeem(isAuthenticated: boolean) {
    const [autoRedeemNotice, setAutoRedeemNotice] = useState<string | null>(null);
    const attemptedRef = useRef(false);

    // 유입 코드 백업 — 마운트 1회.
    useEffect(() => {
        captureReferralCodeFromLocation();
    }, []);

    // 로그인 완료 후 자동 상환 — 세션당 1회 시도.
    useEffect(() => {
        if (!isAuthenticated || attemptedRef.current) return;

        const code = readPendingReferralCode();
        if (!code) return;

        attemptedRef.current = true;
        let cancelled = false;

        (async () => {
            try {
                const response = await fetch('/api/referral/redeem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                });

                const payload = await response.json().catch(() => null);

                if (response.ok && payload?.success) {
                    clearPendingReferralCode();
                    if (!cancelled) {
                        const reward = Number(payload.newUserReward ?? 0);
                        setAutoRedeemNotice(
                            reward > 0
                                ? `친구 초대 코드가 자동 적용되었어요! 젤리 ${reward}개가 적립되었어요.`
                                : '친구 초대 코드가 자동 적용되었어요!'
                        );
                    }
                    triggerBalanceUpdate();
                    trackEvent('referral_complete', { method: 'auto_redeem' });
                    return;
                }

                // 확정적 실패(무효 코드·이미 상환·본인 코드)는 재시도 의미가 없으니
                // 조용히 폐기한다. 401/403(세션 문제)과 5xx/네트워크 오류는 코드를
                // 유지해 다음 방문에서 재시도한다.
                if (response.status === 400 || response.status === 404 || response.status === 409) {
                    clearPendingReferralCode();
                } else {
                    attemptedRef.current = false;
                }
            } catch {
                attemptedRef.current = false;
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    return { autoRedeemNotice };
}
