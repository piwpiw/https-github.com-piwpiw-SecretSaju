'use client';

import { useEffect } from 'react';

/**
 * App Router 호환 서비스워커 등록 컴포넌트.
 *
 * next-pwa(v5) 는 pages/_document 에 등록 스크립트를 주입하는 방식이라 이
 * 프로젝트에서는 SW 가 한 번도 등록된 적이 없었다. 대신 public/sw.js 를
 * 직접 등록한다. production 빌드에서만 동작하고(개발 중 캐시 오염 방지),
 * 등록 실패는 앱 동작에 영향이 없으므로 조용히 무시한다.
 *
 * ── 좀비 워커 청소 (2026-08 실사고) ──────────────────────────────
 * 과거 CLI 로 배포된 옛 빌드의 서비스워커가 사용자 기기에 남아, 서버가
 * 새 버전으로 바뀐 뒤에도 캐시된 옛 앱을 계속 서빙했다 ("고쳐도 계속
 * 옛날 화면"). 옛 워커가 다른 스크립트 경로로 등록돼 있으면 갱신 검사
 * 자체가 404 로 실패해 영원히 남는다. 그래서 등록 전에:
 *   1. /sw.js 가 아닌 모든 등록을 강제 해제하고
 *   2. 우리 캐시 이름(ss-*)이 아닌 캐시를 페이지 컨텍스트에서 직접 지우고
 *   3. 새 워커가 제어권을 잡으면(controllerchange) 1회 자동 새로고침한다
 *      — 사용자가 손대지 않아도 두 번째 화면부터는 반드시 새 앱이다.
 */

/** public/sw.js 의 KNOWN_CACHES 와 같은 접두사를 유지해야 한다 */
const OUR_CACHE_PREFIX = 'ss-';
const RELOAD_GUARD_KEY = 'ss-sw-reloaded-once';

async function cleanupZombies() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) => {
          const scriptUrl =
            registration.active?.scriptURL ||
            registration.waiting?.scriptURL ||
            registration.installing?.scriptURL ||
            '';
          // 우리 워커(/sw.js)가 아니면 옛 빌드의 잔재다.
          return scriptUrl !== '' && !scriptUrl.endsWith('/sw.js');
        })
        .map((registration) => registration.unregister().catch(() => false)),
    );
  } catch {
    // 조회 실패는 무시 — 등록 단계가 이어서 진행된다.
  }

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(OUR_CACHE_PREFIX))
          .map((key) => caches.delete(key).catch(() => false)),
      );
    }
  } catch {
    // 캐시 삭제 실패도 치명적이지 않다 — SW activate 가 한 번 더 지운다.
  }
}

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // 옛 워커가 제어 중이던 페이지에서 새 워커가 제어권을 잡는 순간 1회만
    // 새로고침한다. sessionStorage 가드가 무한 새로고침을 막는다.
    const onControllerChange = () => {
      try {
        if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
        sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
      } catch {
        // sessionStorage 불가 환경이면 새로고침을 포기한다 (루프 위험 회피).
        return;
      }
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const register = async () => {
      await cleanupZombies();
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        // 브라우저의 자동 갱신 주기를 기다리지 않고 매 방문마다 갱신을 확인한다.
        registration.update().catch(() => {});
      } catch {
        // 등록 실패(비보안 컨텍스트, 브라우저 미지원 등)는 조용히 무시.
      }
    };

    if (document.readyState === 'complete') {
      void register();
    } else {
      const onLoad = () => void register();
      window.addEventListener('load', onLoad, { once: true });
      return () => {
        window.removeEventListener('load', onLoad);
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      };
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return null;
}
