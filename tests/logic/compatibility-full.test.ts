/**
 * 궁합 사주 전체 분석 테스트
 *
 * 일주 단독 비교(회귀: defect-regressions.test.ts)에 더해, 네 기둥 전체를
 * 같은 위치끼리(연↔연, 월↔월, 일↔일, 시↔시) 비교하는 확장 로직을 검증한다.
 *
 * - 삼합(왕지 포함 반합)·형·해·파 검출과 가/감점
 * - 십성 상호관계(양방향)
 * - 시주 미상 처리(제외 + 나머지 가중치 정규화)
 * - 기둥 가중치 순서(일 > 월 > 연 > 시)
 * - 결정성(같은 입력 = 같은 출력)
 */
import { describe, it, expect } from 'vitest';
import { analyzeRelationship } from '@/lib/saju/compatibility';
import type { HighPrecisionSajuResult } from '@/core/api/saju-engine';
import type { Stem, Branch } from '@/core/calendar/ganji';

type PillarSpec = readonly [Stem, Branch];

interface MockOptions {
    year?: PillarSpec;
    month?: PillarSpec;
    day: PillarSpec;
    hour?: PillarSpec;
    timeUnknown?: boolean;
}

/**
 * 오행 점수가 점수에 영향을 주지 않도록 균등 분포로 고정한 목업.
 * 기본 기둥은 서로 어떤 합충도 만들지 않는 갑인(甲寅)으로 채운다.
 */
function mockSaju(opts: MockOptions): HighPrecisionSajuResult {
    const toPillar = (p?: PillarSpec) => (p ? { stem: p[0], branch: p[1] } : undefined);
    return {
        fourPillars: {
            year: toPillar(opts.year),
            month: toPillar(opts.month),
            day: toPillar(opts.day),
            hour: toPillar(opts.hour),
        },
        elements: {
            mainElement: '목',
            lacking: [],
            dominant: [],
            excessive: [],
            scores: { 목: 20, 화: 20, 토: 20, 금: 20, 수: 20 },
        },
        meta: opts.timeUnknown === undefined
            ? undefined
            : { inputs: { timeUnknownFallbackUsed: opts.timeUnknown } },
    } as unknown as HighPrecisionSajuResult;
}

const NEUTRAL: PillarSpec = ['갑', '인']; // 갑↔갑, 인↔인 은 합·충·형·해·파 어디에도 없다

function fullSaju(day: PillarSpec, overrides: Partial<Omit<MockOptions, 'day'>> = {}): HighPrecisionSajuResult {
    return mockSaju({
        year: overrides.year ?? NEUTRAL,
        month: overrides.month ?? NEUTRAL,
        day,
        hour: overrides.hour ?? NEUTRAL,
        timeUnknown: overrides.timeUnknown,
    });
}

function interactionKinds(r: ReturnType<typeof analyzeRelationship>) {
    return (r.details?.pillarInteractions ?? []).map(it => `${it.position}:${it.kind}`);
}

describe('지지 확장 관계 — 반합·형·해·파', () => {
    it('자-진 은 신자진 수국의 반합으로 가점된다', () => {
        const r = analyzeRelationship(fullSaju(['갑', '자']), fullSaju(['갑', '진']), 'friend');
        expect(interactionKinds(r)).toContain('day:branchBanhap');
        expect(r.details?.pillarScore).toBeGreaterThan(0);
        const banhap = r.details?.pillarInteractions?.find(it => it.kind === 'branchBanhap');
        expect(banhap?.label).toContain('반합');
        expect(banhap?.label).toContain('수국');
    });

    it('왕지가 없는 신-진 조합은 반합으로 세지 않는다', () => {
        const r = analyzeRelationship(fullSaju(['갑', '신']), fullSaju(['갑', '진']), 'friend');
        expect(interactionKinds(r)).not.toContain('day:branchBanhap');
    });

    it('축-술 은 축술형(삼형 축술미)으로 감점된다', () => {
        const r = analyzeRelationship(fullSaju(['정', '축']), fullSaju(['갑', '술']), 'friend');
        expect(interactionKinds(r)).toContain('day:branchHyeong');
        expect(r.details?.pillarScore).toBeLessThan(0);
    });

    it('진-진 은 자형으로 감점된다', () => {
        const r = analyzeRelationship(fullSaju(['갑', '진']), fullSaju(['갑', '진']), 'friend');
        const hyeong = r.details?.pillarInteractions?.find(it => it.kind === 'branchHyeong');
        expect(hyeong).toBeDefined();
        expect(hyeong!.label).toContain('자형');
        expect(hyeong!.delta).toBeLessThan(0);
    });

    it('자-미 는 해(害)로 감점된다', () => {
        const r = analyzeRelationship(fullSaju(['갑', '자']), fullSaju(['계', '미']), 'friend');
        expect(interactionKinds(r)).toContain('day:branchHae');
        expect(r.details?.pillarScore).toBeLessThan(0);
    });

    it('자-유 는 파(破)로 감점된다', () => {
        const r = analyzeRelationship(fullSaju(['갑', '자']), fullSaju(['갑', '유']), 'friend');
        expect(interactionKinds(r)).toContain('day:branchPa');
        expect(r.details?.pillarScore).toBeLessThan(0);
    });

    it('천간충(갑경) — 4충설에 따라 감점된다', () => {
        const r = analyzeRelationship(fullSaju(['갑', '인']), fullSaju(['경', '인']), 'friend');
        expect(interactionKinds(r)).toContain('day:stemChung');
        expect(r.details?.pillarScore).toBeLessThan(0);
    });
});

