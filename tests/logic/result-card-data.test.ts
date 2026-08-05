/**
 * 결과 카드(ResultCard) 데이터 공급 회귀 테스트
 *
 * 왜 이 테스트가 있는가:
 * 결과 화면의 세 섹션("행동 패턴 분석", "나의 멘탈 게이지", "행운을 부르는 기운")은
 * calculateSaju 가 넘겨주는 sipsong·gangyak·yongshin props 만 읽는다. 이 값들은
 * 원래 고정밀 엔진(hpResult)에서만 채워졌기 때문에, 엔진이 실패하면(타임아웃,
 * 음력 변환 불가, 대운 절입 탐색 실패 등) 셋 다 undefined 로 남았고 —
 * ResultCard 에는 비동기 로딩이 전혀 없으므로 — 화면은 "데이터를 불러오는 중",
 * 0/100 게이지, "분석 중" 에 영원히 멈춰 있었다.
 *
 * 수정: 폴백 경로에서도 buildFallbackAnalyses 가 실제 계산된 폴백 기둥으로
 * 십성·강약·용신을 도출한다. 단, 날조 금지 — 비상용 고정 기둥이나 더미 오행
 * 입력에서는 아무것도 만들지 않는다. 이 테스트는 그 두 가지 계약을 못 박는다.
 */
import { describe, it, expect } from 'vitest';
import { buildFallbackAnalyses } from '@/lib/saju';
import { analyzeElements } from '@/core/myeongni/elements';
import type { FourPillars, Stem, Branch } from '@/core/calendar/ganji';

const SIPSONG_LABELS = [
    '비견', '겁재', '식신', '상관', '편재',
    '정재', '편관', '정관', '편인', '정인',
] as const;

const ELEMENTS = ['목', '화', '토', '금', '수'] as const;

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

/** 실제 폴백 경로가 만들어 내는 형태의 완전한 사주 기둥 (1990-01-01 12:00 근사) */
const REAL_PILLARS = pillars(['기', '사'], ['병', '자'], ['갑', '인'], ['경', '오']);

describe('buildFallbackAnalyses — 엔진 실패 시 결과 카드 데이터 공급', () => {
    const elements = analyzeElements(REAL_PILLARS);
    const derived = buildFallbackAnalyses(REAL_PILLARS, elements);

    it('"행동 패턴 분석": 십성이 채워지고 전 항목이 정식 십성 라벨이다', () => {
        expect(derived.sipsong).toBeDefined();
        const values = Object.values(derived.sipsong!);
        // 일간 제외 7글자 전부에 십성이 있어야 카드가 빈 상태로 남지 않는다
        expect(values.length).toBe(7);
        values.forEach((value) => {
            expect(SIPSONG_LABELS).toContain(value);
        });
    });

    it('"행동 패턴 분석": ResultCard 의 집계 방식(라벨 일치 카운트)으로 최소 1개 항목이 나온다', () => {
        // ResultCard 는 Object.values(sipsong) 에서 라벨 일치 개수를 백분율로 만든다.
        // 여기서 0개면 카드가 영구 "로딩" 상태였던 결함이 재발한 것이다.
        const values = Object.values(derived.sipsong!);
        const nonZeroLabels = SIPSONG_LABELS.filter(
            (label) => values.filter((item) => item === label).length > 0,
        );
        expect(nonZeroLabels.length).toBeGreaterThan(0);
    });

    it('"나의 멘탈 게이지": 강약 점수가 채워지고 합계·등급이 일관된다', () => {
        const gangyak = derived.gangyak!;
        expect(gangyak).toBeDefined();
        expect(Number.isFinite(gangyak.total)).toBe(true);
        expect(gangyak.total).toBeGreaterThanOrEqual(0);
        expect(gangyak.total).toBeLessThanOrEqual(100);
        expect(gangyak.total).toBe(gangyak.deukryeong + gangyak.deukji + gangyak.deukse);
        expect(['신약', '중화', '신강']).toContain(gangyak.level);
    });

    it('"행운을 부르는 기운": 용신 3종이 모두 정식 오행 값이다', () => {
        const yongshin = derived.yongshin!;
        expect(yongshin).toBeDefined();
        expect(ELEMENTS).toContain(yongshin.primary.element);
        expect(ELEMENTS).toContain(yongshin.secondary.element);
        expect(ELEMENTS).toContain(yongshin.unfavorable.element);
        // 나침반 기운과 주의 에너지가 같으면 해석이 자기모순이 된다
        expect(yongshin.primary.element).not.toBe(yongshin.unfavorable.element);
    });
});

describe('buildFallbackAnalyses — 날조 금지 계약', () => {
    it('기둥이 없거나 불완전하면 아무 값도 만들지 않는다', () => {
        expect(buildFallbackAnalyses(null, null)).toEqual({});
        expect(buildFallbackAnalyses(undefined, null)).toEqual({});
        const incomplete = {
            year: { stem: '갑', branch: '자' },
            month: { stem: '을' }, // branch 누락
            day: { stem: '병', branch: '인' },
            hour: { stem: '정', branch: '묘' },
        } as unknown as FourPillars;
        expect(buildFallbackAnalyses(incomplete, null)).toEqual({});
    });

    it('오행 분석이 더미값이면(null 전달) 용신은 만들지 않는다 — 십성·강약은 기둥만으로 유효', () => {
        const derived = buildFallbackAnalyses(REAL_PILLARS, null);
        expect(derived.sipsong).toBeDefined();
        expect(derived.gangyak).toBeDefined();
        expect(derived.yongshin).toBeUndefined();
    });
});
