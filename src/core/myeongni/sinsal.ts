/**
 * Sinsal (Special Stars) Analysis Module
 * 
 * Identifies special energy patterns in the Saju.
 * Major Stars:
 * 1. Do-hwa (Peach Blossom) - Attraction, Popularity
 * 2. Yeok-ma (Station Horse) - Movement, Change, Travel
 * 3. Hwa-gae (Art) - Creativity, Religion, Isolation
 * 
 * Logic: Usually based on interaction between [Year/Day Branch] and [Other Branches]
 */

import { FourPillars, Branch } from '../calendar/ganji';

export type SinsalType = '도화살' | '역마살' | '화개살' | '귀인';

export interface Sinsal {
    type: SinsalType;
    name: string;
    pillar: 'year' | 'month' | 'day' | 'hour';
    description: string;
}

// 12 Shinsal lookup table (simplified)
// Based on Triad (Sam-hap)
// In-O-Sul (Fire) -> Ji-sal(In) ...
// Shin-Ja-Jin (Water) -> ...
// Sa-Yu-Chuk (Metal) -> ...
// Hae-Myo-Mi (Wood) -> ...

const TRIADS = {
    '인': '화', '오': '화', '술': '화',
    '신': '수', '자': '수', '진': '수',
    '사': '금', '유': '금', '축': '금',
    '해': '목', '묘': '목', '미': '목'
};

// Key Sinsal Mappings (Year/Day Branch -> Target Branch)
// Yeok-ma (Travel): In, Shin, Sa, Hae
// Do-hwa (Peach): Ja, O, Myo, Yu
// Hwa-gae (Art): Jin, Sul, Chuk, Mi

// Standard lookup:
// If base is In/O/Sul: 
// - Shin (Yeok-ma)
// - Myo (Do-hwa)
// - Sul (Hwa-gae) ... wait, Hwa-gae is usually the tomb of the triad? Yes, Sul.

// Simplified Sinsal Logic for MVP
function getSinsal(baseBranch: Branch, targetBranch: Branch): SinsalType | null {
    const baseTriad = TRIADS[baseBranch];

    // Yeok-ma (Movement)
    // In-O-Sul -> Shin
    // Shin-Ja-Jin -> In
    // Sa-Yu-Chuk -> Hae
    // Hae-Myo-Mi -> Sa
    if (baseTriad === '화' && targetBranch === '신') return '역마살';
    if (baseTriad === '수' && targetBranch === '인') return '역마살';
    if (baseTriad === '금' && targetBranch === '해') return '역마살';
    if (baseTriad === '목' && targetBranch === '사') return '역마살';

    // Do-hwa (Attraction)
    // In-O-Sul -> Myo
    // Shin-Ja-Jin -> Yu
    // Sa-Yu-Chuk -> O
    // Hae-Myo-Mi -> Ja
    if (baseTriad === '화' && targetBranch === '묘') return '도화살';
    if (baseTriad === '수' && targetBranch === '유') return '도화살';
    if (baseTriad === '금' && targetBranch === '오') return '도화살';
    if (baseTriad === '목' && targetBranch === '자') return '도화살';

    // Hwa-gae (Arts)
    // In-O-Sul -> Sul
    // Shin-Ja-Jin -> Jin
    // Sa-Yu-Chuk -> Chuk
    // Hae-Myo-Mi -> Mi
    if (baseTriad === '화' && targetBranch === '술') return '화개살';
    if (baseTriad === '수' && targetBranch === '진') return '화개살';
    if (baseTriad === '금' && targetBranch === '축') return '화개살';
    if (baseTriad === '목' && targetBranch === '미') return '화개살';

    return null;
}

export function analyzeSinsal(saju: FourPillars): Sinsal[] {
    const result: Sinsal[] = [];

    // Base 1: Year Branch (Older method, still valid for fate)
    const baseYear = saju.year.branch;

    // Base 2: Day Branch (Modern method, inner psychology)
    const baseDay = saju.day.branch;

    const targetsRaw = [
        { b: saju.year.branch, p: 'year' },
        { b: saju.month.branch, p: 'month' },
        { b: saju.day.branch, p: 'day' },
        { b: saju.hour.branch, p: 'hour' }
    ] as const;

    // Check against Year Base
    targetsRaw.forEach(t => {
        if (t.p === 'year') return; // Skip self
        const type = getSinsal(baseYear, t.b);
        if (type) {
            result.push({ type, name: type, pillar: t.p, description: getDescription(type) });
        }
    });

    // Check against Day Base
    targetsRaw.forEach(t => {
        if (t.p === 'day') return; // Skip self
        const type = getSinsal(baseDay, t.b);
        if (type) {
            // Avoid duplicates if already found via Year base?
            // Usually we keep both, noting origin. For MVP, just add.
            // Check uniqueness to make list clean
            const exists = result.find(r => r.type === type && r.pillar === t.p);
            if (!exists) {
                result.push({ type, name: type, pillar: t.p, description: getDescription(type) });
            }
        }
    });

    return result;
}

function getDescription(type: SinsalType): string {
    switch (type) {
        case '도화살': return '매력과 인기가 넘치지만 구설수 조심';
        case '역마살': return '이동과 변화가 많음. 해외 운 있음';
        case '화개살': return '예술적 재능과 종교적 심성. 고독할 수 있음';
        default: return '';
    }
}
