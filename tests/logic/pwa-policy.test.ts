/**
 * PWA 서비스워커 캐시 정책(요청 분류) 고정 테스트.
 *
 * src/lib/pwa/route-policy.ts 가 정책의 단일 원본이고 public/sw.js 는 그
 * 사본이다. 이 테스트는 원본을 고정하고, 마지막 describe 에서 sw.js 사본이
 * 원본과 동일한 분류를 내는지(경로 접두사·확장자 정규식 동기화) 검사한다.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import {
  classifyRequest,
  NETWORK_ONLY_PREFIXES,
  STATIC_FILE_EXTENSIONS,
} from '@/lib/pwa/route-policy';

const ORIGIN = 'https://secretsaju.example';
const url = (p: string) => `${ORIGIN}${p}`;
const classify = (p: string, method = 'GET') =>
  classifyRequest({ url: url(p), method, origin: ORIGIN });

describe('PWA 정책: NetworkOnly (캐시 저장 금지)', () => {
  it.each([
    '/api/payment',
    '/api/payment/verify',
    '/api/payment/checkout?orderId=1',
    '/api/wallet',
    '/api/wallet/balance',
    '/api/auth',
    '/api/auth/callback?code=abc',
  ])('결제·지갑·인증 경로 %s 는 NetworkOnly', (p) => {
    expect(classify(p)).toBe('NetworkOnly');
  });

  it('GET 이 아닌 요청은 경로와 무관하게 NetworkOnly', () => {
    expect(classify('/daily', 'POST')).toBe('NetworkOnly');
    expect(classify('/_next/static/chunks/main-abc123.js', 'PUT')).toBe('NetworkOnly');
    expect(classify('/api/persona', 'DELETE')).toBe('NetworkOnly');
  });

  it('타 오리진 요청은 NetworkOnly', () => {
    expect(
      classifyRequest({
        url: 'https://www.googletagmanager.com/gtag/js?id=G-XXX',
        origin: ORIGIN,
      }),
    ).toBe('NetworkOnly');
  });

  it('URL 파싱 불가 시 안전하게 NetworkOnly', () => {
    expect(classifyRequest({ url: 'not-a-url' })).toBe('NetworkOnly');
  });
});

describe('PWA 정책: CacheFirst (불변/정적 자산)', () => {
  it.each([
    '/_next/static/chunks/main-abc123.js',
    '/_next/static/css/app-def456.css',
    '/_next/static/media/noto-sans-kr.woff2',
    '/_next/image?url=%2Fhero.png&w=828&q=75',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/favicon.ico',
    '/grid.svg',
    '/tarot-decks/major/00-fool.webp',
    '/fonts/custom.woff2',
  ])('%s 는 CacheFirst', (p) => {
    expect(classify(p)).toBe('CacheFirst');
  });
});

describe('PWA 정책: NetworkFirst (최신 우선, 실패 시에만 캐시)', () => {
  it.each([
    '/',
    '/daily',
    '/saju/result',
    '/dreams?q=%EB%B1%80',
    '/daily?_rsc=1a2b3c', // RSC payload
    '/api/persona',
    '/api/og?name=Secret%20Saju',
    '/manifest.json',
    '/offline.html',
  ])('%s 는 NetworkFirst', (p) => {
    expect(classify(p)).toBe('NetworkFirst');
  });

  it('배포 직후 문서가 옛 화면으로 고정되지 않도록 문서는 절대 CacheFirst 가 아니다', () => {
    for (const p of ['/', '/daily', '/saju', '/mypage']) {
      expect(classify(p)).not.toBe('CacheFirst');
    }
  });
});

describe('sw.js 사본이 route-policy.ts 원본과 동기화되어 있다', () => {
  const swSource = readFileSync(
    path.resolve(__dirname, '../../public/sw.js'),
    'utf8',
  );

  it('NetworkOnly 접두사 목록이 sw.js 에 그대로 존재한다', () => {
    for (const prefix of NETWORK_ONLY_PREFIXES) {
      expect(swSource).toContain(`'${prefix}'`);
    }
  });

  it('정적 확장자 목록이 sw.js 정규식과 일치한다', () => {
    const match = swSource.match(/\/\\\.\((.+?)\)\$\/i/);
    expect(match).not.toBeNull();
    const swExts = match![1].split('|').sort();
    expect(swExts).toEqual([...STATIC_FILE_EXTENSIONS].sort());
  });

  it('sw.js 가 핵심 경로 규칙을 담고 있다', () => {
    expect(swSource).toContain("startsWith('/_next/static/')");
    expect(swSource).toContain("startsWith('/_next/image')");
    expect(swSource).toContain("startsWith('/api/')");
    expect(swSource).toContain('skipWaiting');
    expect(swSource).toContain('clients.claim');
    expect(swSource).toContain('/offline.html');
  });
});