describe('일주 외 기둥도 비교된다 (가중치 일 > 월 > 연 > 시)', () => {
    it('월지 충이 연지 충보다 더 크게 감점된다', () => {
        const monthChung = analyzeRelationship(
            fullSaju(NEUTRAL, { month: ['갑', '자'] }),
            fullSaju(NEUTRAL, { month: ['갑', '오'] }),
            'friend',
        );
        const yearChung = analyzeRelationship(
            fullSaju(NEUTRAL, { year: ['갑', '자'] }),
            fullSaju(NEUTRAL, { year: ['갑', '오'] }),
            'friend',
        );
        expect(interactionKinds(monthChung)).toContain('month:branchChung');
        expect(interactionKinds(yearChung)).toContain('year:branchChung');
        expect(monthChung.score).toBeLessThan(yearChung.score);
    });

    it('연간 천간합(을경)은 가점되고 harmonyScore(일주 전용)에는 영향이 없다', () => {
        const r = analyzeRelationship(
            fullSaju(NEUTRAL, { year: ['을', '인'] }),
            fullSaju(NEUTRAL, { year: ['경', '인'] }),
            'friend',
        );
        expect(interactionKinds(r)).toContain('year:stemHap');
        expect(r.details?.harmonyScore).toBe(0);
        expect(r.details?.pillarScore).toBeGreaterThan(0);
    });
});

describe('십성 상호관계 — 상대 일간이 내 일간 기준 어떤 십성인지 (양방향)', () => {
    it('갑 ↔ 기: 갑에게 기는 정재, 기에게 갑은 정관', () => {
        const r = analyzeRelationship(fullSaju(['갑', '인']), fullSaju(['기', '인']), 'lover');
        expect(r.details?.sipsongRelation?.aToB.sipsong).toBe('정재');
        expect(r.details?.sipsongRelation?.bToA.sipsong).toBe('정관');
        expect(r.details?.sipsongScore).toBe(10); // 정재(+5) + 정관(+5)
    });

    it('갑 ↔ 임: 갑에게 임은 편인, 임에게 갑은 식신', () => {
        const r = analyzeRelationship(fullSaju(['갑', '인']), fullSaju(['임', '인']), 'friend');
        expect(r.details?.sipsongRelation?.aToB.sipsong).toBe('편인');
        expect(r.details?.sipsongRelation?.bToA.sipsong).toBe('식신');
        expect(r.details?.sipsongScore).toBe(6); // 편인(+2) + 식신(+4)
        expect(r.details?.sipsongRelation?.aToB.description.length).toBeGreaterThan(0);
        expect(r.details?.sipsongRelation?.bToA.description.length).toBeGreaterThan(0);
    });
});

describe('시주 미상 처리', () => {
    it('시간 미상이면 시주 관계는 제외되고 hourPillarIncluded=false', () => {
        const withHour = analyzeRelationship(
            fullSaju(NEUTRAL, { hour: ['갑', '자'] }),
            fullSaju(NEUTRAL, { hour: ['갑', '오'] }),
            'friend',
        );
        const unknownHour = analyzeRelationship(
            fullSaju(NEUTRAL, { hour: ['갑', '자'], timeUnknown: true }),
            fullSaju(NEUTRAL, { hour: ['갑', '오'], timeUnknown: true }),
            'friend',
        );

        expect(withHour.details?.hourPillarIncluded).toBe(true);
        expect(interactionKinds(withHour)).toContain('hour:branchChung');

        expect(unknownHour.details?.hourPillarIncluded).toBe(false);
        expect(interactionKinds(unknownHour)).not.toContain('hour:branchChung');
        expect(unknownHour.score).toBeGreaterThan(withHour.score);
    });

    it('시간 미상 결과는 시주가 아예 없는 사주와 동일하다 (나머지 가중치로 정규화)', () => {
        const unknownHour = analyzeRelationship(
            fullSaju(['갑', '자'], { month: ['갑', '오'], hour: ['갑', '오'], timeUnknown: true }),
            fullSaju(['갑', '진'], { month: ['갑', '자'], hour: ['갑', '자'], timeUnknown: true }),
            'lover',
        );
        const noHour = analyzeRelationship(
            mockSaju({ year: NEUTRAL, month: ['갑', '오'], day: ['갑', '자'] }),
            mockSaju({ year: NEUTRAL, month: ['갑', '자'], day: ['갑', '진'] }),
            'lover',
        );
        expect(unknownHour.score).toBe(noHour.score);
        expect(unknownHour.details?.pillarScore).toBe(noHour.details?.pillarScore);
    });
});

describe('결정성 — 같은 입력이면 항상 같은 출력', () => {
    it('동일 입력 반복 호출 결과가 완전히 일치한다', () => {
        const make = () => analyzeRelationship(
            fullSaju(['갑', '자'], { year: ['을', '해'], month: ['병', '오'], hour: ['정', '유'] }),
            fullSaju(['기', '축'], { year: ['경', '묘'], month: ['임', '자'], hour: ['계', '사'] }),
            'lover',
        );
        const first = make();
        const second = make();
        expect(second).toEqual(first);
        expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    });
});

describe('하위 호환 — 기존 details 필드와 점수 골격 유지', () => {
    it('elementScore·harmonyScore·balanceScore 필드가 그대로 존재한다', () => {
        const r = analyzeRelationship(fullSaju(['갑', '자']), fullSaju(['기', '축']), 'lover');
        expect(r.details).toBeDefined();
        expect(typeof r.details!.elementScore).toBe('number');
        expect(typeof r.details!.harmonyScore).toBe('number');
        expect(typeof r.details!.balanceScore).toBe('number');
        // 일주 갑기합 + 자축육합 → 기존 의미 그대로 +30
        expect(r.details!.harmonyScore).toBe(30);
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
    });
});
