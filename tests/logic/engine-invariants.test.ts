/**
 * 사주 엔진 불변식.
 *
 * 이 엔진의 오류는 대부분 예외를 던지지 않는다. 그럴듯한 값을 조용히 낸다.
 * 60갑자 지지 오행이 60개 중 52개에서 틀렸을 때도, 계(癸) 천간 오행이
 * undefined 였을 때도 아무것도 터지지 않았다. 그래서 값 하나하나를 확인하는
 * 대신 **불변식**을 대조한다.
 */

import { describe, it, expect } from 'vitest';
import {
    SIXTY_GANJI,
    STEMS,
    BRANCHES,
    getGanJiIndex,
    getJaSiStartMinutes,
    getDayPillar,
    getMonthPillar,
    getHourPillar,
    getYearPillar,
} from '@/core/calendar/ganji';
import { getJasiTypeAt, handleJasiLogic } from '@/core/calendar/yajasi';
import {
    calculateSolarLongitude,
    dateToJulianDay,
    findSolarTermDate,
    getAnnualSolarTerms,
    getSolarTermProximity,
    SOLAR_TERM_UNCERTAINTY_MINUTES,
} from '@/core/astronomy/solar-terms';
import {
    getCardinalJDE,
    getDeltaTSeconds,
    CARDINAL_LONGITUDE,
    type CardinalPoint,
} from '@/core/astronomy/equinox-reference';

const KST_OFFSET_DAYS = 9 / 24;

describe('60갑자 구성', () => {
    it('천간은 10주기, 지지는 12주기로 돈다', () => {
        SIXTY_GANJI.forEach((g, i) => {
            expect(g.stemIndex).toBe(i % 10);
            expect(g.branchIndex).toBe(i % 12);
            expect(g.fullName).toBe(`${STEMS[i % 10]}${BRANCHES[i % 12]}`);
        });
    });

    it('60개가 모두 서로 다르다', () => {
        expect(new Set(SIXTY_GANJI.map((g) => g.fullName)).size).toBe(60);
    });

    it('getGanJiIndex 는 60개 전부를 제자리로 되돌린다', () => {
        SIXTY_GANJI.forEach((g, i) => {
            expect(getGanJiIndex(g.stemIndex, g.branchIndex)).toBe(i);
        });
    });

    it('홀짝이 어긋난 조합은 undefined 가 아니라 예외를 던진다', () => {
        // 갑(0)술(10) 은 짝이 맞지만 갑(0)축(1) 은 존재하지 않는다
        expect(() => getGanJiIndex(0, 1)).toThrow();
        expect(() => getGanJiIndex(1, 0)).toThrow();
        expect(getGanJiIndex(0, 10)).toBe(10); // 갑술
    });
});

describe('일주 — 율리우스 적일과의 관계', () => {
    /** 그레고리력 날짜의 율리우스 적일수 (정오 기준 정수) */
    function jdn(y: number, m: number, d: number): number {
        const a = Math.floor((14 - m) / 12);
        const y2 = y + 4800 - a;
        const m2 = m + 12 * a - 3;
        return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2
            + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
    }

    it('1900~2100년 모든 날에서 (JDN + 49) mod 60 과 일치한다', () => {
        let checked = 0;
        let mismatch: string | null = null;

        const cursor = new Date(1900, 0, 1);
        const end = new Date(2101, 0, 1);
        while (cursor < end) {
            const expected = (jdn(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate()) + 49) % 60;
            const actual = getDayPillar(cursor).ganjiIndex;
            if (actual !== expected && !mismatch) {
                mismatch = `${cursor.toDateString()}: 기대 ${expected}, 실제 ${actual}`;
            }
            checked += 1;
            cursor.setDate(cursor.getDate() + 1);
        }

        expect(mismatch).toBeNull();
        expect(checked).toBeGreaterThan(73_000);
    });

    it('연속한 이틀은 간지가 한 칸씩 이어진다', () => {
        const a = getDayPillar(new Date(1987, 6, 29));
        const b = getDayPillar(new Date(1987, 6, 30));
        expect(b.ganjiIndex).toBe((a.ganjiIndex + 1) % 60);
    });
});

