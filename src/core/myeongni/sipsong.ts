/**
 * Sipsong (Ten Gods) Analysis Module
 * 
 * Determines the relationships between the Day Stem (Self) and other characters.
 * 
 * 1. Bi-gyeon (Same element, same polarity) - Friends/Rivals
 * 2. Geop-jae (Same element, diff polarity) - Competition
 * 3. Sik-shin (Self generates, same polarity) - Expression/Creativity
 * 4. Sang-gwan (Self generates, diff polarity) - Rebellion/Talent
 * 5. Pyeon-jae (Self controls, same polarity) - Windfall wealth
 * 6. Jeong-jae (Self controls, diff polarity) - Stable wealth
 * 7. Pyeon-gwan (Controls self, same polarity) - Authority/Pressure
 * 8. Jeong-gwan (Controls self, diff polarity) - Law/Honor
 * 9. Pyeon-in (Generates self, same polarity) - Unconventional wisdom
 * 10. Jeong-in (Generates self, diff polarity) - Academic/Mother
 */

import { GanJi, FourPillars, Stem, Branch } from '../calendar/ganji';
import { Element } from './elements';

export type Sipsong =
    | '비견' | '겁재'
    | '식신' | '상관'
    | '편재' | '정재'
    | '편관' | '정관'
    | '편인' | '정인';

const STEM_ELEMENTS: Record<Stem, Element> = {
    '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
    '기': '토', '경': '금', '신': '금', '임': '수', '계': '수'
};

const BRANCH_ELEMENTS: Record<Branch, Element> = {
    '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화',
    '오': '화', '미': '토', '신': '금', '유': '금', '술': '토', '해': '수'
};

const ELEMENT_GENERATION = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목'
};

const ELEMENT_CONTROL = {
    '목': '토', '화': '금', '토': '수', '금': '목', '수': '화'
};

const YANG_STEMS = new Set(['갑', '병', '무', '경', '임']);
const YANG_BRANCHS = new Set(['자', '인', '진', '오', '신', '술']);

function isYang(char: Stem | Branch): boolean {
    if (Object.keys(STEM_ELEMENTS).includes(char as string)) {
        return YANG_STEMS.has(char as Stem);
    }
    return YANG_BRANCHS.has(char as Branch);
}

function calculateOneSipsong(selfStem: Stem, target: Stem | Branch): Sipsong {
    const selfElement = STEM_ELEMENTS[selfStem];
    const targetElement = (Object.keys(STEM_ELEMENTS).includes(target as string))
        ? STEM_ELEMENTS[target as Stem]
        : BRANCH_ELEMENTS[target as Branch];

    const selfYang = isYang(selfStem);
    const targetYang = isYang(target);
    const samePolarity = selfYang === targetYang;

    if (selfElement === targetElement) {
        return samePolarity ? '비견' : '겁재';
    }

    if (ELEMENT_GENERATION[selfElement] === targetElement) {
        return samePolarity ? '식신' : '상관';
    }

    if (ELEMENT_CONTROL[selfElement] === targetElement) {
        return samePolarity ? '편재' : '정재';
    }

    if (ELEMENT_CONTROL[targetElement] === selfElement) {
        return samePolarity ? '편관' : '정관';
    }

    // Only remaining case: Target Generates Self
    return samePolarity ? '편인' : '정인';
}

export interface SipsongResult {
    yearStem: Sipsong;
    yearBranch: Sipsong;
    monthStem: Sipsong;
    monthBranch: Sipsong;
    dayBranch: Sipsong; // Day Stem is Self
    hourStem: Sipsong;
    hourBranch: Sipsong;
}

export function analyzeSipsong(saju: FourPillars): SipsongResult {
    const self = saju.day.stem; // Day Master

    return {
        yearStem: calculateOneSipsong(self, saju.year.stem),
        yearBranch: calculateOneSipsong(self, saju.year.branch),
        monthStem: calculateOneSipsong(self, saju.month.stem),
        monthBranch: calculateOneSipsong(self, saju.month.branch),
        dayBranch: calculateOneSipsong(self, saju.day.branch),
        hourStem: calculateOneSipsong(self, saju.hour.stem),
        hourBranch: calculateOneSipsong(self, saju.hour.branch),
    };
}
