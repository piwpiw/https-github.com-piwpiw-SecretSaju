/**
 * 사주 서사 레이어 콘텐츠 커버리지 테스트 (content-QA harness)
 *
 * 목적: 순수 함수로 생성되는 사용자 노출 한국어 문구 전체 입력 공간을 기계적으로
 * 전수 검사한다. 각 생성 문자열에 대해 다음을 보증한다:
 *
 *  - trim 후 비어 있지 않음
 *  - "undefined" / "null" / "NaN" / "[object Object]" 부분 문자열 없음 (템플릿 누수)
 *  - 이중 공백 없음
 *  - 한글 포함 (영문 전용 문구가 새는 것 방지)
 *  - 4글자 이상 영문 연속 없음 — 기존 데이터의 "MAX"(신살 effect), "MVP"(오행 액션)
 *    같은 3글자 이하 관용 표기는 정상 데이터이므로 허용하도록 보정했다
 *  - "글자(漢字)조사" 패턴의 이/가·은/는·와/과·을/를 조사가 받침과 일치 (조사 버그)
 *
 * 실행: vitest node 환경, '@' → ./src 별칭 필요 (vitest.logic.config.ts 와 동일 설정).
 * 이 파일은 vitest.logic.config.ts 에 등록되어 있지 않아도 단독 실행 가능하다:
 *   npx vitest run --config vitest.logic.config.ts tests/logic/saju-content-coverage.test.ts
 *   (config 의 include 목록과 무관하게 파일 인자를 직접 주면 실행된다)
 */
import { describe, it, expect } from 'vitest';
import { SIXTY_GANJI, STEMS, BRANCHES } from '@/core/calendar/ganji';
import type { FourPillars, GanJi, Stem, Branch } from '@/core/calendar/ganji';
import { calculateSinsal, SINSAL_DEFINITIONS } from '@/lib/saju/sinsal';
import { analyzeSinsal } from '@/core/myeongni/sinsal';
import { calculateOneSipsong } from '@/core/myeongni/sipsong';
import { determineGyeokguk } from '@/core/myeongni/gyeokguk';
import {
    analyzeVisibleInteractions,
    analyzeTransitInteractions,
    toScopeLabelKo,
    toActorLabelKo,
} from '@/core/myeongni/interactions';
import {
    getTenGodGuide,
    getTenGodSummary,
    getAllTenGodGuides,
    ELEMENT_ACTIONS,
} from '@/lib/saju/terminology';
import { analyzeRelationship } from '@/lib/saju/compatibility';
import type { HighPrecisionSajuResult } from '@/core/api/saju-engine';

/* ------------------------------------------------------------------ */
/* 공통 검사기                                                          */
/* ------------------------------------------------------------------ */

const HANGUL = /[가-힣]/;
const DOUBLE_SPACE = /  /;
/** 4글자 이상 영문 연속만 위반으로 본다 — "MAX", "MVP", "AI" 등 3글자 이하 관용 표기는 정상 데이터 */
const LONG_ASCII_RUN = /[a-zA-Z]{4,}/;

/** 받침 유무 (한글 완성형 음절 전용) */
function hasBatchim(ch: string): boolean {
    return (ch.charCodeAt(0) - 0xac00) % 28 !== 0;
}

/**
 * "글자(漢字)조사" 패턴의 조사 일치 검사.
 * 예: "축(丑)이 …" 은 정상, "축(丑)가 …" 는 조사 버그.
 * 괄호 안이 한자(·포함 최대 2자)일 때만 검사해 "반합(수국)" 같은 한글 괄호는 건드리지 않는다.
 */
const PARTICLE_AFTER_PAREN = /([가-힣])\(([一-鿿·]{1,2})\)(이|가|은|는|와|과|을|를)(?=[\s.,]|$)/g;
const PARTICLE_NEEDS_BATCHIM: Record<string, boolean> = {
    이: true, 가: false, 은: true, 는: false, 과: true, 와: false, 을: true, 를: false,
};

interface CheckOptions {
    /** 한글 필수 여부 (기본 true) */
    requireKorean?: boolean;
    /** 영어 허용 (의도적 영문 데이터 — 예: 십성 영문 요약) */
    allowEnglish?: boolean;
}

