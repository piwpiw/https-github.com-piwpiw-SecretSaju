'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface KakaoShareOptions {
    title: string;
    description?: string;
    imageUrl?: string;
    linkUrl: string;
    buttonText?: string;
}

// Kakao global type is declared in kakao-auth.ts; type assertions below use `as any`

/**
 * useKakaoShare hook — loads Kakao SDK and fires Share.sendDefault
 */
export function useKakaoShare() {
    useEffect(() => {
        // Load Kakao SDK if not already loaded
        if (typeof window === 'undefined') return;
        if ((window as any).Kakao) return;

        const script = document.createElement('script');
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
            const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
            if ((window as any).Kakao && kakaoKey && !(window as any).Kakao.isInitialized()) {
                (window as any).Kakao.init(kakaoKey);
            }
        };
        document.head.appendChild(script);
    }, []);

    const share = (options: KakaoShareOptions) => {
        if (typeof window === 'undefined') return;

        trackEvent('kakao_share_clicked' as any, { title: options.title });

        if ((window as any).Kakao?.Share) {
            (window as any).Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: options.title,
                    description: options.description ?? '',
                    imageUrl: options.imageUrl ?? `${window.location.origin}/og-image.jpg`,
                    link: {
                        mobileWebUrl: options.linkUrl,
                        webUrl: options.linkUrl,
                    },
                },
                buttons: [
                    {
                        title: options.buttonText ?? '결과 보기',
                        link: {
                            mobileWebUrl: options.linkUrl,
                            webUrl: options.linkUrl,
                        },
                    },
                ],
            });
        } else {
            // Fallback: clipboard copy
            navigator.clipboard.writeText(options.linkUrl).catch(() => {});
        }
    };

    return { share };
}

/**
 * KakaoShareButton component
 */
interface KakaoShareButtonProps {
    title: string;
    description?: string;
    pillar?: string;
    element?: string;
    score?: number;
    profileName?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function KakaoShareButton({
    title,
    description,
    pillar,
    element,
    score,
    profileName,
    className = '',
    children,
}: KakaoShareButtonProps) {
    const { share } = useKakaoShare();

    const handleShare = () => {
        if (typeof window === 'undefined') return;

        const origin = window.location.origin;
        const ogParams = new URLSearchParams({
            name: profileName ?? '사주',
            ...(pillar ? { pillar } : {}),
            ...(element ? { element } : {}),
            ...(score !== undefined ? { score: String(score) } : {}),
        });
        const imageUrl = `${origin}/api/og?${ogParams.toString()}`;
        const linkUrl = window.location.href;

        share({
            title,
            description: description ?? '시크릿사주에서 나의 사주를 확인해 보세요!',
            imageUrl,
            linkUrl,
            buttonText: '내 사주 보기',
        });
    };

    return (
        <button
            type="button"
            onClick={handleShare}
            aria-label="카카오톡으로 공유"
            className={className}
        >
            {children ?? (
                <span className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.477 0 0 3.64 0 8.125c0 2.886 1.948 5.413 4.861 6.85l-1.042 3.853c-.083.306.224.556.505.411l4.508-2.327c.387.03.779.046 1.168.046 5.523 0 10-3.64 10-8.125S15.523 0 10 0z" fill="currentColor" />
                    </svg>
                    카카오 공유
                </span>
            )}
        </button>
    );
}
