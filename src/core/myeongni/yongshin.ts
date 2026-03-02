/**
 * Yongshin (Favorable God) & Kisin (Unfavorable God) Analysis Module
 * 
 * Implements global standard Bazi analysis:
 * 1. Eok-bu (억부용신): Balance based on the strength of the Day Master (GangYak).
 * 2. Jo-hoo (조후용신): Balance based on temperature and humidity.
 * 3. Final Selection: Identifies Yongshin(용신), Heeshin(희신), Kisin(기신), Gushin(구신).
 */

import { Element, ElementAnalysisResult } from './elements';
import { GangYakScore } from '../../lib/advancedScoring';

export type YongshinRole = '용신' | '희신' | '기신' | '구신' | '한신';

export interface YongshinDetail {
    element: Element;
    role: YongshinRole;
    reason: string;
}

export interface YongshinAnalysis {
    primary: YongshinDetail;       // The most critical favorable element
    secondary: YongshinDetail;     // Supporting favorable element
    unfavorable: YongshinDetail;   // The most critical unfavorable element
    source: '조후' | '억부'; // Which method determined the primary Yongshin
}

const ELEMENT_GENERATION: Record<Element, Element> = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목'
};

const ELEMENT_CONTROL: Record<Element, Element> = {
    '목': '토', '화': '금', '토': '수', '금': '목', '수': '화'
};

const INVERSE_GENERATION: Record<Element, Element> = {
    '화': '목', '토': '화', '금': '토', '수': '금', '목': '수'
};

/**
 * Derives the favorable and unfavorable elements.
 * 
 * @param elements The result of the Five Elements analysis
 * @param gangyak The strength/weakness score of the Day Master
 */
export function calculateYongshin(
    elements: ElementAnalysisResult,
    gangyak: GangYakScore
): YongshinAnalysis {
    const mainElement = elements.mainElement;
    
    // 1. Jo-hoo (Temperature/Humidity) priority check.
    // In strict Bazi, if Jo-hoo is extreme, it often overrides Eok-bu.
    const temp = elements.balance.temperature;
    
    if (temp === 'Hot') {
        return {
            source: '조후',
            primary: { element: '수', role: '용신', reason: '사주가 너무 뜨거워 열기를 식힐 수(水) 조후용신이 시급합니다.' },
            secondary: { element: '금', role: '희신', reason: '수(水)를 생해주는 금(金)이 희신이 됩니다.' },
            unfavorable: { element: '화', role: '기신', reason: '열기를 더하는 화(火)가 가장 불리합니다.' }
        };
    }
    
    if (temp === 'Cold') {
        return {
            source: '조후',
            primary: { element: '화', role: '용신', reason: '사주가 너무 차가워 온기를 더할 화(火) 조후용신이 시급합니다.' },
            secondary: { element: '목', role: '희신', reason: '화(火)를 불태울 장작인 목(木)이 희신이 됩니다.' },
            unfavorable: { element: '수', role: '기신', reason: '냉기를 더하는 수(水)가 가장 불리합니다.' }
        };
    }

    // 2. Eok-bu (Strength/Weakness) Calculation
    // If temperature is balanced, or not extreme enough, use Eok-bu.
    // 억부용신: 
    // - 신강(Strong): Needs Control (식상, 재성, 관성), heavily depends on dominant elements.
    // - 신약(Weak): Needs Support (인성, 비겁).
    
    if (gangyak.level === '신강') {
        // Find which draining element is best.
        // Usually, if overly strong, we want to drain memory with Generation (Sik-Sang) OR Control (Gwan-Seong).
        // Let's look at what is lacking.
        const drainElement = ELEMENT_GENERATION[mainElement]; // 식상
        const controlSelfElement = INVERSE_GENERATION[INVERSE_GENERATION[mainElement]]; // 관성 (This is tricky. 목 <- 금. So inverse of inverse? Wait. Control map.)
        
        // Find the element that controls the main element
        const controller = (Object.keys(ELEMENT_CONTROL) as Element[]).find(k => ELEMENT_CONTROL[k] === mainElement) as Element;
        
        // If the chart has too much Bi-Geop (Self element), Gwan-Seong (Controller) is best.
        // For simplicity, we choose the draining element (Sik-Sang) as primary if balanced, or controller if Bi-geop is > 50%.
        let primaryE: Element = drainElement;
        let secondaryE: Element = ELEMENT_GENERATION[drainElement]; // 재성 (Wealth)
        let unfavorableE: Element = INVERSE_GENERATION[mainElement]; // 인성 (Mother)
        
        if (elements.scores[mainElement] > 50) {
            primaryE = controller; // 관성
            secondaryE = ELEMENT_GENERATION[primaryE]; // 재성
            unfavorableE = mainElement; // 비겁
        }

        return {
            source: '억부',
            primary: { element: primaryE, role: '용신', reason: `일간이 강하므로 기운을 설기하거나 제어하는 ${primaryE} 오행이 용신입니다.` },
            secondary: { element: secondaryE, role: '희신', reason: `용신을 생조하는 ${secondaryE} 오행이 희신입니다.` },
            unfavorable: { element: unfavorableE, role: '기신', reason: `이미 강한 일간을 더 강하게 만드는 ${unfavorableE} 오행이 기신입니다.` }
        };
    } 
    else if (gangyak.level === '신약') {
        // Weak. Needs Mother (In-Seong) or Self (Bi-Geop).
        const motherElement = INVERSE_GENERATION[mainElement];
        
        return {
            source: '억부',
            primary: { element: motherElement, role: '용신', reason: `일간이 약하므로 나를 생해주는 ${motherElement} 오행(인성)이 용신입니다.` },
            secondary: { element: mainElement, role: '희신', reason: `나와 같은 기운인 ${mainElement} 오행(비겁)이 희신입니다.` },
            // Controller (Gwan-Seong) is worst.
            unfavorable: { element: (Object.keys(ELEMENT_CONTROL) as Element[]).find(k => ELEMENT_CONTROL[k] === mainElement) as Element, role: '기신', reason: `약한 일간을 더욱 극하는 오행이 기신입니다.` }
        };
    }

    // Balanced (중화)
    // Needs Tong-gwan (Mediation) or whatever is lacking from the 5 elements.
    const lacking = elements.lacking.length > 0 ? elements.lacking[0] : ELEMENT_GENERATION[mainElement];
    
    return {
        source: '억부',
        primary: { element: lacking, role: '용신', reason: '사주가 중화되어 조화로우며, 현재 가장 부족한 기운이 용신 역할을 합니다.' },
        secondary: { element: INVERSE_GENERATION[lacking], role: '희신', reason: '용신을 보조하는 기운입니다.' },
        unfavorable: { element: (Object.keys(ELEMENT_CONTROL) as Element[]).find(k => ELEMENT_CONTROL[k] === lacking) as Element, role: '기신', reason: '사주의 균형을 깨뜨리는 오행입니다.' }
    };
}
