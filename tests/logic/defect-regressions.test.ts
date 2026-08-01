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
import { calculateSinsal } from '@/lib/saju/sinsal';
import { calculateGangYak } from '@/lib/saju/advancedScoring';
import { TEN_GOD_GROUPS } from '@/lib/saju/terminology';
import { SIGNS as ZODIAC_SIGNS } from '@/lib/saju/astrologyEngine';
import { analyzeCharacter } from '@/lib/saju/characterAnalysis';

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

describe('일주 신살 — 60갑자 전체가 판정된다', () => {
    // 수정 전에는 코드→한자 표가 12개뿐이라 48개 일주가 빈 배열을 받았고,
    // 역마살 표는 `if (yima[jiji])` 로 12지지 전부 참이라 모든 일주에 붙었다.
    it('빈 결과인 일주가 없다 (도화·역마·화개지가 12지지를 덮는다)', () => {
        for (const g of SIXTY_GANJI) {
            expect(calculateSinsal(g.code).length, g.fullName).toBeGreaterThan(0);
        }
    });

    it('신살별 개수가 고전 이론값과 일치한다', () => {
        const counts: Record<string, number> = {};
        for (const g of SIXTY_GANJI) {
            for (const s of calculateSinsal(g.code)) {
                counts[s.name] = (counts[s.name] || 0) + 1;
            }
        }
        expect(counts).toEqual({
            도화살: 20,   // 자오묘유 × 5
            역마살: 20,   // 인신사해 × 5 (수정 전 60)
            화개살: 20,   // 진술축미 × 5
            천을귀인: 4,  // 일귀: 정유 정해 계사 계묘
            문창귀인: 6,  // 병신 정유 무신 기유 임인 계묘
            백호대살: 7,
            괴강살: 6,
            양인살: 3,    // 일인: 병오 무오 임자
        });
    });

    it('정유 일주는 천을귀인·문창귀인·도화살을 함께 가진다', () => {
        const names = calculateSinsal('JEONG_YU').map(s => s.name);
        expect(names).toContain('천을귀인');
        expect(names).toContain('문창귀인');
        expect(names).toContain('도화살');
    });

    it('갑자 일주는 도화살뿐이다 (수정 전에는 역마살도 붙었다)', () => {
        expect(calculateSinsal('GAP_JA').map(s => s.name)).toEqual(['도화살']);
    });

    it('공망은 더 이상 일주 단독으로 판정하지 않는다', () => {
        // 어떤 기둥도 자기 순(旬)의 공망지를 지지로 가질 수 없다.
        // 예전 하드코딩 대상이던 갑술로 확인한다.
        expect(calculateSinsal('GAP_SUL').map(s => s.name)).not.toContain('공망');
    });
});

describe('강약 — 토왕절과 득세 스케일', () => {
    function p(y: [string, string], m: [string, string], d: [string, string], h: [string, string]) {
        return {
            year: { stem: y[0], branch: y[1] }, month: { stem: m[0], branch: m[1] },
            day: { stem: d[0], branch: d[1] }, hour: { stem: h[0], branch: h[1] },
        } as unknown as Parameters<typeof calculateGangYak>[0];
    }

    it('진월(토왕절) 무토는 득령 만점이다', () => {
        // 수정 전에는 辰을 봄(木旺) 행에 편입시켜 토 일간 득령이 0점이었고,
        // 무토 전왕 사주가 "신약"으로 나와 억부용신이 반대로 나갈 수 있었다.
        const s = calculateGangYak(p(['무', '술'], ['무', '진'], ['무', '술'], ['기', '미']));
        expect(s.deukryeong).toBe(30);
        expect(s.level).toBe('신강');
    });

    it('술·축·미월에서도 토가 왕이다', () => {
        for (const mb of ['술', '축', '미']) {
            const s = calculateGangYak(p(['무', '자'], ['무', mb], ['무', '자'], ['임', '자']));
            expect(s.deukryeong, `${mb}월`).toBe(30);
        }
    });

    it('돕는 천간 3개면 득세가 문서상 만점(40)에 실제로 도달한다', () => {
        // 일간 제외 천간은 3개뿐인데 예전에는 1개당 10점이라 최대 30이었다.
        const s = calculateGangYak(p(['갑', '자'], ['을', '인'], ['갑', '인'], ['계', '묘']));
        expect(s.deukse).toBe(40);
    });
});

describe('십성 그룹 — 10개 전부가 어느 그룹엔가 속한다', () => {
    it('편재가 빠져 있지 않다', () => {
        const all = Object.values(TEN_GOD_GROUPS).flat() as string[];
        const ten = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
        for (const god of ten) {
            expect(all, god).toContain(god);
        }
    });
});

describe('점성 데이터 — 행운 행성 표기', () => {
    it('중복·존재하지 않는 행성명이 없다', () => {
        const REAL = new Set(['태양', '달', '수성', '금성', '화성', '목성', '토성', '천왕성', '해왕성', '명왕성']);
        for (const sign of ZODIAC_SIGNS) {
            const planets: string[] = (sign as any).luckyPlanets;
            expect(new Set(planets).size, sign.name).toBe(planets.length);
            for (const pl of planets) expect(REAL.has(pl), `${sign.name}: ${pl}`).toBe(true);
        }
    });
});

describe('일주 오행 균형 — 도달 가능한 분기', () => {
    it('60갑자가 전부 "불균형"으로 나오지 않는다', () => {
        // 예전 기준(5종=매우 균형 등)은 일주 2글자 스케일에서 도달 불가였다.
        const dist: Record<string, number> = {};
        for (const g of SIXTY_GANJI) {
            const b = analyzeCharacter(g.code).wuxing_balance.overall_balance;
            dist[b] = (dist[b] || 0) + 1;
        }
        expect(Object.keys(dist).length).toBeGreaterThan(1);
        expect(dist['균형'] ?? 0).toBeGreaterThan(0);
    });
});