/** 위반 수집기 — 테스트별로 새로 만들어 실패 메시지에 위반 목록이 그대로 보이게 한다 */
function makeCollector() {
    const violations: string[] = [];
    let checkedCount = 0;

    function check(label: string, text: unknown, opts: CheckOptions = {}): void {
        checkedCount += 1;
        if (typeof text !== 'string') {
            violations.push(`${label}: 문자열이 아님 (${String(text)})`);
            return;
        }
        if (text.trim().length === 0) violations.push(`${label}: 빈 문자열`);
        if (text.includes('undefined')) violations.push(`${label}: "undefined" 누수 :: ${text}`);
        if (text.includes('null')) violations.push(`${label}: "null" 누수 :: ${text}`);
        if (text.includes('NaN')) violations.push(`${label}: "NaN" 누수 :: ${text}`);
        if (text.includes('[object Object]')) violations.push(`${label}: "[object Object]" 누수 :: ${text}`);
        if (DOUBLE_SPACE.test(text)) violations.push(`${label}: 이중 공백 :: ${JSON.stringify(text)}`);
        if (opts.requireKorean !== false && !opts.allowEnglish && !HANGUL.test(text)) {
            violations.push(`${label}: 한글 없음 :: ${text}`);
        }
        if (!opts.allowEnglish && LONG_ASCII_RUN.test(text)) {
            violations.push(`${label}: 영문 연속(4자 이상) :: ${text}`);
        }
        for (const m of text.matchAll(PARTICLE_AFTER_PAREN)) {
            const [, ch, , particle] = m;
            if (hasBatchim(ch) !== PARTICLE_NEEDS_BATCHIM[particle]) {
                violations.push(`${label}: 조사 불일치 "${m[0]}" :: ${text}`);
            }
        }
    }

    function fail(label: string, message: string): void {
        checkedCount += 1;
        violations.push(`${label}: ${message}`);
    }

    return {
        check,
        fail,
        violations,
        get checkedCount() { return checkedCount; },
        /** 위반이 있으면 목록 전체를 실패 메시지로 노출한다 */
        assertClean(minChecked: number) {
            expect(violations).toEqual([]);
            // 전수성 자기검증 — 검사 수가 기대 하한 미만이면 열거 자체가 깨진 것
            expect(checkedCount).toBeGreaterThanOrEqual(minChecked);
        },
    };
}

/* ------------------------------------------------------------------ */
/* 합성 사주 헬퍼 — 계산 함수는 stemIndex/branchIndex 와 한글 간지만 읽는다 */
/* ------------------------------------------------------------------ */

function ganji(stemIndex: number, branchIndex: number): GanJi {
    const stem = STEMS[stemIndex];
    const branch = BRANCHES[branchIndex];
    return {
        stem, branch, gan: stem, ji: branch,
        fullName: `${stem}${branch}`,
        stemIndex, branchIndex,
        ganjiIndex: -1, code: 'SYNTH',
    };
}

function pillars(y: GanJi, m: GanJi, d: GanJi, h: GanJi): FourPillars {
    return { year: y, month: m, day: d, hour: h };
}

/* ------------------------------------------------------------------ */
/* 1. lib/saju/sinsal — 일주 신살, 60갑자 전수                           */
/* ------------------------------------------------------------------ */