describe('월주 — 오호둔(五虎遁)', () => {
    it('연간에 따라 인월(寅月)의 천간이 정해진다', () => {
        // 갑·기 → 병인, 을·경 → 무인, 병·신 → 경인, 정·임 → 임인, 무·계 → 갑인
        const expected: Record<number, string> = {
            0: '병', 5: '병',   // 갑 기
            1: '무', 6: '무',   // 을 경
            2: '경', 7: '경',   // 병 신
            3: '임', 8: '임',   // 정 임
            4: '갑', 9: '갑',   // 무 계
        };
        for (const [yearStem, monthStem] of Object.entries(expected)) {
            // 인월 한가운데(경칩 전, 입춘 후)인 3월 1일로 확인
            const pillar = getMonthPillar(new Date(2024, 1, 20), Number(yearStem));
            expect(pillar.branch).toBe('인');
            expect(pillar.stem).toBe(monthStem);
        }
    });
});

describe('시주 — 오자둔(五子遁)과 경계', () => {
    it('일간에 따라 자시의 천간이 정해진다', () => {
        // 갑·기 → 갑자, 을·경 → 병자, 병·신 → 무자, 정·임 → 경자, 무·계 → 임자
        const expected: Record<number, string> = {
            0: '갑', 5: '갑', 1: '병', 6: '병', 2: '무',
            7: '무', 3: '경', 8: '경', 4: '임', 9: '임',
        };
        for (const [dayStem, hourStem] of Object.entries(expected)) {
            const pillar = getHourPillar(new Date(2024, 0, 1, 0, 30), Number(dayStem), 'kst-civil');
            expect(pillar.branch).toBe('자');
            expect(pillar.stem).toBe(hourStem);
        }
    });

    it('경계 기준에 따라 자시 시작이 30분 다르다', () => {
        expect(getJaSiStartMinutes('true-solar')).toBe(23 * 60);
        expect(getJaSiStartMinutes('kst-civil')).toBe(23 * 60 + 30);
    });

    it('KST 기준에서 23:15 는 아직 해시다', () => {
        expect(getHourPillar(new Date(2024, 0, 1, 23, 15), 0, 'kst-civil').branch).toBe('해');
        expect(getHourPillar(new Date(2024, 0, 1, 23, 45), 0, 'kst-civil').branch).toBe('자');
    });

    it('진태양시 기준에서 23:15 는 이미 자시다', () => {
        expect(getHourPillar(new Date(2024, 0, 1, 23, 15), 0, 'true-solar').branch).toBe('자');
    });

    it('12지시가 두 시간씩 빠짐없이 덮인다', () => {
        const seen = new Map<string, number>();
        for (let minutes = 0; minutes < 1440; minutes += 1) {
            const d = new Date(2024, 0, 1, Math.floor(minutes / 60), minutes % 60);
            const branch = getHourPillar(d, 0, 'true-solar').branch;
            seen.set(branch, (seen.get(branch) ?? 0) + 1);
        }
        expect(seen.size).toBe(12);
        for (const count of Array.from(seen.values())) expect(count).toBe(120);
    });
});

