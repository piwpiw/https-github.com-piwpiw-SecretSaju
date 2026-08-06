/**
 * sipsong-palace.test.ts — 궁위×십성 70조합 전수 검사
 *
 * 7자리 × 10십성 전부에 대해: 비어 있지 않고, 자리·십성이 바뀌면 문장이
 * 반드시 달라지고, 템플릿 사고(undefined·이중 공백·조사 오류)가 없다.
 */
import { describe, it, expect } from 'vitest';
import type { Sipsong, SipsongResult } from '@/core/myeongni/sipsong';
import {
    PALACE_INFO,
    SIPSONG_CORE,
    buildSipsongPalaceReadings,
} from '@/lib/saju/sipsongPalace';

const ALL_SIPSONG: Sipsong[] = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
const POSITION_KEYS = Object.keys(PALACE_INFO) as Array<keyof SipsongResult>;

/** 7자리 전부를 같은 십성으로 채운 결과를 만든다 */
function uniformResult(tenGod: Sipsong): SipsongResult {
    return Object.fromEntries(POSITION_KEYS.map((key) => [key, tenGod])) as unknown as SipsongResult;
}

describe('궁위×십성 조합 전수 (70개)', () => {
    it('SipsongResult 의 7개 자리를 빠짐없이 다룬다', () => {
        expect(POSITION_KEYS.sort()).toEqual(
            ['yearStem', 'yearBranch', 'monthStem', 'monthBranch', 'dayBranch', 'hourStem', 'hourBranch'].sort(),
        );
        expect(ALL_SIPSONG.every((tenGod) => tenGod in SIPSONG_CORE)).toBe(true);
    });

    it('70개 조합 전부 비어 있지 않고 템플릿 사고가 없다', () => {
        const violations: string[] = [];
        const seen = new Set<string>();
        for (const tenGod of ALL_SIPSONG) {
            const readings = buildSipsongPalaceReadings(uniformResult(tenGod));
            expect(readings.length).toBe(7);
            for (const reading of readings) {
                const tag = `${reading.positionKey}/${tenGod}`;
                if (!reading.text.trim()) violations.push(`${tag}: 빈 문장`);
                if (/undefined|null|NaN|\[object Object\]/.test(reading.text)) violations.push(`${tag}: 누출`);
                if (/ {2,}/.test(reading.text)) violations.push(`${tag}: 이중 공백`);
                // "실질으로" 류의 ㄹ받침+으로 조사 오류 재유입 차단
                if (/[실질]으로/.test(reading.text)) violations.push(`${tag}: 조사 오류(으로)`);
                if (reading.text.length < 50) violations.push(`${tag}: 너무 짧음`);
                seen.add(reading.text);
            }
        }
        expect(violations, violations.slice(0, 5).join('\n')).toEqual([]);
        // 70개 조합이 전부 서로 다른 문장이어야 한다.
        expect(seen.size).toBe(70);
    });

    it('같은 십성이라도 자리가 다르면 문장이 다르다 (궁위가 실제로 반영됨)', () => {
        const readings = buildSipsongPalaceReadings(uniformResult('정관'));
        const texts = new Set(readings.map((reading) => reading.text));
        expect(texts.size).toBe(7);
        // 월지 문장에는 월지 궁위 설명이 실제로 들어간다.
        const monthBranch = readings.find((reading) => reading.positionKey === 'monthBranch');
        expect(monthBranch?.text).toContain('힘이 가장 큰 자리');
        expect(monthBranch?.text).toContain('정관');
    });

    it('입력 십성이 자리별로 다르면 각 자리에 그 십성이 정확히 반영된다', () => {
        const mixed: SipsongResult = {
            yearStem: '비견', yearBranch: '겁재', monthStem: '식신', monthBranch: '상관',
            dayBranch: '편재', hourStem: '정관', hourBranch: '정인',
        };
        const readings = buildSipsongPalaceReadings(mixed);
        for (const reading of readings) {
            expect(reading.tenGod).toBe(mixed[reading.positionKey]);
            expect(reading.text).toContain(reading.tenGod);
            expect(reading.text).toContain(reading.positionLabel);
        }
    });
});