describe('신살(lib/saju/sinsal) — 60갑자 전수 콘텐츠 검사', () => {
    it('60개 일주 코드 전부에서 반환된 신살 문구가 깨끗하다', () => {
        const c = makeCollector();
        let hits = 0;
        for (const g of SIXTY_GANJI) {
            const list = calculateSinsal(g.code);
            for (const s of list) {
                hits += 1;
                c.check(`sinsal(${g.code}).name`, s.name);
                c.check(`sinsal(${g.code}).effect`, s.effect);
                c.check(`sinsal(${g.code}).description`, s.description);
                for (const p of s.positive) c.check(`sinsal(${g.code}).positive`, p);
                for (const n of s.negative) c.check(`sinsal(${g.code}).negative`, n);
            }
        }
        // 도화·역마·화개가 12지지를 분할하므로 모든 일주는 최소 1개 신살을 가진다
        expect(hits).toBeGreaterThanOrEqual(60);
        c.assertClean(60);
    });

    it('신살 정의 테이블(SINSAL_DEFINITIONS) 전 항목의 문구가 깨끗하다', () => {
        const c = makeCollector();
        const entries = Object.entries(SINSAL_DEFINITIONS);
        expect(entries.length).toBeGreaterThanOrEqual(15);
        for (const [key, def] of entries) {
            c.check(`SINSAL_DEFINITIONS.${key}.name`, def.name);
            c.check(`SINSAL_DEFINITIONS.${key}.hanja`, def.hanja, { requireKorean: false, allowEnglish: true });
            c.check(`SINSAL_DEFINITIONS.${key}.effect`, def.effect);
            c.check(`SINSAL_DEFINITIONS.${key}.description`, def.description);
            for (const p of def.positive) c.check(`SINSAL_DEFINITIONS.${key}.positive`, p);
            for (const n of def.negative) c.check(`SINSAL_DEFINITIONS.${key}.negative`, n);
        }
        c.assertClean(15 * 4);
    });
});

/* ------------------------------------------------------------------ */
/* 2. 십성 계산 — 10간 × (10간 + 12지) 전수                              */
/* ------------------------------------------------------------------ */

describe('십성 계산 — 10간 × 22 대상 전수', () => {
    const SIPSONG_SET = new Set([
        '비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인',
    ]);

    it('220개 조합 전부가 정확히 10개 십성 라벨 중 하나를 반환한다', () => {
        const c = makeCollector();
        for (const self of STEMS) {
            for (const t of STEMS) {
                const r = calculateOneSipsong(self, t, 'stem');
                if (!SIPSONG_SET.has(r)) c.fail(`sipsong(${self},${t},stem)`, `알 수 없는 라벨 ${r}`);
                else c.check(`sipsong(${self},${t},stem)`, r);
            }
            for (const t of BRANCHES) {
                const r = calculateOneSipsong(self, t, 'branch');
                if (!SIPSONG_SET.has(r)) c.fail(`sipsong(${self},${t},branch)`, `알 수 없는 라벨 ${r}`);
                else c.check(`sipsong(${self},${t},branch)`, r);
            }
        }
        c.assertClean(10 * 22);
    });
});

/* ------------------------------------------------------------------ */
/* 3. 용어 해설(terminology) — 십성 가이드 전수 + 폴백                    */
/* ------------------------------------------------------------------ */

describe('용어 해설(terminology) — 십성 10개 + 폴백 + 오행 액션', () => {
    it('십성 가이드 10개의 모든 한국어 필드가 깨끗하다', () => {
        const c = makeCollector();
        const guides = getAllTenGodGuides();
        expect(guides.length).toBe(10);
        for (const g of guides) {
            c.check(`guide(${g.term}).term`, g.term);
            c.check(`guide(${g.term}).plain`, g.plain);
            c.check(`guide(${g.term}).actionTip`, g.actionTip);
            for (const s of g.strengths) c.check(`guide(${g.term}).strengths`, s);
            for (const x of g.cautions) c.check(`guide(${g.term}).cautions`, x);
            c.check(`summary.ko(${g.term})`, getTenGodSummary(g.term, 'ko'));
            // 영문 요약(TEN_GOD_SUMMARY_EN)은 en 로케일 전용의 의도적 영어 콘텐츠다
            // — 영문 허용 목록. 빈 문자열/누수 검사만 적용한다.
            c.check(`summary.en(${g.term})`, getTenGodSummary(g.term, 'en'), {
                allowEnglish: true,
                requireKorean: false,
            });
        }
        c.assertClean(10 * 6);
    });

    it('알 수 없는 용어도 비어 있지 않은 폴백 해설을 돌려준다', () => {
        const c = makeCollector();
        const fb = getTenGodGuide('존재하지않는십성');
        c.check('guide(fallback).plain', fb.plain);
        c.check('guide(fallback).actionTip', fb.actionTip);
        for (const s of fb.strengths) c.check('guide(fallback).strengths', s);
        for (const x of fb.cautions) c.check('guide(fallback).cautions', x);
        c.check('summary.ko(fallback)', getTenGodSummary('존재하지않는십성', 'ko'));
        // 영문 폴백 요약도 의도적 영어 — 허용 목록
        c.check('summary.en(fallback)', getTenGodSummary('존재하지않는십성', 'en'), {
            allowEnglish: true,
            requireKorean: false,
        });
        c.assertClean(6);
    });

    it('오행별 액션 문구 전수가 깨끗하다', () => {
        const c = makeCollector();
        const entries = Object.entries(ELEMENT_ACTIONS);
        expect(entries.map(([k]) => k).sort()).toEqual(['금', '목', '수', '토', '화']);
        for (const [el, actions] of entries) {
            expect(actions.length).toBeGreaterThan(0);
            // "MVP" 는 3글자 관용 표기라 4자 연속 규칙에 걸리지 않는다
            for (const a of actions) c.check(`ELEMENT_ACTIONS.${el}`, a);
        }
        c.assertClean(15);
    });
});

