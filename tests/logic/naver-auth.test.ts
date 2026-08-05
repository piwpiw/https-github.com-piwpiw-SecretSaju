/**
 * naver-auth.test.ts — 네이버 OAuth 순수 로직 가드
 *
 * 네트워크 없이 검증 가능한 부분만 잠근다:
 * 인가 URL 조립(파라미터 인코딩), 프로필 응답 파싱(resultcode 규약),
 * state 쿠키 상수의 안정성.
 */
import { describe, it, expect } from 'vitest';
import {
    NAVER_STATE_COOKIE,
    buildNaverAuthorizeUrl,
    parseNaverProfile,
} from '@/lib/auth/naver-auth';

describe('buildNaverAuthorizeUrl', () => {
    const base = {
        clientId: 'test-client-id',
        redirectUri: 'https://example.test/api/auth/naver/callback',
        state: 'abc-123',
    };

    it('필수 파라미터 4종을 전부 싣는다', () => {
        const url = new URL(buildNaverAuthorizeUrl(base));
        expect(url.origin + url.pathname).toBe('https://nid.naver.com/oauth2.0/authorize');
        expect(url.searchParams.get('response_type')).toBe('code');
        expect(url.searchParams.get('client_id')).toBe('test-client-id');
        expect(url.searchParams.get('redirect_uri')).toBe(base.redirectUri);
        expect(url.searchParams.get('state')).toBe('abc-123');
    });

    it('redirect_uri 의 특수문자를 안전하게 인코딩한다', () => {
        const raw = buildNaverAuthorizeUrl({ ...base, redirectUri: 'https://a.test/cb?x=1&y=2' });
        // 원문 & 가 쿼리 구분자로 새면 y=2 가 인가 URL 의 최상위 파라미터가 된다.
        expect(raw).not.toContain('redirect_uri=https://a.test/cb?x=1&y=2');
        expect(new URL(raw).searchParams.get('redirect_uri')).toBe('https://a.test/cb?x=1&y=2');
    });
});

describe('parseNaverProfile — 네이버 응답 규약', () => {
    const ok = {
        resultcode: '00',
        message: 'success',
        response: {
            id: 'naver-uid-1',
            nickname: '길동',
            email: 'gil@naver.com',
            profile_image: 'https://img.test/p.png',
        },
    };

    it('정상 응답을 파싱한다', () => {
        expect(parseNaverProfile(ok)).toEqual({
            id: 'naver-uid-1',
            nickname: '길동',
            email: 'gil@naver.com',
            profileImage: 'https://img.test/p.png',
        });
    });

    it('HTTP 200 이어도 resultcode 가 00 이 아니면 실패다', () => {
        expect(parseNaverProfile({ ...ok, resultcode: '024' })).toBeNull();
    });

    it('id 가 없으면 세션을 만들 수 없으므로 null', () => {
        expect(parseNaverProfile({ resultcode: '00', response: { nickname: 'x' } })).toBeNull();
    });

    it('nickname 이 없으면 name → 기본값 순으로 대체한다', () => {
        expect(parseNaverProfile({ resultcode: '00', response: { id: '1', name: '홍길동' } })?.nickname).toBe('홍길동');
        expect(parseNaverProfile({ resultcode: '00', response: { id: '1' } })?.nickname).toBe('Naver User');
    });

    it('null/문자열/빈 객체 입력에 던지지 않고 null 을 돌려준다', () => {
        expect(parseNaverProfile(null)).toBeNull();
        expect(parseNaverProfile('oops')).toBeNull();
        expect(parseNaverProfile({})).toBeNull();
    });
});

describe('세션 쿠키 계약', () => {
    it('state 쿠키 이름은 프로젝트 접두사를 따른다 (변경 시 진행 중 로그인 전부 실패)', () => {
        expect(NAVER_STATE_COOKIE).toBe('secretsaju_naver_oauth_state');
    });
});
