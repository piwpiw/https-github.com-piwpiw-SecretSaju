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

/**
 * 대상이 천간인지 지지인지.
 *
 * 이 구분이 왜 필요한가:
 * 한글 표기에서 천간과 지지가 겹치는 글자가 하나 있다. **신**이다.
 * 천간 신(辛)은 음금, 지지 신(申)은 양금이다. 음양이 반대다.
 *
 * 예전에는 글자만 보고 `STEM_ELEMENTS` 에 있으면 천간으로 단정했다. 그래서
 * 지지 申 이 들어오면 辛 으로 취급돼 음양이 뒤집혔고, 십성이 한 칸씩 어긋났다.
 *
 *     갑 + 지지 신(申)  →  정관   (정답 편관)
 *     무 + 지지 신(申)  →  상관   (정답 식신)
 *
 * 사주 네 자리 중 하나가 申 일 확률이 30% 가량이라 드문 일도 아니었다.
 * 글자로 추측하지 말고 부르는 쪽이 알려 준다.
 */
export type SipsongTargetKind = 'stem' | 'branch';

function isYang(char: Stem | Branch, kind: SipsongTargetKind): boolean {
    return kind === 'stem' ? YANG_STEMS.has(char as Stem) : YANG_BRANCHS.has(char as Branch);
}

/**
 * 일간 기준으로 대상 글자의 십성을 구한다.
 *
 * @param selfStem 일간
 * @param target   대상 글자
 * @param kind     대상이 천간인지 지지인지. 기본값은 천간
 */
export function calculateOneSipsong(
    selfStem: Stem,
    target: Stem | Branch,
    kind: SipsongTargetKind = 'stem'
): Sipsong {
    const selfElement = STEM_ELEMENTS[selfStem];
    const targetElement = kind === 'stem'
        ? STEM_ELEMENTS[target as Stem]
        : BRANCH_ELEMENTS[target as Branch];

    const selfYang = isYang(selfStem, 'stem');
    const targetYang = isYang(target, kind);
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
        yearStem: calculateOneSipsong(self, saju.year.stem, 'stem'),
        yearBranch: calculateOneSipsong(self, saju.year.branch, 'branch'),
        monthStem: calculateOneSipsong(self, saju.month.stem, 'stem'),
        monthBranch: calculateOneSipsong(self, saju.month.branch, 'branch'),
        dayBranch: calculateOneSipsong(self, saju.day.branch, 'branch'),
        hourStem: calculateOneSipsong(self, saju.hour.stem, 'stem'),
        hourBranch: calculateOneSipsong(self, saju.hour.branch, 'branch'),
    };
}