/* ------------------------------------------------------------------ */
/* 4. 간지 상호작용(interactions) — 관계 테이블 전 행 발화 전수            */
/* ------------------------------------------------------------------ */

describe('간지 상호작용(interactions) — 합·충·형·해·파 테이블 전수', () => {
    /** 타입별로 발화된 서로 다른 description 을 수집한다 */
    function sweepInteractions(c: ReturnType<typeof makeCollector>) {
        const seen = new Map<string, Set<string>>();
        const remember = (type: string, description: string) => {
            if (!seen.has(type)) seen.set(type, new Set());
            seen.get(type)!.add(description);
        };

        // 지지 3중 전수(12^3): 연·월·일지 전 조합 + 시지 고정(인).
        // 네 지지의 모든 쌍/삼중 조합이 발생해 육합·충·형·해·파·삼합·방합 전 행이 발화된다.
        for (let a = 0; a < 12; a++) {
            for (let b = 0; b < 12; b++) {
                for (let cc = 0; cc < 12; cc++) {
                    const fp = pillars(ganji(a % 10, a), ganji(b % 10, b), ganji(cc % 10, cc), ganji(0, 2));
                    for (const ev of analyzeVisibleInteractions(fp)) {
                        remember(ev.type, ev.description);
                        c.check(`interaction(지지 ${a},${b},${cc}:${ev.id}).description`, ev.description);
                        if (!(ev.strength > 0 && ev.strength <= 1)) {
                            c.fail(`interaction(${ev.id}).strength`, `범위 밖 값 ${ev.strength}`);
                        }
                    }
                }
            }
        }

        // 천간 쌍 전수(10^2): 연간×월간 전 조합 — 천간 5합 + 화(化) 성립/불성립 문구
        for (let s1 = 0; s1 < 10; s1++) {
            for (let s2 = 0; s2 < 10; s2++) {
                const fp = pillars(ganji(s1, 0), ganji(s2, 1), ganji(0, 2), ganji(2, 5));
                for (const ev of analyzeVisibleInteractions(fp)) {
                    remember(ev.type, ev.description);
                    c.check(`interaction(천간 ${s1},${s2}:${ev.id}).description`, ev.description);
                }
            }
        }

        // 운(transit) 경로: 60갑자 전부를 대운·세운·월운·일운으로 투입
        const natal = pillars(ganji(0, 0), ganji(2, 2), ganji(4, 4), ganji(6, 6));
        for (const g of SIXTY_GANJI) {
            for (const ev of analyzeTransitInteractions(natal, { daewun: g, saewun: g, wolun: g, ilun: g })) {
                remember(ev.type, ev.description);
                c.check(`transit(${g.fullName}:${ev.id}).description`, ev.description);
            }
        }

        return seen;
    }

    it('발화된 모든 상호작용 문구가 깨끗하고, 테이블 전 행이 실제로 발화된다', () => {
        const c = makeCollector();
        const seen = sweepInteractions(c);

        // 전수성 자기검증 — 각 관계 테이블의 행 수만큼 서로 다른 문구가 나와야 한다
        const EXPECTED_MIN_DISTINCT: Record<string, number> = {
            stem_combination: 5,               // 천간 5합
            stem_transformation: 5,            // 5합 각각의 화(化) 문구 (성립/불성립 변형 포함)
            branch_combination: 6,             // 육합 6
            branch_transformation: 6,          // 육합 6의 화(化) 문구
            branch_clash: 6,                   // 충 6
            branch_punishment: 10,             // 형 7 + 자형 4종(진·오·유·해) 문구 — 최소 10 종
            branch_harm: 6,                    // 해 6
            branch_break: 6,                   // 파 6
            branch_three_combination: 4,       // 삼합 4국
            branch_directional_combination: 4, // 방합 4방
        };
        for (const [type, min] of Object.entries(EXPECTED_MIN_DISTINCT)) {
            const got = seen.get(type)?.size ?? 0;
            if (got < min) c.fail(`coverage(${type})`, `서로 다른 문구 ${got}종 < 기대 최소 ${min}종`);
        }

        c.assertClean(5000);
    });

    it('scope/actor 라벨이 전부 한국어로 변환된다', () => {
        const c = makeCollector();
        for (const scope of ['natal', 'daewun', 'saewun', 'wolun', 'ilun']) {
            c.check(`toScopeLabelKo(${scope})`, toScopeLabelKo(scope));
        }
        // 미지정/알 수 없는 scope 도 한국어 폴백('원국')이어야 한다
        c.check('toScopeLabelKo(undefined)', toScopeLabelKo(undefined));
        c.check('toScopeLabelKo(garbage)', toScopeLabelKo('garbage'));

        const ACTOR_KEYS = [
            'yearStem', 'monthStem', 'dayStem', 'hourStem',
            'yearBranch', 'monthBranch', 'dayBranch', 'hourBranch',
            'currentDaewunStem', 'currentDaewunBranch',
            'currentSaewunStem', 'currentSaewunBranch',
            'currentWolunStem', 'currentWolunBranch',
            'currentIlunStem', 'currentIlunBranch',
        ];
        for (const key of ACTOR_KEYS) {
            c.check(`toActorLabelKo(${key})`, toActorLabelKo(key));
        }
        c.assertClean(7 + 16);
    });
});

