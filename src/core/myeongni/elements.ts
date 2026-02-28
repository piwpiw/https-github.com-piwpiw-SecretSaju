/**
 * Five Elements (O-haeng) Analysis Module
 * 
 * Analyzes the balance of Wood, Fire, Earth, Metal, Water in the 8 characters (Four Pillars).
 * Determines strength, weakness, and missing elements.
 */

import { FourPillars, Stem, Branch } from '../calendar/ganji';

export type Element = '목' | '화' | '토' | '금' | '수';

export interface ElementScores {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
}

export interface ElementAnalysisResult {
    /** Extended Scores (Weighted by Jijang-gan & Season) */
    scores: ElementScores;
    /** Basic Counts (Number of characters out of 8) */
    counts: ElementScores;
    /** Percentage based on basic counts (Optional, for simplified view) */
    basicPercentages: ElementScores;
    dominant: Element[];
    lacking: Element[];
    excessive: Element[];
    mainElement: Element; // Il-gan (Day Stem) element
}

const STEM_ELEMENTS: Record<Stem, Element> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수'
};

const BRANCH_ELEMENTS: Record<Branch, Element> = {
    '자': '수', '축': '토', '인': '목', '묘': '목',
    '진': '토', '사': '화', '오': '화', '미': '토',
    '신': '금', '유': '금', '술': '토', '해': '수'
};

// Hidden Stems (Ji-jang-gan) Mapping with weights
// Unit: Percentage or relative points (Standard: 30 days total)
const HIDDEN_STEMS: Record<Branch, { stem: Stem; weight: number }[]> = {
    '자': [{ stem: '임', weight: 10 }, { stem: '계', weight: 20 }],
    '축': [{ stem: '계', weight: 9 }, { stem: '신', weight: 3 }, { stem: '기', weight: 18 }],
    '인': [{ stem: '무', weight: 7 }, { stem: '병', weight: 7 }, { stem: '갑', weight: 16 }],
    '묘': [{ stem: '갑', weight: 10 }, { stem: '을', weight: 20 }],
    '진': [{ stem: '을', weight: 9 }, { stem: '계', weight: 3 }, { stem: '무', weight: 18 }],
    '사': [{ stem: '무', weight: 7 }, { stem: '경', weight: 7 }, { stem: '병', weight: 16 }],
    '오': [{ stem: '병', weight: 10 }, { stem: '기', weight: 9 }, { stem: '정', weight: 11 }],
    '미': [{ stem: '정', weight: 9 }, { stem: '을', weight: 3 }, { stem: '기', weight: 18 }],
    '신': [{ stem: '무', weight: 7 }, { stem: '임', weight: 7 }, { stem: '경', weight: 16 }],
    '유': [{ stem: '경', weight: 10 }, { stem: '신', weight: 20 }],
    '술': [{ stem: '신', weight: 9 }, { stem: '정', weight: 3 }, { stem: '무', weight: 18 }],
    '해': [{ stem: '무', weight: 7 }, { stem: '갑', weight: 7 }, { stem: '임', weight: 16 }]
};

// Scoring Model Version
export const SCORING_MODEL = "HIDDEN_WEIGHTED_V1";

// Weighting for score calculation (HIDDEN_WEIGHTED_V1)
const WEIGHTS = {
    YEAR_STEM: 10,
    YEAR_BRANCH: 10,
    MONTH_STEM: 10,
    MONTH_BRANCH: 30, // Season is 3x more powerful
    DAY_STEM: 10,     // Reference point
    DAY_BRANCH: 15,   // Sits directly under Self
    HOUR_STEM: 10,
    HOUR_BRANCH: 15
};

