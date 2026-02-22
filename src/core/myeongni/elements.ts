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
    scores: ElementScores;
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

// Weighting for score calculation (Total 10~12 points? or 100?)
// Standard simple weighting:
// Month Branch (Season) has highest weight (e.g., 3.0)
// Day Stem (Self) has weight (e.g., 1.0)
// Others: 1.0 approx
const WEIGHTS = {
    YEAR_STEM: 1.0,
    YEAR_BRANCH: 1.0,
    MONTH_STEM: 1.0,
    MONTH_BRANCH: 2.5, // Season is critical
    DAY_STEM: 1.5,     // Reference point
    DAY_BRANCH: 1.5,   // Spouse palace, sits under
    HOUR_STEM: 1.0,
    HOUR_BRANCH: 1.0
};

export function analyzeElements(saju: FourPillars): ElementAnalysisResult {
    const scores: ElementScores = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

    // Calculate raw counts first? No, weighted scores.

    // Year
    scores[STEM_ELEMENTS[saju.year.stem]] += WEIGHTS.YEAR_STEM;
    scores[BRANCH_ELEMENTS[saju.year.branch]] += WEIGHTS.YEAR_BRANCH;

    // Month
    scores[STEM_ELEMENTS[saju.month.stem]] += WEIGHTS.MONTH_STEM;
    scores[BRANCH_ELEMENTS[saju.month.branch]] += WEIGHTS.MONTH_BRANCH;

    // Day
    const mainElement = STEM_ELEMENTS[saju.day.stem];
    scores[mainElement] += WEIGHTS.DAY_STEM;
    scores[BRANCH_ELEMENTS[saju.day.branch]] += WEIGHTS.DAY_BRANCH;

    // Hour
    scores[STEM_ELEMENTS[saju.hour.stem]] += WEIGHTS.HOUR_STEM;
    scores[BRANCH_ELEMENTS[saju.hour.branch]] += WEIGHTS.HOUR_BRANCH;

    // Determine characteristics
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const threshold = totalScore * 0.2; // 20% is average balance

    const dominant = (Object.keys(scores) as Element[]).filter(k => scores[k] > threshold * 1.5);
    const lacking = (Object.keys(scores) as Element[]).filter(k => scores[k] < threshold * 0.5);
    const excessive = (Object.keys(scores) as Element[]).filter(k => scores[k] > threshold * 2.0);

    return {
        scores,
        dominant,
        lacking,
        excessive,
        mainElement
    };
}
/**
 * Alias for analyzeElements for backward compatibility/consistency
 */
export const analyzeElementBalance = analyzeElements;