/* ------------------------------------------------------------------ */
/* 5. 전체 사주 신살(core/myeongni/sinsal) — 일주 60 × 연주 60            */
/* ------------------------------------------------------------------ */

describe('전체 사주 신살(analyzeSinsal) — 일주 60 × 연주 60 전수', () => {
    it('3600개 조합에서 발화되는 모든 신살 문구가 깨끗하다', () => {
        const c = makeCollector();
        const seenTypes = new Set<string>();
        for (const day of SIXTY_GANJI) {
            for (const year of SIXTY_GANJI) {
                const fp = pillars(
                    ganji(year.stemIndex, year.branchIndex),
                    ganji(2, 2),
                    ganji(day.stemIndex, day.branchIndex),
                    ganji(4, 6),
                );
                for (const s of analyzeSinsal(fp)) {
                    seenTypes.add(s.type);
                    c.check(`analyzeSinsal(일 ${day.fullName}, 연 ${year.fullName}).name`, s.name);
                    c.check(`analyzeSinsal(일 ${day.fullName}, 연 ${year.fullName}).description`, s.description);
                }
            }
        }
        // 도화·역마·화개·천을귀인·문창귀인·백호살·괴강살 7종이 이 그리드에서 모두 발화되어야 한다
        for (const t of ['도화살', '역마살', '화개살', '천을귀인', '문창귀인', '백호살', '괴강살']) {
            if (!seenTypes.has(t)) c.fail(`coverage(${t})`, '전수 그리드에서 한 번도 발화되지 않음');
        }
        c.assertClean(1000);
    });
});

/* ------------------------------------------------------------------ */
/* 6. 격국 — 일주 60 × 월주 60 전수                                      */
/* ------------------------------------------------------------------ */

describe('격국(determineGyeokguk) — 일주 60 × 월주 60 전수', () => {
    it('3600개 조합 전부에서 격 이름과 해설이 깨끗하다', () => {
        const c = makeCollector();
        for (const day of SIXTY_GANJI) {
            for (const month of SIXTY_GANJI) {
                const fp = pillars(
                    ganji(0, 0),
                    ganji(month.stemIndex, month.branchIndex),
                    ganji(day.stemIndex, day.branchIndex),
                    ganji(2, 2),
                );
                const g = determineGyeokguk(fp);
                c.check(`gyeokguk(일 ${day.fullName}, 월 ${month.fullName}).name`, g.name);
                c.check(`gyeokguk(일 ${day.fullName}, 월 ${month.fullName}).description`, g.description);
            }
        }
        c.assertClean(3600 * 2);
    });
});

