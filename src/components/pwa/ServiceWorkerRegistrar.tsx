'use client';

import { useEffect } from 'react';

/**
 * App Router 호환 서비스워커 등록 컴포넌트.
 *
 * next-pwa(v5) 는 pages/_document 에 등록 스크립트를 주입하는 방식이라 이
 * 프로젝트에서는 SW 가 한 번도 등록된 적이 없었다. 대신 public/sw.js 를
 * 직접 등록한다. production 빌드에서만 동작하고(개발 중 캐시 오염 방지),
 * 등록 실패는 앱 동작에 영향이 없으므로 조용히 무시한다.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // 등록 실패(비보안 컨텍스트, 브라우저 미지원 등)는 조용히 무시.
      });
    };

    // 초기 렌더 경쟁을 피하려고 load 이후에 등록한다.
    if (document.readyState === 'complete') {
      register();
      return;
    }
    window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
