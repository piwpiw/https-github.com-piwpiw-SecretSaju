/* eslint-disable no-restricted-globals */
/**
 * Secret Saju 서비스워커 (App Router 호환, workbox 미사용 수작성).
 *
 * 캐시 정책 — src/lib/pwa/route-policy.ts 가 단일 원본이고, 아래
 * classifyRequest 는 그 로직의 사본이다 (SW 전역은 TS 모듈을 import 못 함).
 * 정책 변경 시 두 파일을 함께 수정하고 tests/logic/pwa-policy.test.ts 로 고정.
 *
 *  - /api/payment, /api/wallet, /api/auth : NetworkOnly (캐시 저장 금지)
 *  - /_next/static/, /_next/image, 이미지·폰트 등 정적 파일 : CacheFirst
 *  - 문서(HTML)·RSC·일반 API : NetworkFirst (최신 우선, 실패 시에만 캐시)
 *
 * 캐시 버전:
 *  - 정적 자산은 URL 에 콘텐츠 해시가 박혀 있어 배포마다 키를 갈 필요가 없다.
 *    SW_VERSION 은 "정책이 바뀌어 옛 캐시를 통째로 버려야 할 때"만 올린다.
 *  - 문서 캐시는 maxEntries 유사 로직으로 오래된 항목부터 정리한다.
 *  - skipWaiting + clients.claim 으로 새 배포가 즉시 활성화된다.
 */

const SW_VERSION = 'v1';
const STATIC_CACHE = `ss-static-${SW_VERSION}`;
const PAGE_CACHE = `ss-pages-${SW_VERSION}`;
const KNOWN_CACHES = [STATIC_CACHE, PAGE_CACHE];

const PAGE_CACHE_MAX_ENTRIES = 60;
const OFFLINE_URL = '/offline.html';

// ---- 정책 (route-policy.ts 사본) -------------------------------------------

// 리셋 페이지·워커 스크립트는 캐시 금지 — 캐시 문제의 탈출구가 캐시에 갇히면 안 된다
const NETWORK_ONLY_PREFIXES = ['/api/payment', '/api/wallet', '/api/auth', '/reset.html', '/sw.js', '/service-worker.js'];

const STATIC_EXT_RE =
  /\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|css|js|mp3|mp4|webm)$/i;

/**
 * @param {{ url: string, method?: string, origin?: string }} info
 * @returns {'CacheFirst' | 'NetworkFirst' | 'NetworkOnly'}
 */
function classifyRequest(info) {
  const method = (info.method || 'GET').toUpperCase();
  if (method !== 'GET') return 'NetworkOnly';

  let parsed;
  try {
    parsed = new URL(info.url);
  } catch {
    return 'NetworkOnly';
  }

  if (info.origin && parsed.origin !== info.origin) return 'NetworkOnly';

  const pathname = parsed.pathname;

  if (NETWORK_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    return 'NetworkOnly';
  }
  if (pathname.startsWith('/_next/static/')) return 'CacheFirst';
  if (pathname.startsWith('/_next/image')) return 'CacheFirst';
  if (pathname.startsWith('/api/')) return 'NetworkFirst';
  if (STATIC_EXT_RE.test(pathname)) return 'CacheFirst';
  return 'NetworkFirst';
}

// ---- 라이프사이클 -----------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // 오프라인 폴백 문서를 미리 담아 둔다.
      try {
        const cache = await caches.open(PAGE_CACHE);
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
      } catch {
        // 폴백 프리캐시 실패는 치명적이지 않다.
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 버전이 바뀐(또는 next-pwa 시절의) 옛 캐시를 정리한다.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !KNOWN_CACHES.includes(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// ---- 전략 구현 --------------------------------------------------------------

/** 캐시에 저장해도 되는 응답인지 (성공한 기본 응답만) */
function isCacheableResponse(response) {
  return (
    response &&
    response.status === 200 &&
    (response.type === 'basic' || response.type === 'default')
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheableResponse(response)) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

/** 문서 캐시가 무한히 자라지 않게 오래된 항목부터 지운다 (maxEntries 유사). */
async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  // Cache.keys() 는 삽입 순서를 보존하므로 앞쪽이 가장 오래된 항목이다.
  await Promise.all(
    keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)),
  );
}

async function networkFirst(request, { isNavigation }) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      cache.put(request, response.clone()).catch(() => {});
      trimCache(cache, PAGE_CACHE_MAX_ENTRIES).catch(() => {});
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (isNavigation) {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw error;
  }
}

// ---- fetch 라우팅 -----------------------------------------------------------

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const strategy = classifyRequest({
    url: request.url,
    method: request.method,
    origin: self.location.origin,
  });

  // NetworkOnly: respondWith 를 아예 호출하지 않아 브라우저 기본 동작에 맡긴다.
  // (결제·지갑·인증 응답이 Cache Storage 에 남을 경로 자체가 없다.)
  if (strategy === 'NetworkOnly') return;

  if (strategy === 'CacheFirst') {
    event.respondWith(cacheFirst(request));
    return;
  }

  const isNavigation =
    request.mode === 'navigate' || request.destination === 'document';
  event.respondWith(networkFirst(request, { isNavigation }));
});
