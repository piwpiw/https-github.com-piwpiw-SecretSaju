/**
 * PWA 서비스워커 캐시 정책 (요청 분류기).
 *
 * public/sw.js 는 워커 전역에서 실행되는 순수 JS 라 이 모듈을 import 할 수
 * 없다. 따라서 이 파일이 "정책의 단일 원본"이고, sw.js 의 classifyRequest 는
 * 여기 로직을 그대로 옮겨 적은 사본이다. 정책을 바꾸면 두 곳을 함께 고치고
 * tests/logic/pwa-policy.test.ts 로 고정하라.
 *
 * 정책 요약:
 * - NetworkOnly : 결제·지갑·인증 API — 캐시 저장 자체 금지 (stale 응답이
 *                 돈/세션을 깨뜨림). GET 이 아닌 요청, 타 오리진 요청도 포함.
 * - CacheFirst  : URL 해시가 박힌 불변 자산(/_next/static/), 이미지·폰트 등
 *                 정적 파일 — 한 번 받으면 영구 사용.
 * - NetworkFirst: 문서(HTML)·RSC·일반 API — 항상 최신을 먼저 시도하고,
 *                 네트워크 실패 시에만 캐시 폴백 ("배포해도 옛 화면" 방지).
 */

export type CacheStrategy = 'CacheFirst' | 'NetworkFirst' | 'NetworkOnly';

export interface RequestInfo {
  /** 요청 전체 URL (절대 URL) */
  url: string;
  /** HTTP 메서드. 기본 'GET' */
  method?: string;
  /** SW 가 돌고 있는 오리진. 지정 시 타 오리진 요청은 NetworkOnly */
  origin?: string;
}

/** 캐시 저장을 절대 금지하는 API 경로 접두사 (결제·지갑·인증) */
export const NETWORK_ONLY_PREFIXES = [
  '/api/payment',
  '/api/wallet',
  '/api/auth',
  // 기기 캐시 리셋 페이지·워커 스크립트는 어떤 캐시도 타면 안 된다 —
  // 캐시가 문제인 상황의 탈출구가 캐시에 갇히면 복구 수단이 사라진다.
  '/reset.html',
  '/sw.js',
  '/service-worker.js',
] as const;

/** CacheFirst 로 취급하는 정적 파일 확장자 */
export const STATIC_FILE_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'avif',
  'svg',
  'ico',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'css',
  'js',
  'mp3',
  'mp4',
  'webm',
] as const;

const STATIC_EXT_RE = new RegExp(
  `\\.(${STATIC_FILE_EXTENSIONS.join('|')})$`,
  'i',
);

/** 요청 하나를 CacheFirst / NetworkFirst / NetworkOnly 로 분류한다. */
export function classifyRequest(info: RequestInfo): CacheStrategy {
  const method = (info.method ?? 'GET').toUpperCase();
  if (method !== 'GET') return 'NetworkOnly';

  let parsed: URL;
  try {
    parsed = new URL(info.url);
  } catch {
    return 'NetworkOnly';
  }

  // 타 오리진(애널리틱스, CDN 스크립트 등)은 SW 가 관여하지 않는다.
  if (info.origin && parsed.origin !== info.origin) return 'NetworkOnly';

  const pathname = parsed.pathname;

  // 1) 결제·지갑·인증: 캐시 자체 금지
  if (NETWORK_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    return 'NetworkOnly';
  }

  // 2) 불변 해시 자산: 영구 CacheFirst
  if (pathname.startsWith('/_next/static/')) return 'CacheFirst';

  // next/image 최적화 결과 (쿼리에 원본 URL·폭·품질이 박혀 있어 키가 안정적)
  if (pathname.startsWith('/_next/image')) return 'CacheFirst';

  // 3) 일반 API: 최신 우선
  if (pathname.startsWith('/api/')) return 'NetworkFirst';

  // 4) 이미지·폰트 등 정적 파일: CacheFirst
  if (STATIC_EXT_RE.test(pathname)) return 'CacheFirst';

  // 5) 문서(HTML)·RSC·그 외 전부: 최신 우선, 실패 시에만 캐시
  return 'NetworkFirst';
}
