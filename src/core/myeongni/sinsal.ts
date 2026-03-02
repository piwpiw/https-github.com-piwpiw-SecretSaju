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

export type SinsalType = '도화살' | '역마살' | '화개살' | '천을귀인' | '문창귀인' | '백호살' | '괴강살' | '고란살';

export interface Sinsal {
    type: SinsalType;
    name: string;
    pillar: 'year' | 'month' | 'day' | 'hour';
    description: string;
}

const TRIADS: Record<string, string> = {
    '인': '화', '오': '화', '술': '화',
    '신': '수', '자': '수', '진': '수',
    '사': '금', '유': '금', '축': '금',
    '해': '목', '묘': '목', '미': '목'
};

function getSinsalType(baseBranch: string, targetBranch: string): SinsalType | null {
    const baseTriad = TRIADS[baseBranch];
    if (!baseTriad) return null;

    if (baseTriad === '화' && targetBranch === '신') return '역마살';
    if (baseTriad === '수' && targetBranch === '인') return '역마살';
    if (baseTriad === '금' && targetBranch === '해') return '역마살';
    if (baseTriad === '목' && targetBranch === '사') return '역마살';

    if (baseTriad === '화' && targetBranch === '묘') return '도화살';
    if (baseTriad === '수' && targetBranch === '유') return '도화살';
    if (baseTriad === '금' && targetBranch === '오') return '도화살';
    if (baseTriad === '목' && targetBranch === '자') return '도화살';

    if (baseTriad === '화' && targetBranch === '술') return '화개살';
    if (baseTriad === '수' && targetBranch === '진') return '화개살';
    if (baseTriad === '금' && targetBranch === '축') return '화개살';
    if (baseTriad === '목' && targetBranch === '미') return '화개살';

    return null;
}

export function analyzeSinsal(saju: FourPillars): Sinsal[] {
    const result: Sinsal[] = [];
    const dayStem = saju.day.stem;
    const dayBranch = saju.day.branch;
    
    const pillars = [
        { name: 'year', stem: saju.year.stem, branch: saju.year.branch },
        { name: 'month', stem: saju.month.stem, branch: saju.month.branch },
        { name: 'day', stem: saju.day.stem, branch: saju.day.branch },
        { name: 'hour', stem: saju.hour.stem, branch: saju.hour.branch },
    ] as const;

    // 1. Classical Shinsal (Triad based)
    const baseYear = saju.year.branch;
    const baseDay = saju.day.branch;

    pillars.forEach(p => {
        // From Year
        if (p.name !== 'year') {
            const type = getSinsalType(baseYear, p.branch);
            if (type) result.push({ type, name: type, pillar: p.name, description: getDescription(type) });
        }
        // From Day
        if (p.name !== 'day') {
            const type = getSinsalType(baseDay, p.branch);
            if (type && !result.some(r => r.type === type && r.pillar === p.name)) {
                result.push({ type, name: type, pillar: p.name, description: getDescription(type) });
            }
        }
    });

    // 2. Chun-Eul-Gwi-In (Highest Noble)
    const gwiInMap: Record<string, string[]> = {
        '갑': ['축', '미'], '무': ['축', '미'], '경': ['축', '미'],
        '을': ['자', '신'], '기': ['자', '신'],
        '병': ['유', '해'], '정': ['유', '해'],
        '신': ['인', '오'],
        '임': ['사', '묘'], '계': ['사', '묘']
    };
    const targetGwiIn = gwiInMap[dayStem] || [];
    pillars.forEach(p => {
        if (targetGwiIn.includes(p.branch)) {
            result.push({ type: '천을귀인', name: '천을귀인', pillar: p.name, description: getDescription('천을귀인') });
        }
    });

    // 3. Moon-Chang-Gwi-In (Scholarship)
    const moonChangMap: Record<string, string> = {
        '갑': '사', '을': '오', '병': '신', '정': '유', '무': '신', '기': '유', '경': '해', '신': '자', '임': '인', '계': '묘'
    };
    const targetMoonChang = moonChangMap[dayStem];
    pillars.forEach(p => {
        if (p.branch === targetMoonChang) {
            result.push({ type: '문창귀인', name: '문창귀인', pillar: p.name, description: getDescription('문창귀인') });
        }
    });

    // 4. Baek-Ho (White Tiger - Intensity)
    const baekHoPillars = ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'];
    pillars.forEach(p => {
        if (baekHoPillars.includes(p.stem + p.branch)) {
            result.push({ type: '백호살', name: '백호살', pillar: p.name, description: getDescription('백호살') });
        }
    });

    // 5. Gwoe-Gang (Power/Command)
    const gwoeGangPillars = ['무진', '무술', '경진', '경술', '임진', '임술'];
    pillars.forEach(p => {
        if (gwoeGangPillars.includes(p.stem + p.branch)) {
             result.push({ type: '괴강살', name: '괴강살', pillar: p.name, description: getDescription('괴강살') });
        }
    });

    return result;
}

function getDescription(type: SinsalType): string {
    switch (type) {
        case '도화살': return '매력과 인기가 넘치나 이성 관계 복잡성 주의';
        case '역마살': return '활동 범위가 넓고 이동과 변화가 많은 삶';
        case '화개살': return '예술적 감수성과 지적 탐구심, 종교적 심성';
        case '천을귀인': return '가장 존귀한 길신으로 위기에서 도움을 받음';
        case '문창귀인': return '학문과 예술의 재능이 뛰어나며 두뇌 회전이 빠름';
        case '백호살': return '강한 기질과 추진력을 상징하며 혈광 주의';
        case '괴강살': return '강인한 성격과 리더십, 극적인 성공과 변화';
        case '고란살': return '외로운 기운으로 혼자만의 시간이 중요함';
        default: return '';
    }
}
