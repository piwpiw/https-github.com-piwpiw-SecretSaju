/**
 * 일간 강약(得令·得地·得勢) 점수 회귀 테스트
 *
 * 왜 이 테스트가 있는가:
 * 엔진의 정본 표기는 한글이다(`Stem = '갑'|'을'|...`, `Branch = '자'|'축'|...`).
 * 그런데 `advancedScoring.ts`의 점수 테이블(WANGSEONG_SCORE, SIBIIUNSEONG_TABLE)과
 * `CHEONGAN_TO_WUXING`은 한자 키를 쓴다. 표기 정규화가 빠지면 모든 조회가
 * undefined가 되어 득령·득지·득세가 전부 0이 되고, 합계 0 → 등급이 언제나
 * "신약"으로 고정된다. 실제로 그렇게 배포되어 있었고, 화면의 "멘탈 게이지"가
 * 모든 사용자에게 0으로 표시됐다.
 *
 * 조용히 망가지는 종류의 버그라서(값이 나오긴 하니까) 테스트로 못을 박는다.
 */
import { describe, it, expect } from 'vitest';
import { calculateGangYak } from '@/lib/saju/advancedScoring';
import type { FourPillars, Stem, Branch } from '@/core/calendar/ganji';

function pillars(
    year: [Stem, Branch],
    month: [Stem, Branch],
    day: [Stem, Branch],
    hour: [Stem, Branch],
): FourPillars {
    return {
        year: { stem: year[0], branch: year[1] },
        month: { stem: month[0], branch: month[1] },
        day: { stem: day[0], branch: day[1] },
        hour: { stem: hour[0], branch: hour[1] },
    } as FourPillars;
}

/** 갑목 일간이 인월(木旺)에 태어나고 목이 가득한, 교과서적인 신강 사주 */
const STRONG = pillars(['갑', '자'], ['병', '인'], ['갑', '인'], ['을', '묘']);

/** 경금 일간이 사월(火旺, 金死)에 태어난 신약 사주 */
const WEAK = pillars(['경', '오'], ['신', '사'], ['경', '신'], ['병', '자']);

describe('calculateGangYak — 한글/한자 표기 정규화', () => {
    it('한글 표기 사주에서 득령·득지·득세가 0으로 뭉개지지 않는다', () => {
        const score = calculateGangYak(STRONG);

        expect(score.deukryeong).toBeGreaterThan(0);
        expect(score.deukji).toBeGreaterThan(0);
        expect(score.deukse).toBeGreaterThan(0);
        expect(score.total).toBeGreaterThan(0);
    });

    it('월지 왕성도를 반영한다 — 인월의 갑목은 득령 만점', () => {
        expect(calculateGangYak(STRONG).deukryeong).toBe(30);
    });

    it('사월의 경금은 金死라 득령이 0이다 (0이 나올 수 있는 정상 경로)', () => {
        const score = calculateGangYak(WEAK);
        expect(score.deukryeong).toBe(0);
        // 득령만 0이고 나머지는 살아 있어야 한다. 셋 다 0이면 표기 버그의 재발이다.
        expect(score.deukji + score.deukse).toBeGreaterThan(0);
    });

    it('등급이 사주에 따라 달라진다 — 전부 "신약"으로 고정되지 않는다', () => {
        const levels = new Set(
            [
                STRONG,
                WEAK,
                pillars(['임', '신'], ['계', '해'], ['임', '자'], ['신', '유']),
                pillars(['무', '술'], ['기', '미'], ['무', '진'], ['정', '사']),
                pillars(['신', '유'], ['정', '유'], ['계', '미'], ['임', '술']),
            ].map((p) => calculateGangYak(p).level),
        );

        expect(levels.size).toBeGreaterThan(1);
        expect(levels.has('신강')).toBe(true);
    });

    it('점수는 각 항목의 상한을 넘지 않는다', () => {
        for (const p of [STRONG, WEAK]) {
            const s = calculateGangYak(p);
            expect(s.deukryeong).toBeLessThanOrEqual(30);
            expect(s.deukji).toBeLessThanOrEqual(30);
            expect(s.deukse).toBeLessThanOrEqual(40);
            expect(s.total).toBe(s.deukryeong + s.deukji + s.deukse);
        }
    });
});