describe('야자시 — 경계와 판정이 같은 기준을 쓴다', () => {
    it('KST 기준 23:00~23:29 는 야자시가 아니다 (아직 해시)', () => {
        expect(getJasiTypeAt(new Date(2024, 0, 1, 23, 0), 'kst-civil')).toBe('normal');
        expect(getJasiTypeAt(new Date(2024, 0, 1, 23, 29), 'kst-civil')).toBe('normal');
        expect(getJasiTypeAt(new Date(2024, 0, 1, 23, 30), 'kst-civil')).toBe('yajasi');
    });

    it('진태양시 기준 23:00 은 야자시다', () => {
        expect(getJasiTypeAt(new Date(2024, 0, 1, 23, 0), 'true-solar')).toBe('yajasi');
    });

    it('자정 이후 자시는 조자시다', () => {
        expect(getJasiTypeAt(new Date(2024, 0, 1, 0, 30), 'kst-civil')).toBe('jojasi');
        expect(getJasiTypeAt(new Date(2024, 0, 1, 1, 29), 'kst-civil')).toBe('jojasi');
        expect(getJasiTypeAt(new Date(2024, 0, 1, 1, 30), 'kst-civil')).toBe('normal');
    });

    it('해시 시각의 시주 천간은 그날 일간에서 뽑는다', () => {
        // 예전 결함: 23:15 를 야자시로 보고 다음 날 일간을 써서 천간이 두 칸 밀렸다
        const at2315 = new Date(2024, 0, 1, 23, 15);
        const result = handleJasiLogic(at2315, true, 'kst-civil');
        const sameDayStem = getDayPillar(at2315).stemIndex;

        expect(result.type).toBe('normal');
        expect(result.hourStemStemIndexUsed).toBe(sameDayStem);
        expect(result.hourPillar.branch).toBe('해');
    });

    it('야자시는 일주가 그날, 시주 천간은 다음 날 일간', () => {
        const at2345 = new Date(2024, 0, 1, 23, 45);
        const result = handleJasiLogic(at2345, true, 'kst-civil');
        const today = getDayPillar(at2345);
        const tomorrow = getDayPillar(new Date(2024, 0, 2, 12, 0));

        expect(result.type).toBe('yajasi');
        expect(result.dayPillar.ganjiIndex).toBe(today.ganjiIndex);
        expect(result.hourStemStemIndexUsed).toBe(tomorrow.stemIndex);
        expect(result.hourPillar.branch).toBe('자');
    });

    it('야자시 미적용이면 자시도 그날 일간으로 통일된다', () => {
        const at2345 = new Date(2024, 0, 1, 23, 45);
        const result = handleJasiLogic(at2345, false, 'kst-civil');
        expect(result.hourStemStemIndexUsed).toBe(getDayPillar(at2345).stemIndex);
        expect(result.hourPillar.branch).toBe('자');
    });
});

describe('연주 — 입춘 경계', () => {
    it('입춘 전은 전년도 간지를 쓴다', () => {
        const lichun2024 = findSolarTermDate(315, 2024);
        const before = new Date(lichun2024.getTime() - 6 * 3600_000);
        const after = new Date(lichun2024.getTime() + 6 * 3600_000);
        expect(getYearPillar(before).ganjiIndex).toBe((getYearPillar(after).ganjiIndex + 59) % 60);
    });

    it('1984년은 갑자년이다', () => {
        expect(getYearPillar(new Date(1984, 5, 15)).fullName).toBe('갑자');
    });
});

describe('절기 — 독립 기준값과의 대조', () => {
    const POINTS: CardinalPoint[] = [
        'march-equinox', 'june-solstice', 'september-equinox', 'december-solstice',
    ];
    const YEARS = [1900, 1930, 1950, 1970, 1984, 2000, 2010, 2024, 2025, 2030, 2050, 2080, 2100];

    /**
     * 저차 급수의 오차를 측정한다. 이 테스트의 목적은 "정확하다"를 증명하는 게
     * 아니라 **오차가 커지지 않았음**을 보장하는 것이다. 급수를 건드리는 변경은
     * 여기서 수치로 정당화되어야 한다.
     */
    it('분점·지점 오차가 선언한 한계를 넘지 않는다', () => {
        let maxErrorMinutes = 0;
        let worst = '';

        for (const year of YEARS) {
            for (const point of POINTS) {
                const referenceUT = getCardinalJDE(point, year) - getDeltaTSeconds(year) / 86400;
                const engineKST = findSolarTermDate(CARDINAL_LONGITUDE[point], year);
                const engineUT = dateToJulianDay(engineKST) - KST_OFFSET_DAYS;

                const errorMinutes = Math.abs(engineUT - referenceUT) * 1440;
                if (errorMinutes > maxErrorMinutes) {
                    maxErrorMinutes = errorMinutes;
                    worst = `${year} ${point}: ${errorMinutes.toFixed(2)}분`;
                }
            }
        }

        // Meeus 27장 자체의 공표 정확도가 약 51초다. 그보다 좁게 요구할 수 없다.
        expect(maxErrorMinutes, `가장 큰 편차 — ${worst}`).toBeLessThanOrEqual(1.5);
    });

    it('반환한 시각의 태양 황경이 목표 황경과 일치한다', () => {
        for (const year of [1950, 2000, 2024, 2100]) {
            for (const term of getAnnualSolarTerms(year)) {
                const jd = dateToJulianDay(term.date) - KST_OFFSET_DAYS;
                let diff = calculateSolarLongitude(jd) - term.longitude;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;
                // 이분 탐색은 0.086초까지 좁히지만, 반환하는 Date 가 초 단위로
                // 잘리므로 왕복 오차의 바닥은 1초(=1.14e-5도)다.
                expect(Math.abs(diff), `${year} ${term.name}`).toBeLessThan(0.00002);
            }
        }
    });

    it('24절기가 황경 15도 간격으로 한 해에 한 번씩 온다', () => {
        const terms = getAnnualSolarTerms(2024);
        expect(terms).toHaveLength(24);
        expect(new Set(terms.map((t) => t.longitude)).size).toBe(24);
        for (const t of terms) expect(t.longitude % 15).toBe(0);
    });
});

