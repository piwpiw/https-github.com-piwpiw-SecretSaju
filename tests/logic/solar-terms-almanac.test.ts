/**
 * 절기 시각을 한국천문연구원 역서 원값과 대조한다.
 *
 * 이 프로젝트에서 가장 중요한 골든 테스트다. 월주 경계를 정하는 것은
 * 절(節) 열두 개이고, 연주 경계는 입춘 하나다. 여기가 틀리면 그 위에 얹은
 * 모든 해석이 다른 사람의 것이 된다.
 *
 * 예전에는 Meeus 25장 저차 급수를 써서 평균 3.6분 이르고 최대 7.8분까지
 * 어긋났다. VSOP87 절단 급수로 바꾼 뒤 평균 -1.8초, 최대 37초다.
 *
 * 남은 37초는 역서가 분 단위로 반올림돼 생기는 바닥이다. 18:21 로 적힌 값은
 * 18:20:30~18:21:30 어디든 될 수 있으므로 ±30초는 잴 수 없다.
 */

import { describe, it, expect } from 'vitest';
import {
    getAnnualSolarTerms,
    findSolarTermDate,
    SOLAR_TERM_UNCERTAINTY_MINUTES,
} from '@/core/astronomy/solar-terms';

/** 2024년 24절기 (한국천문연구원 역서, KST). [월, 일, 시, 분] */
const ALMANAC_2024: Record<string, [number, number, number, number]> = {
    소한: [1, 6, 5, 49], 대한: [1, 20, 23, 7], 입춘: [2, 4, 17, 27], 우수: [2, 19, 13, 13],
    경칩: [3, 5, 11, 23], 춘분: [3, 20, 12, 6], 청명: [4, 4, 16, 2], 곡우: [4, 19, 23, 0],
    입하: [5, 5, 9, 10], 소만: [5, 20, 22, 0], 망종: [6, 5, 13, 10], 하지: [6, 21, 5, 51],
    소서: [7, 6, 23, 20], 대서: [7, 22, 16, 44], 입추: [8, 7, 9, 9], 처서: [8, 22, 23, 55],
    백로: [9, 7, 12, 11], 추분: [9, 22, 21, 44], 한로: [10, 8, 4, 0], 상강: [10, 23, 7, 15],
    입동: [11, 7, 7, 20], 소설: [11, 22, 4, 56], 대설: [12, 7, 0, 17], 동지: [12, 21, 18, 21],
};

/** 역서가 분 단위라 ±30초는 잴 수 없다. 여유를 두어 60초를 상한으로 본다. */
const ALLOWED_SECONDS = 60;

describe('2024년 24절기 — 역서 대조', () => {
    const terms = getAnnualSolarTerms(2024);
    const errorsSeconds = new Map<string, number>();

    for (const term of terms) {
        const [month, day, hour, minute] = ALMANAC_2024[term.name];
        const reference = new Date(2024, month - 1, day, hour, minute);
        errorsSeconds.set(term.name, (term.date.getTime() - reference.getTime()) / 1000);
    }

    it('24개 절기가 모두 역서와 60초 안에 일치한다', () => {
        for (const [name, error] of Array.from(errorsSeconds.entries())) {
            expect(Math.abs(error), `${name} — ${error.toFixed(1)}초 차이`)
                .toBeLessThanOrEqual(ALLOWED_SECONDS);
        }
    });

    it('계통 오차가 없다 (평균이 10초 안)', () => {
        // 저차 급수 시절에는 평균 -215초로 한쪽으로만 쏠려 있었다.
        const values = Array.from(errorsSeconds.values());
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        expect(Math.abs(mean), `평균 ${mean.toFixed(1)}초`).toBeLessThan(10);
    });

    it('월주 경계를 정하는 절(節) 열두 개가 특히 정확하다', () => {
        // 중기(中氣)는 월주를 바꾸지 않는다. 절이 틀리면 사주 자체가 달라진다.
        const jeol = ['입춘', '경칩', '청명', '입하', '망종', '소서',
            '입추', '백로', '한로', '입동', '대설', '소한'];
        for (const name of jeol) {
            expect(Math.abs(errorsSeconds.get(name)!), `${name}`).toBeLessThanOrEqual(ALLOWED_SECONDS);
        }
    });

    it('선언한 오차 한계 안에 실측이 들어온다', () => {
        const maxSeconds = Math.max(...Array.from(errorsSeconds.values()).map(Math.abs));
        expect(maxSeconds / 60).toBeLessThanOrEqual(SOLAR_TERM_UNCERTAINTY_MINUTES);
    });
});

describe('다른 해의 입춘', () => {
    /** 연주 경계라서 가장 중요하다. [연도, 월, 일, 시, 분] */
    const LICHUN: Array<[number, number, number, number, number]> = [
        [2023, 2, 4, 11, 43],
        [2024, 2, 4, 17, 27],
        [2025, 2, 3, 23, 10],
    ];

    for (const [year, month, day, hour, minute] of LICHUN) {
        it(`${year}년 입춘이 역서와 일치한다`, () => {
            const computed = findSolarTermDate(315, year);
            const reference = new Date(year, month - 1, day, hour, minute);
            const errorSeconds = (computed.getTime() - reference.getTime()) / 1000;
            expect(Math.abs(errorSeconds), `${errorSeconds.toFixed(1)}초 차이`)
                .toBeLessThanOrEqual(ALLOWED_SECONDS);
        });
    }

    it('2025년 입춘은 2월 3일이다 (2월 4일이 아니다)', () => {
        // 해에 따라 하루 앞당겨진다. 이걸 놓치면 그날 태어난 사람의 연주가 통째로 틀린다.
        const computed = findSolarTermDate(315, 2025);
        expect(computed.getMonth() + 1).toBe(2);
        expect(computed.getDate()).toBe(3);
    });
});
