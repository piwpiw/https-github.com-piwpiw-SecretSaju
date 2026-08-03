/**
 * tests/routes/referral-invite-route.test.ts
 * 초대 링크 랜딩 (/api/referral/invite) — 쿠키 보관 + /?ref=CODE 리다이렉트
 */
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/referral/invite/route';
import { PENDING_REFERRAL_COOKIE } from '@/components/referral/referral-attribution';

describe('/api/referral/invite', () => {
    it('stores the code in a client-readable cookie and redirects to /?ref=CODE', async () => {
        const response = await GET(
            new NextRequest('http://localhost/api/referral/invite?ref=userabc234'),
        );

        expect(response.status).toBeGreaterThanOrEqual(300);
        expect(response.status).toBeLessThan(400);

        const location = new URL(response.headers.get('location') || '', 'http://localhost');
        expect(location.pathname).toBe('/');
        expect(location.searchParams.get('ref')).toBe('USERABC234');

        const setCookie = response.headers.get('set-cookie') || '';
        expect(setCookie).toContain(`${PENDING_REFERRAL_COOKIE}=USERABC234`);
        // 클라이언트(자동 상환 훅)가 읽어야 하므로 HttpOnly 가 아니어야 한다.
        expect(setCookie.toLowerCase()).not.toContain('httponly');
    });

    it('accepts the legacy code= parameter', async () => {
        const response = await GET(
            new NextRequest('http://localhost/api/referral/invite?code=USERZX9K2M'),
        );

        const location = new URL(response.headers.get('location') || '', 'http://localhost');
        expect(location.searchParams.get('ref')).toBe('USERZX9K2M');
        expect(response.headers.get('set-cookie') || '').toContain(
            `${PENDING_REFERRAL_COOKIE}=USERZX9K2M`,
        );
    });

    it('redirects to plain / without a cookie when the code is missing or invalid', async () => {
        const missing = await GET(new NextRequest('http://localhost/api/referral/invite'));
        const missingLocation = new URL(missing.headers.get('location') || '', 'http://localhost');
        expect(missingLocation.pathname).toBe('/');
        expect(missingLocation.searchParams.get('ref')).toBeNull();
        expect(missing.headers.get('set-cookie')).toBeNull();

        const invalid = await GET(
            new NextRequest('http://localhost/api/referral/invite?ref=%3Cscript%3E'),
        );
        const invalidLocation = new URL(invalid.headers.get('location') || '', 'http://localhost');
        expect(invalidLocation.searchParams.get('ref')).toBeNull();
        expect(invalid.headers.get('set-cookie')).toBeNull();
    });
});
