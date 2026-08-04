/**
 * launch-readiness.test.ts — 판매 개시 안전장치
 *
 * 유료 운영(FREE_LAUNCH = false)으로 전환하는 순간, 전자상거래법상 필수인
 * 사업자 정보가 자리표시자인 채로 나가면 법적 문제가 된다. 무료 기간에는
 * 자리표시자가 허용되지만, **유료 전환과 동시에 테스트가 실패**하게 만들어
 * 사고를 구조적으로 막는다.
 *
 * 이 파일이 빨간불이면: src/config/constants.ts 의 BUSINESS_INFO 를 실제
 * 사업자등록번호·대표자·주소·연락처로 교체하라. 절차는
 * docs/00-overview/launch-runbook.md 4절.
 */
import { describe, it, expect } from 'vitest';
import { BUSINESS_INFO, FREE_LAUNCH } from '@/config/constants';

/** 템플릿에 들어 있던 명백한 예시값 */
const PLACEHOLDER_PATTERNS: Array<[keyof typeof BUSINESS_INFO, RegExp]> = [
    ['REGISTRATION_NUMBER', /^123-45-67890$/],
    ['REPRESENTATIVE', /^Admin$/],
    ['ADDRESS', /Seoul,\s*Korea\s*\d+/],
    ['PHONE', /^070-1234-5678$/],
];

function findPlaceholders(): string[] {
    return PLACEHOLDER_PATTERNS
        .filter(([key, re]) => re.test(String(BUSINESS_INFO[key])))
        .map(([key]) => `${key}='${BUSINESS_INFO[key]}'`);
}

describe('판매 개시 안전장치 — 사업자 정보', () => {
    it('유료 운영 전환 시 자리표시자가 남아 있으면 실패한다', () => {
        const placeholders = findPlaceholders();

        if (FREE_LAUNCH) {
            // 무료 기간에는 허용 — 다만 무엇이 남았는지 기록으로 남긴다.
            expect(Array.isArray(placeholders)).toBe(true);
            return;
        }

        expect(
            placeholders,
            `유료 운영인데 사업자 정보가 자리표시자입니다: ${placeholders.join(', ')}. ` +
            '전자상거래법상 필수 표기이므로 실제 값으로 교체해야 판매할 수 있습니다 ' +
            '(docs/00-overview/launch-runbook.md 4절).'
        ).toEqual([]);
    });

    it('필수 표기 항목이 비어 있지 않다', () => {
        for (const key of ['NAME', 'REGISTRATION_NUMBER', 'REPRESENTATIVE', 'ADDRESS', 'EMAIL'] as const) {
            expect(String(BUSINESS_INFO[key]).trim().length, `${key} 가 비어 있음`).toBeGreaterThan(0);
        }
    });

    it('사업자등록번호가 형식(000-00-00000)을 지킨다', () => {
        expect(BUSINESS_INFO.REGISTRATION_NUMBER).toMatch(/^\d{3}-\d{2}-\d{5}$/);
    });
});