export function analyzeElements(saju: FourPillars): ElementAnalysisResult {
    // SECURITY: Reject if any pillar data is missing
    if (!saju || !saju.year || !saju.month || !saju.day || !saju.hour) {
        throw new Error("[saju-engine] Incomplete pillar data for HIDDEN_WEIGHTED_V1");
    }

    const scores: ElementScores = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    const counts: ElementScores = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

    // 1. Calculate weighted scores using Jijang-gan
    const processPillar = (stem: Stem, branch: Branch, stemWeight: number, branchWeight: number) => {
        const sEl = STEM_ELEMENTS[stem];
        if (!sEl) throw new Error(`[saju-engine] Invalid stem element for: ${stem}`);

        scores[sEl] += stemWeight;
        counts[sEl] += 1;

        // Branch (Distribute branch weight across hidden stems)
        const hidden = HIDDEN_STEMS[branch];
        if (!hidden) throw new Error(`[saju-engine] Missing hidden stem data for branch: ${branch}`);

        const totalHiddenWeight = hidden.reduce((sum, h) => sum + h.weight, 0);

        hidden.forEach(h => {
            const hElement = STEM_ELEMENTS[h.stem];
            const distributedWeight = (h.weight / totalHiddenWeight) * branchWeight;
            scores[hElement] += distributedWeight;
        });

        // Count the branch primarily as its main element
        const bEl = BRANCH_ELEMENTS[branch];
        counts[bEl] += 1;
    };

    processPillar(saju.year.stem, saju.year.branch, WEIGHTS.YEAR_STEM, WEIGHTS.YEAR_BRANCH);
    processPillar(saju.month.stem, saju.month.branch, WEIGHTS.MONTH_STEM, WEIGHTS.MONTH_BRANCH);
    processPillar(saju.day.stem, saju.day.branch, WEIGHTS.DAY_STEM, WEIGHTS.DAY_BRANCH);
    processPillar(saju.hour.stem, saju.hour.branch, WEIGHTS.HOUR_STEM, WEIGHTS.HOUR_BRANCH);

    // 2. Strict Normalization to sum exactly 100
    const rawTotal = Object.values(scores).reduce((a, b) => a + b, 0);
    const normalizedScores: ElementScores = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

    let sum = 0;
    const entries = Object.entries(scores) as [Element, number][];

    entries.forEach(([el, val], idx) => {
        if (idx === entries.length - 1) {
            // Last one takes the remainder to ensure exact 100
            normalizedScores[el] = Math.max(0, 100 - sum);
        } else {
            const rounded = Math.round((val / rawTotal) * 100);
            normalizedScores[el] = rounded;
            sum += rounded;
        }
    });

    // 3. Invariant Check: If score is 0, basic count must also be 0 in this model (Surface + Hidden)
    // Actually, in some cases a score could be purely from hidden stems, but if basic count is 0, 
    // it means neither surface nor main branch element exists. 
    // Rule: Total Score = 0 <=> 목, 화, 토, 금, 수 sum = 100.
    if (Object.values(normalizedScores).reduce((a, b) => a + b, 0) !== 100) {
        throw new Error("[saju-engine] Normalization Invariant Violation: Sum != 100");
    }

    // Basic Percentages (out of 8 characters)
    const basicPercentages: ElementScores = {
        목: Math.round((counts.목 / 8) * 100),
        화: Math.round((counts.화 / 8) * 100),
        토: Math.round((counts.토 / 8) * 100),
        금: Math.round((counts.금 / 8) * 100),
        수: Math.round((counts.수 / 8) * 100),
    };

    const mainElement = STEM_ELEMENTS[saju.day.stem];
    const dominant = (Object.keys(normalizedScores) as Element[]).filter(k => normalizedScores[k] > 25);
    const lacking = (Object.keys(normalizedScores) as Element[]).filter(k => normalizedScores[k] < 10);
    const excessive = (Object.keys(normalizedScores) as Element[]).filter(k => normalizedScores[k] > 40);

    return {
        scores: normalizedScores,
        counts,
        basicPercentages,
        dominant,
        lacking,
        excessive,
        mainElement
    };
}
