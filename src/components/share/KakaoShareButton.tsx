'use client';

import { useEffect, useRef } from 'react';
import { trackKakaoShareClick, trackKakaoShareComplete, trackShareComplete } from '@/lib/app/analytics';

interface KakaoShareOptions {
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl: string;
  buttonText?: string;
}

/**
 * useKakaoShare hook: loads Kakao SDK and fires Share.sendDefault
 */
export function useKakaoShare() {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeKakaoSdk = () => {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
      if ((window as any).Kakao && kakaoKey && !(window as any).Kakao.isInitialized()) {
        (window as any).Kakao.init(kakaoKey);
      }
    };

    if ((window as any).Kakao) {
      scriptLoadedRef.current = true;
      initializeKakaoSdk();
      return;
    }
    if (scriptLoadedRef.current) {
      return;
    }

    scriptLoadedRef.current = true;
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => {
      initializeKakaoSdk();
    };
    document.head.appendChild(script);
  }, []);

  const share = (options: KakaoShareOptions) => {
    if (typeof window === 'undefined') return;

    trackKakaoShareClick(options.title);

    if ((window as any).Kakao?.Share) {
      try {
        (window as any).Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: options.title,
            description: options.description ?? '',
            imageUrl: options.imageUrl ?? `${window.location.origin}/api/og?name=Secret%20Saju&locale=ko`,
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
        trackKakaoShareComplete('kakao');
        trackShareComplete('kakao');
      } catch {
        navigator.clipboard
          .writeText(options.linkUrl)
          .then(() => {
            trackKakaoShareComplete('clipboard');
            trackShareComplete('clipboard');
          })
          .catch(() => {
            trackShareComplete('link');
          });
      }
      return;
    }

    navigator.clipboard
      .writeText(options.linkUrl)
      .then(() => {
        trackKakaoShareComplete('clipboard');
        trackShareComplete('clipboard');
      })
      .catch(() => {
        trackShareComplete('link');
      });
  };

  return { share };
}

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
      name: profileName ?? '운명',
      ...(pillar ? { pillar } : {}),
      ...(element ? { element } : {}),
      ...(score !== undefined ? { score: String(score) } : {}),
    });
    const imageUrl = `${origin}/api/og?${ogParams.toString()}`;
    const linkUrl = window.location.href;

    share({
      title,
      description: description ?? '결과를 확인해보세요.',
      imageUrl,
      linkUrl,
      buttonText: '결과 보기',
    });
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="카카오 공유하기"
      className={className}
    >
      {children ?? (
        <span className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 0C4.477 0 0 3.64 0 8.125c0 2.886 1.948 5.413 4.861 6.85l-1.042 3.853c-.083.306.224.556.505.411l4.508-2.327c.387.03.779.046 1.168.046 5.523 0 10-3.64 10-8.125S15.523 0 10 0z"
              fill="currentColor"
            />
          </svg>
          카카오로 공유
        </span>
      )}
    </button>
  );
}
