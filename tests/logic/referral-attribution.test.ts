/**
 * tests/logic/referral-attribution.test.ts
 * 초대 코드 유입 보관 헬퍼 (순수 함수부) 테스트
 */
import { describe, expect, it } from 'vitest';
import {
    PENDING_REFERRAL_COOKIE,
    extractReferralCodeFromSearch,
    normalizePendingReferralCode,
    parsePendingReferralCookie,
} from '@/components/referral/referral-attribution';

describe('normalizePendingReferralCode', () => {
    it('trims and uppercases a valid code', () => {
        expect(normalizePendingReferralCode('  userAbc234 ')).toBe('USERABC234');
    });

    it('accepts the generated USER{6} format', () => {
        expect(normalizePendingReferralCode('USERZX9K2M')).toBe('USERZX9K2M');
    });

    it('rejects non-strings, empty and malformed values', () => {
        expect(normalizePendingReferralCode(undefined)).toBeNull();
        expect(normalizePendingReferralCode(null)).toBeNull();
        expect(normalizePendingReferralCode(123 as unknown as string)).toBeNull();
        expect(normalizePendingReferralCode('')).toBeNull();
        expect(normalizePendingReferralCode('ab')).toBeNull(); // 너무 짧음
        expect(normalizePendingReferralCode('A'.repeat(25))).toBeNull(); // 너무 김
        expect(normalizePendingReferralCode('CODE WITH SPACE')).toBeNull();
        expect(normalizePendingReferralCode('<script>')).toBeNull();
    });
});

describe('extractReferralCodeFromSearch', () => {
    it('extracts ?ref= from a query string', () => {
        expect(extractReferralCodeFromSearch('?ref=USERABC234')).toBe('USERABC234');
    });

    it('extracts ref among other params and normalizes case', () => {
        expect(extractReferralCodeFromSearch('?utm_source=kakao&ref=userabc234')).toBe('USERABC234');
    });

    it('returns null when ref is missing or invalid', () => {
        expect(extractReferralCodeFromSearch('')).toBeNull();
        expect(extractReferralCodeFromSearch('?foo=bar')).toBeNull();
        expect(extractReferralCodeFromSearch('?ref=')).toBeNull();
        expect(extractReferralCodeFromSearch('?ref=%3Cscript%3E')).toBeNull();
    });
});

describe('parsePendingReferralCookie', () => {
    it('reads the pending referral cookie', () => {
        const header = `foo=bar; ${PENDING_REFERRAL_COOKIE}=USERABC234; baz=1`;
        expect(parsePendingReferralCookie(header)).toBe('USERABC234');
    });

    it('decodes URI-encoded values', () => {
        const header = `${PENDING_REFERRAL_COOKIE}=${encodeURIComponent('userabc234')}`;
        expect(parsePendingReferralCookie(header)).toBe('USERABC234');
    });

    it('returns null when the cookie is absent or invalid', () => {
        expect(parsePendingReferralCookie('')).toBeNull();
        expect(parsePendingReferralCookie('foo=bar')).toBeNull();
        expect(parsePendingReferralCookie(`${PENDING_REFERRAL_COOKIE}=%%bad%%`)).toBeNull();
    });
});
