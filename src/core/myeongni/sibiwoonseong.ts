/**
 * Sibiwoonseong (12 Phases of Energy) Module
 * 
 * Represents the lifecycle of heavy energy (Qi).
 * Calculated based on Day Stem vs. Any Branch.
 */

import { Stem, Branch, FourPillars, BRANCHES } from '../calendar/ganji';

export type Sibiwoonseong =
    | '장생' | '목욕' | '관대' | '건록' | '제왕' | '쇠'
    | '병' | '사' | '묘' | '절' | '태' | '양';

const PHASES: Sibiwoonseong[] = [
    '장생', '목욕', '관대', '건록', '제왕', '쇠',
    '병', '사', '묘', '절', '태', '양'
];

// Start Branch for 'Jang-saeng' (Birth) for each Stem
const JANGSAENG_START: Record<Stem, Branch> = {
    '갑': '해',
    '을': '오',
    '병': '인',
    '정': '유',
    '무': '인',
    '기': '유',
    '경': '사',
    '신': '자',
    '임': '신',
    '계': '묘',
};

const IS_YANG_STEM: Record<Stem, boolean> = {
    '갑': true, '을': false,
    '병': true, '정': false,
    '무': true, '기': false,
    '경': true, '신': false,
    '임': true, '계': false
};

export interface SibiwoonseongAnalysis {
    year: Sibiwoonseong;
    month: Sibiwoonseong;
    day: Sibiwoonseong;
    hour: Sibiwoonseong;
}

export interface SibiwoonseongInfo {
    name: Sibiwoonseong;
    description: string;
}

export function getSibiwoonseong(stem: Stem, branch: Branch): Sibiwoonseong {
    const startBranch = JANGSAENG_START[stem];
    const startIndex = BRANCHES.indexOf(startBranch);
    const targetIndex = BRANCHES.indexOf(branch);

    let diff;
    if (IS_YANG_STEM[stem]) {
        // Forward
        diff = (targetIndex - startIndex + 12) % 12;
    } else {
        // Backward
        diff = (startIndex - targetIndex + 12) % 12;
    }

    return PHASES[diff];
}

export function analyzeSibiwoonseongAll(saju: FourPillars): SibiwoonseongAnalysis {
    const dayStem = saju.day.stem;

    return {
        year: getSibiwoonseong(dayStem, saju.year.branch),
        month: getSibiwoonseong(dayStem, saju.month.branch),
        day: getSibiwoonseong(dayStem, saju.day.branch), // Self-sitting
        hour: getSibiwoonseong(dayStem, saju.hour.branch),
    };
}