describe('절기 경계 근접 판정', () => {
    it('절입 직전은 오차 한계 안으로 잡힌다', () => {
        const lichun = findSolarTermDate(315, 2024);
        const justBefore = new Date(lichun.getTime() - 1 * 60_000);
        const proximity = getSolarTermProximity(justBefore);

        expect(proximity.term.name).toBe('입춘');
        expect(proximity.withinUncertainty).toBe(true);
        expect(proximity.isMonthBoundary).toBe(true);
        expect(proximity.minutesFromBoundary).toBeCloseTo(1, 0);
    });

    it('한계 밖(5분)은 더 이상 경고 대상이 아니다', () => {
        // 저차 급수를 쓰던 시절에는 ±12분이라 5분도 경고 대상이었다.
        // VSOP87 로 바꾼 뒤 한계가 2분으로 좁아졌다.
        const lichun = findSolarTermDate(315, 2024);
        const fiveMinutesBefore = new Date(lichun.getTime() - 5 * 60_000);
        expect(getSolarTermProximity(fiveMinutesBefore).withinUncertainty).toBe(false);
    });

    it('절입에서 멀면 한계 밖이다', () => {
        const lichun = findSolarTermDate(315, 2024);
        const wellAfter = new Date(lichun.getTime() + 3 * 24 * 3600_000);
        expect(getSolarTermProximity(wellAfter).withinUncertainty).toBe(false);
    });

    it('중기(中氣)는 월주 경계가 아니다', () => {
        const chunbun = findSolarTermDate(0, 2024); // 춘분
        const proximity = getSolarTermProximity(new Date(chunbun.getTime() + 60_000));
        expect(proximity.term.name).toBe('춘분');
        expect(proximity.isMonthBoundary).toBe(false);
    });
});

describe('ΔT', () => {
    it('2024년 값이 실제 관측치에 가깝다 (약 69초)', () => {
        expect(getDeltaTSeconds(2024)).toBeGreaterThan(65);
        expect(getDeltaTSeconds(2024)).toBeLessThan(74);
    });

    it('1960년 이후로는 단조 증가한다', () => {
        // 1930~1945년에는 지구 자전이 실제로 살짝 빨라져 ΔT 가 정체·감소했다.
        // 그 구간까지 단조 증가를 요구하면 물리를 잘못 가정하는 것이다.
        for (let y = 1965; y <= 2045; y += 5) {
            expect(getDeltaTSeconds(y), `${y}년`).toBeGreaterThan(getDeltaTSeconds(y - 5));
        }
    });

    it('한 세기에 걸쳐 크게 늘어난다 (1900년 약 0초 → 2000년 약 64초)', () => {
        expect(getDeltaTSeconds(1900)).toBeLessThan(5);
        expect(getDeltaTSeconds(2000)).toBeGreaterThan(60);
        expect(getDeltaTSeconds(2000)).toBeLessThan(68);
    });

    it('구간 경계에서 값이 튀지 않는다', () => {
        // 다항식이 구간별로 갈리므로 경계에서 불연속이 생기기 쉽다
        for (const boundary of [1920, 1941, 1961, 1986, 2005, 2050]) {
            const before = getDeltaTSeconds(boundary - 0.01);
            const after = getDeltaTSeconds(boundary + 0.01);
            expect(Math.abs(after - before), `${boundary}년 경계`).toBeLessThan(2);
        }
    });
});
