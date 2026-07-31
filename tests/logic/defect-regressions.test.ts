/**
 * 결함 수정 회귀 테스트
 *
 * 실제로 틀린 결과를 내던 세 결함을 고정한다. 각 테스트는 수정 전 코드에서
 * 실패하는 것을 확인한 뒤 작성했다.
 *
 * 1. 십성 — 지지 申 을 천간 辛 으로 읽어 음양이 뒤집히던 문제
 * 2. 궁합 — 합·충 표가 껍데기라 갑기합이 보통, 동일 일주가 최고로 나오던 문제
 * 3. 오행 정규화 — 반올림 후 합이 100 이 아니면 20/20/20/20/20 으로
 *    떨어지던 문제
 */
import { describe, it, expect } from 'vitest';
import { calculateOneSipsong, analyzeSipsong } from '@/core/myeongni/sipsong';
import { SIXTY_GANJI, GanJi, Stem } from '@/core/calendar/ganji';
import { analyzeRelationship } from '@/lib/saju/compatibility';
import { calculateHighPrecisionSaju, HighPrecisionSajuResult, ElementAnalysisResult } from '@/core/api/saju-engine';

function ganji(fullName: string): GanJi {
    const found = SIXTY_GANJI.find(g => g.fullName === fullName);
    if (!found) throw new Error(`없는 간지: ${fullName}`);
    return found;
}

describe('십성 — 지지 申(양금)과 천간 辛(음금)은 다른 글자다', () => {
    // 한글로는 둘 다 '신'. kind 를 안 주면 천간으로 읽는 것이 기본값이므로,
    // 지지는 반드시 'branch' 를 명시해야 한다.
    // [일간, 천간 辛 일 때, 지지 申 일 때]
    const cases: Array<[Stem, string, string]> = [
        ['갑', '정관', '편관'],
        ['병', '정재', '편재'],
        ['무', '상관', '식신'],
        ['경', '겁재', '비견'],
        ['임', '정인', '편인'],
    ];

    for (const [self, asStem, asBranch] of cases) {
        it(`${self} + 신: 천간이면 ${asStem}, 지지면 ${asBranch}`, () => {
            expect(calculateOneSipsong(self, '신', 'stem')).toBe(asStem);
            expect(calculateOneSipsong(self, '신', 'branch')).toBe(asBranch);
        });
    }

    it('실제 사주(임신 무신 무진 정사)에서 연지·월지 申 은 식신이다', () => {
        // 일간 무(양토)가 낳는 오행이 금, 申 은 양금 → 같은 음양 → 식신.
        // 수정 전에는 辛(음금)으로 읽어 상관이 나왔다.
        const result = analyzeSipsong({
            year: ganji('임신'),
            month: ganji('무신'),
            day: ganji('무진'),
            hour: ganji('정사'),
        });
        expect(result.yearBranch).toBe('식신');
        expect(result.monthBranch).toBe('식신');
    });
});

describe('궁합 — 합·충 판정', () => {
    // 오행 점수가 서로 영향을 주지 않도록 균등 분포로 고정한 최소 목업.
    function flatSaju(stem: string, branch: string): HighPrecisionSajuResult {
        return {
            fourPillars: { day: { stem, branch } },
            elements: {
                mainElement: '목',
                lacking: [],
                dominant: [],
                excessive: [],
                scores: { 목: 20, 화: 20, 토: 20, 금: 20, 수: 20 },
            },
        } as unknown as HighPrecisionSajuResult;
    }

    it('갑기합 + 자축육합이면 harmony +30', () => {
        const r = analyzeRelationship(flatSaju('갑', '자'), flatSaju('기', '축'), 'lover');
        expect(r.details?.harmonyScore).toBe(30);
    });

    it('자오충이면 harmony -15', () => {
        const r = analyzeRelationship(flatSaju('갑', '자'), flatSaju('경', '오'), 'lover');
        expect(r.details?.harmonyScore).toBe(-15);
    });

    it('동일 일주는 합도 충도 아니다', () => {
        // 수정 전에는 "같은 글자"를 합으로 봐서 동일 일주가 최고점을 받았다.
        const r = analyzeRelationship(flatSaju('갑', '자'), flatSaju('갑', '자'), 'lover');
        expect(r.details?.harmonyScore).toBe(0);
    });

    it('합 > 무관계 > 충 순으로 점수가 벌어진다', () => {
        const hap = analyzeRelationship(flatSaju('갑', '자'), flatSaju('기', '축'), 'friend');
        const none = analyzeRelationship(flatSaju('갑', '자'), flatSaju('갑', '자'), 'friend');
        const chung = analyzeRelationship(flatSaju('갑', '자'), flatSaju('경', '오'), 'friend');
        expect(hap.score).toBeGreaterThan(none.score);
        expect(none.score).toBeGreaterThan(chung.score);
    });
});

describe('오행 정규화 — 반올림 잔차가 있어도 합은 항상 100', () => {
    // 네 날짜 모두 수정 전에는 마지막 원소가 음수가 되어 20/20/20/20/20
    // 균등 분포로 떨어지고 용신·격국이 무의미해지던 실제 사례다.
    const reproDates: Array<[number, number, number]> = [
        [1970, 6, 3],
        [2010, 2, 28],
        [2010, 5, 17],
        [1999, 11, 5],
    ];

    for (const [y, m, d] of reproDates) {
        it(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} 13:45 출생`, async () => {
            const result = await calculateHighPrecisionSaju({
                birthDate: new Date(y, m - 1, d),
                birthTime: '13:45',
                gender: 'M',
            });
            const scores: ElementAnalysisResult['scores'] = result.elements.scores;
            const values = Object.values(scores);

            expect(values.reduce((a, b) => a + b, 0)).toBe(100);
            expect(values.every(v => v >= 0)).toBe(true);
            // 균등 분포 폴백(전부 20)으로 떨어지지 않았는지
            expect(values.some(v => v !== 20)).toBe(true);
        });
    }
});
