'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

/**
 * PostHog 제품 분석.
 *
 * `NEXT_PUBLIC_POSTHOG_KEY` 가 없으면 완전한 no-op — SDK 초기화조차 하지
 * 않는다 (개발/미설정 환경에서 네트워크 요청 0). 키는 phc_ 로 시작하는
 * 공개 클라이언트 토큰으로, 노출되어도 안전한 설계다 (쓰기 전용).
 *
 * App Router 는 SPA 네비게이션이라 pageview 를 자동 수집하지 못한다 —
 * pathname 변화를 구독해 수동으로 capture 한다.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

function ensureInit() {
    if (initialized || !POSTHOG_KEY || typeof window === 'undefined') return;
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // 라우터 구독으로 수동 수집
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
    });
    initialized = true;
}

function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!POSTHOG_KEY || !pathname) return;
        ensureInit();
        // 개인정보가 실릴 수 있는 쿼리(토큰·초대코드)는 경로만 남긴다
        posthog.capture('$pageview', { $current_url: window.location.origin + pathname });
        // searchParams 는 pageview 재발화 트리거로만 사용
        void searchParams;
    }, [pathname, searchParams]);

    return null;
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        ensureInit();
    }, []);

    return (
        <>
            {/* useSearchParams 는 Suspense 경계가 필요하다 (Next 정적 렌더 규칙) */}
            <Suspense fallback={null}>
                <PageViewTracker />
            </Suspense>
            {children}
        </>
    );
}