/* ------------------------------------------------------------------ */
/* 7. 궁합(analyzeRelationship)                                         */
/* ------------------------------------------------------------------ */

type PillarSpec = readonly [Stem, Branch];

interface CompatMockOptions {
    year?: PillarSpec;
    month?: PillarSpec;
    hour?: PillarSpec;
    timeUnknown?: boolean;
    lacking?: string[];
    dominant?: string[];
    excessive?: string[];
    mainElement?: string;
}

/** 오행 점수를 균등 분포로 고정한 목업 — compatibility-full.test.ts 와 같은 방식 */
function mockSaju(day: PillarSpec, opts: CompatMockOptions = {}): HighPrecisionSajuResult {
    const toPillar = (p?: PillarSpec) => (p ? { stem: p[0], branch: p[1] } : undefined);
    return {
        fourPillars: {
            year: toPillar(opts.year ?? ['갑', '인']),
            month: toPillar(opts.month ?? ['갑', '인']),
            day: toPillar(day),
            hour: toPillar(opts.hour ?? ['갑', '인']),
        },
        elements: {
            mainElement: opts.mainElement ?? '목',
            lacking: opts.lacking ?? [],
            dominant: opts.dominant ?? [],
            excessive: opts.excessive ?? [],
            scores: { 목: 20, 화: 20, 토: 20, 금: 20, 수: 20 },
        },
        meta: opts.timeUnknown === undefined
            ? undefined
            : { inputs: { timeUnknownFallbackUsed: opts.timeUnknown } },
    } as unknown as HighPrecisionSajuResult;
}

/** 궁합 결과의 사용자 노출 텍스트 전 필드를 검사한다 */
function checkRelationshipText(
    c: ReturnType<typeof makeCollector>,
    label: string,
    r: ReturnType<typeof analyzeRelationship>,
): void {
    if (!(Number.isFinite(r.score) && r.score >= 0 && r.score <= 100)) {
        c.fail(`${label}.score`, `범위 밖 점수 ${r.score}`);
    }
    c.check(`${label}.message`, r.message);
    c.check(`${label}.chemistry`, r.chemistry);
    c.check(`${label}.advice`, r.advice);
    if (r.tension !== null) c.check(`${label}.tension`, r.tension);
    c.check(`${label}.powerDynamic`, r.powerDynamic);
    c.check(`${label}.futurePredict`, r.futurePredict);
    c.check(`${label}.pillarA`, r.pillarA);
    c.check(`${label}.pillarB`, r.pillarB);
    expect(r.actionItems.length).toBeGreaterThan(0);
    for (const item of r.actionItems) c.check(`${label}.actionItems`, item);
    for (const it of r.details?.pillarInteractions ?? []) {
        c.check(`${label}.interaction(${it.position}:${it.kind}).label`, it.label);
        c.check(`${label}.interaction(${it.position}:${it.kind}).description`, it.description);
    }
    if (r.details?.sipsongRelation) {
        c.check(`${label}.sipsong.aToB.headline`, r.details.sipsongRelation.aToB.headline);
        c.check(`${label}.sipsong.aToB.description`, r.details.sipsongRelation.aToB.description);
        c.check(`${label}.sipsong.bToA.headline`, r.details.sipsongRelation.bToA.headline);
        c.check(`${label}.sipsong.bToA.description`, r.details.sipsongRelation.bToA.description);
    }
    if (r.details?.complement) {
        c.check(`${label}.complement.summary`, r.details.complement.summary);
    }
}

