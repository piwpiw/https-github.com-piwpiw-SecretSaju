/**
 * Five Elements (O-haeng) Analysis Module
 * 
 * Analyzes the balance of Wood, Fire, Earth, Metal, Water in the 8 characters (Four Pillars).
 * Determines strength, weakness, and missing elements.
 */

import { FourPillars, Stem, Branch } from '../calendar/ganji';
import { calculateSaryeong, SaryeongResult } from './jijanggan';
import { getCurrentSolarTerm, getAnnualSolarTerms } from '../astronomy/solar-terms';

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
    /** Advanced: Jo-Hoo (Seasonal Balance) */
    balance: {
        temperature: 'Cold' | 'Hot' | 'Balanced';
        humidity: 'Dry' | 'Wet' | 'Balanced';
        score: number; // 0-100, where 100 is perfectly balanced
    };
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

export function analyzeElements(saju: FourPillars, baseDateKST?: Date): ElementAnalysisResult {
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

        // Add Stem contribution
        scores[sEl] += stemWeight;
        counts[sEl] += 1;

        // Branch (Distribute branch weight across hidden stems)
        // Global Standard: For the Month Branch, use exact Saryeong (Commander) calculation if baseDate is provided.
        // For other branches (Year, Day, Hour), we use the default static weight distribution for now, 
        // as Saryeong strictly dictates the Seasonal (Month) Qi.
        let dynamicWeights: { stem: Stem; weight: number }[] | null = null;

        if (branchWeight === WEIGHTS.MONTH_BRANCH && baseDateKST) {
            // Find the exact solar term start date for the current month
            const year = baseDateKST.getFullYear();
            const solarTerms = getAnnualSolarTerms(year);
            // Saju months: 1st month starts at Ipchun (index 0)
            const currentTerm = getCurrentSolarTerm(baseDateKST);

            // Sometimes it belongs to the previous year's late solar terms (Sohan, Daehan)
            // But getCurrentSolarTerm returns the absolute term info.
            // We just need the exact Date of that term.
            const exactTermDate = solarTerms.find(t => t.name === currentTerm.name)?.date || baseDateKST;

            const saryeong = calculateSaryeong(branch, exactTermDate, baseDateKST);
            dynamicWeights = saryeong.weights;
        }

        if (dynamicWeights) {
            // Use dynamically calculated weights
            dynamicWeights.forEach(h => {
                const hElement = STEM_ELEMENTS[h.stem];
                // Weight here is normalized to 30. We scale it to the branchWeight (e.g. 30 for month)
                const distributedWeight = (h.weight / 30) * branchWeight;
                scores[hElement] += distributedWeight;
            });
        } else {
            // Fallback to static weights
            const hidden = HIDDEN_STEMS[branch];
            if (!hidden) throw new Error(`[saju-engine] Missing hidden stem data for branch: ${branch}`);

            const totalHiddenWeight = hidden.reduce((sum, h) => sum + h.weight, 0);

            hidden.forEach(h => {
                const hElement = STEM_ELEMENTS[h.stem];
                const distributedWeight = (h.weight / totalHiddenWeight) * branchWeight;
                scores[hElement] += distributedWeight;
            });
        }

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

    // 4. Advanced: Jo-Hoo (Seasonal Temperature/Humidity Balance)
    // Month branch is the primary factor for Jo-Hoo
    const month = saju.month.branch;
    const isWinter = ['해', '자', '축'].includes(month);
    const isSummer = ['사', '오', '미'].includes(month);
    const isSpring = ['인', '묘', '진'].includes(month);
    const isAutumn = ['신', '유', '술'].includes(month);

    let temp: 'Cold' | 'Hot' | 'Balanced' = 'Balanced';
    let humid: 'Dry' | 'Wet' | 'Balanced' = 'Balanced';
    let balanceScore = 80;

    // Basic Temperature logic
    if (isWinter) temp = 'Cold';
    if (isSummer) temp = 'Hot';

    // Refinement based on Fire/Water scores
    if (normalizedScores.화 > 40) temp = 'Hot';
    if (normalizedScores.수 > 40) temp = 'Cold';
    if (normalizedScores.화 > 20 && normalizedScores.수 > 20) temp = 'Balanced';

    // Humidity logic (Metal/Water vs Wood/Fire/Earth)
    if (normalizedScores.수 > 30 || normalizedScores.목 > 30) humid = 'Wet';
    if (normalizedScores.화 > 30 || normalizedScores.토 > 30) humid = 'Dry';

    // Penalty for extremes
    if (temp !== 'Balanced') balanceScore -= 20;
    if (humid !== 'Balanced') balanceScore -= 10;

    return {
        scores: normalizedScores,
        counts,
        basicPercentages,
        dominant,
        lacking,
        excessive,
        mainElement,
        balance: {
            temperature: temp,
            humidity: humid,
            score: Math.max(0, balanceScore)
        }
    };
}
