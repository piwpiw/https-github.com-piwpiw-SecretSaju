/**
 * 대운·세운 회귀 테스트
 *
 * 대운 감사에서 손계산으로 교차검증한 케이스들을 고정한다.
 * 절입 시각은 저장소 엔진(VSOP87, KASI 대비 ±37초 검증)으로 구한다.
 *
 * 규약 (코드가 따르는 유파):
 * - 대운수 = 절입까지 일수 ÷ 3, 나머지 1.5일(6개월) 이상이면 올림, 0이면 1
 * - 나이는 세는나이 (태어난 해 = 1세)
 * - 세운의 해는 입춘에 바뀐다
 */
import { describe, it, expect } from 'vitest';
import {
    isDaewunForward,
    calculateDaewunStartAge,
    calculateDaewun,
    calculateSaewun,
    calculateSaewunForDate,
} from '@/core/myeongni/daewun';
import { SIXTY_GANJI, GanJi, FourPillars } from '@/core/calendar/ganji';

function ganji(fullName: string): GanJi {
    const found = SIXTY_GANJI.find(g => g.fullName === fullName);
    if (!found) throw new Error(`없는 간지: ${fullName}`);
    return found;
}

function pillars(y: string, m: string, d: string, h: string): FourPillars {
    return { year: ganji(y), month: ganji(m), day: ganji(d), hour: ganji(h) };
}

describe('대운 — 순행/역행 (양남음녀 순행)', () => {
    it('양간 연주 + 남자 = 순행, + 여자 = 역행', () => {
        expect(isDaewunForward('경', 'M')).toBe(true);
        expect(isDaewunForward('경', 'F')).toBe(false);
    });
    it('음간 연주 + 여자 = 순행, + 남자 = 역행', () => {
        expect(isDaewunForward('신', 'F')).toBe(true);
        expect(isDaewunForward('신', 'M')).toBe(false);
    });
});

describe('대운수 — 절입까지 일수 ÷ 3 (손계산 교차검증 케이스)', () => {
    // 1990-05-15 10:30 (경오년, 사월). 망종 1990-06-06 07:46 / 입하 1990-05-06 03:35
    const birth1990 = new Date(1990, 4, 15, 10, 30);

    it('1990-05-15 10:30 남자(순행): 망종까지 21.9일 → 대운수 7', () => {
        expect(calculateDaewunStartAge(birth1990, true)).toBe(7);
    });

    it('같은 출생 여자(역행): 입하까지 9.3일 → 대운수 3', () => {
        expect(calculateDaewunStartAge(birth1990, false)).toBe(3);
    });

    // 1987-02-03 23:30 — 입춘(2/4 17:51) 전날 밤
    const birth1987 = new Date(1987, 1, 3, 23, 30);

    it('입춘 직전 출생 순행: 절입까지 0.77일 → 0 승격 → 대운수 1', () => {
        expect(calculateDaewunStartAge(birth1987, true)).toBe(1);
    });

    it('입춘 직전 출생 역행: 소한까지 28.7일, 나머지 1.72 ≥ 1.5 올림 → 대운수 10', () => {
        expect(calculateDaewunStartAge(birth1987, false)).toBe(10);
    });
});

describe('대운 간지 — 월주 기점 60갑자 진행', () => {
    // 1990-05-15 남: 경오년 신사월 → 순행이면 임오·계미·갑신…
    const p = pillars('경오', '신사', '병술', '계사');

    it('순행: 월주 다음 간지부터 +1 씩', () => {
        const dw = calculateDaewun(new Date(1990, 4, 15, 10, 30), p, 'M');
        expect(dw.isForward).toBe(true);
        expect(dw.startAge).toBe(7);
        expect(dw.pillars.map(x => x.pillar.fullName).slice(0, 3)).toEqual(['임오', '계미', '갑신']);
        expect(dw.pillars[0].startAge).toBe(7);
        expect(dw.pillars[1].startAge).toBe(17);
        expect(dw.pillars).toHaveLength(9);
    });

    it('역행: 월주 직전 간지부터 -1 씩', () => {
        const dw = calculateDaewun(new Date(1990, 4, 15, 10, 30), p, 'F');
        expect(dw.isForward).toBe(false);
        expect(dw.startAge).toBe(3);
        expect(dw.pillars.map(x => x.pillar.fullName).slice(0, 3)).toEqual(['경진', '기묘', '무인']);
    });
});

describe('세운 — 입춘 경계', () => {
    it('달력 연도 라벨: 1984 갑자, 2026 병오', () => {
        expect(calculateSaewun(1984).fullName).toBe('갑자');
        expect(calculateSaewun(2026).fullName).toBe('병오');
    });

    it('입춘 전(2026-01-15)의 세운은 전년도 을사다', () => {
        // 수정 전에는 getFullYear() 를 그대로 써서 1/1~입춘 사이에
        // 한 해 앞선 세운(병오)을 보여줬다.
        expect(calculateSaewunForDate(new Date(2026, 0, 15)).fullName).toBe('을사');
    });

    it('입춘 후(2026-03-01)의 세운은 병오다', () => {
        expect(calculateSaewunForDate(new Date(2026, 2, 1)).fullName).toBe('병오');
    });
});