describe('궁합(analyzeRelationship) — 일주 60갑자 × 60갑자 전수', () => {
    it('3600개 일주 쌍 전부에서 점수가 0~100이고 모든 문구가 깨끗하다', () => {
        const c = makeCollector();
        // 관계 서술 테이블 전 행이 실제 발화되는지 검증하기 위해 kind별 라벨을 수집
        const kindLabels = new Map<string, Set<string>>();
        for (const ga of SIXTY_GANJI) {
            for (const gb of SIXTY_GANJI) {
                const r = analyzeRelationship(
                    mockSaju([ga.stem, ga.branch]),
                    mockSaju([gb.stem, gb.branch]),
                    'friend',
                );
                if (!(Number.isFinite(r.score) && r.score >= 0 && r.score <= 100)) {
                    c.fail(`compat(${ga.fullName},${gb.fullName}).score`, `범위 밖 점수 ${r.score}`);
                }
                c.check(`compat(${ga.fullName},${gb.fullName}).chemistry`, r.chemistry);
                if (r.tension !== null) c.check(`compat(${ga.fullName},${gb.fullName}).tension`, r.tension);
                for (const it of r.details?.pillarInteractions ?? []) {
                    if (!kindLabels.has(it.kind)) kindLabels.set(it.kind, new Set());
                    kindLabels.get(it.kind)!.add(it.label);
                    c.check(`compat(${ga.fullName},${gb.fullName}).${it.kind}.label`, it.label);
                    c.check(`compat(${ga.fullName},${gb.fullName}).${it.kind}.description`, it.description);
                }
            }
        }

        // 전수성 자기검증 — 관계 종류별 서로 다른 라벨 수가 판정 표의 행 수와 맞아야 한다
        const EXPECTED_KIND_MIN: Record<string, number> = {
            stemHap: 5,        // 천간 5합
            stemChung: 4,      // 4충설
            branchYukhap: 6,   // 육합 6
            branchBanhap: 8,   // 반합 8 (왕지 포함 두 글자 × 4국)
            branchChung: 6,    // 충 6
            branchHyeong: 11,  // 형 7 + 자형 4(진·오·유·해)
            branchHae: 6,      // 해 6
            branchPa: 6,       // 파 6
        };
        for (const [kind, min] of Object.entries(EXPECTED_KIND_MIN)) {
            const got = kindLabels.get(kind)?.size ?? 0;
            if (got < min) c.fail(`coverage(${kind})`, `서로 다른 라벨 ${got}종 < 기대 최소 ${min}종`);
        }

        c.assertClean(3600);
    });
});

describe('궁합(analyzeRelationship) — 대표 사주 12 × 12 변형 그리드', () => {
    it('관계 유형·시주 미상·오행 결핍 변형 전반에서 모든 노출 텍스트가 깨끗하다', () => {
        const c = makeCollector();
        const REP_PILLARS: PillarSpec[] = SIXTY_GANJI.slice(0, 12).map(
            (g) => [g.stem, g.branch] as const,
        ); // 갑자~을해: 12지지가 모두 서로 다른 대표 12일주
        const REL_TYPES = ['self', 'spouse', 'child', 'parent', 'friend', 'lover', 'other', '알수없는관계'];
        const MAIN_ELEMENTS = ['목', '화', '토', '금', '수'];

        for (let i = 0; i < REP_PILLARS.length; i++) {
            for (let j = 0; j < REP_PILLARS.length; j++) {
                const rel = REL_TYPES[(i * 12 + j) % REL_TYPES.length];
                const a = mockSaju(REP_PILLARS[i], {
                    mainElement: MAIN_ELEMENTS[i % 5],
                    lacking: i % 3 === 0 ? ['수'] : [],
                });
                const b = mockSaju(REP_PILLARS[j], {
                    mainElement: MAIN_ELEMENTS[j % 5],
                    lacking: j % 4 === 0 ? ['화', '금'] : [],
                    timeUnknown: j % 2 === 0,
                });
                const r = analyzeRelationship(a, b, rel);
                checkRelationshipText(c, `compat-grid(${i},${j},${rel})`, r);
            }
        }
        c.assertClean(144 * 8);
    });

    it('같은 입력이면 항상 같은 문구를 돌려준다 (결정성)', () => {
        const a = mockSaju(['갑', '자'], { lacking: ['화'] });
        const b = mockSaju(['기', '축'], { timeUnknown: true });
        const r1 = analyzeRelationship(a, b, 'lover');
        const r2 = analyzeRelationship(a, b, 'lover');
        expect(r2).toEqual(r1);
    });
});
