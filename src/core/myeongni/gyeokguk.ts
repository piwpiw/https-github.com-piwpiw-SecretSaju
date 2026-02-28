/**
 * Gyeokguk (Fate Structure) Analysis Module
 * 
 * Determines the primary "Social Role" or "Frame" of the person.
 * Based on the Month Pillar (Season).
 * 
 * Main Logic (Simplified Nae-gyeok):
 * 1. Identify Month Branch.
 * 2. Look for Hidden Stems (Ji-jang-gan) in Month Branch.
 * 3. Check if any Hidden Stem protrudes (is present) in Year/Month/Hour Stems.
 * 4. If yes, that defines the Gyeok.
 * 5. If no, use the main energy of the Month Branch.
 * 
 * Sipsong of the resulting Stem relative to Day Master = Gyeok Name.
 * e.g., If resulting stem is Jeong-gwan -> Jeong-gwan Gyeok.
 */

import { FourPillars, Stem, Branch } from '../calendar/ganji';
import { Sipsong } from './sipsong';
import { analyzeSipsong, calculateOneSipsong } from './sipsong';

export type Gyeokguk =
    | '비견격' | '겁재격' // AKA Geon-rok gyeok, Yang-in gyeok
    | '식신격' | '상관격'
    | '편재격' | '정재격'
    | '편관격' | '정관격'
    | '편인격' | '정인격'
    | '종격' | '기타';

export type JungGyeokguk = 'Jung';
export type JongGyeokguk = 'Jong';
export type JeonwangGyeokguk = 'Jeonwang';

export interface GyeokgukInfo {
    gyeok: Gyeokguk;
    name: string;
    description: string;
}

// Hidden Stems (Ji-jang-gan) Mapping
// Month Branch -> [Initial, Middle, Main]
const HIDDEN_STEMS: Record<Branch, Stem[]> = {
    '자': ['임', '계'],       // Im (10), Gye (20)
    '축': ['계', '신', '기'], // Gye (9), Sin (3), Gi (18)
    '인': ['무', '병', '갑'], // Mu (7), Byeong (7), Gap (16)
    '묘': ['갑', '을'],       // Gap (10), Eul (20)
    '진': ['을', '계', '무'], // Eul (9), Gye (3), Mu (18)
    '사': ['무', '경', '병'], // Mu (7), Gyeong (7), Byeong (16)
    '오': ['병', '기', '정'], // Byeong (10), Gi (9), Jeong (11)
    '미': ['정', '을', '기'], // Jeong (9), Eul (3), Gi (18)
    '신': ['무', '임', '경'], // Mu (7), Im (7), Gyeong (16)
    '유': ['경', '신'],       // Gyeong (10), Sin (20)
    '술': ['신', '정', '무'], // Sin (9), Jeong (3), Mu (18)
    '해': ['무', '갑', '임']  // Mu (7), Gap (7), Im (16)
};

// Placeholder types for complex output
// Already defined above as types

export function determineGyeokguk(saju: FourPillars): GyeokgukInfo {
    const monthBranch = saju.month.branch;
    const hidden = HIDDEN_STEMS[monthBranch];

    // Protrusion Check
    // Check if Main, Middle, or Initial appears in Year/Month/Hour Stems
    // Priority: Main > Middle > Initial (Typical rule)

    const stems = [saju.year.stem, saju.month.stem, saju.hour.stem];

    let selectedStem: Stem | null = null;

    // Check Main (Last one)
    const main = hidden[hidden.length - 1];
    if (stems.includes(main)) {
        selectedStem = main;
    } else {
        // Check Middle (if exists)
        if (hidden.length === 3) {
            const middle = hidden[1];
            if (stems.includes(middle)) {
                selectedStem = middle;
            }
        }
        // Check Initial
        if (!selectedStem) {
            const initial = hidden[0];
            if (stems.includes(initial)) {
                selectedStem = initial;
            }
        }
    }

    // Fallback: Use Main energy of Month Branch
    if (!selectedStem) {
        selectedStem = main;
    }

    const gyeokSipsong = calculateOneSipsong(saju.day.stem, selectedStem);

    const GYEOK_MAP: Record<Sipsong, Gyeokguk> = {
        '비견': '비견격',
        '겁재': '겁재격',
        '식신': '식신격',
        '상관': '상관격',
        '편재': '편재격',
        '정재': '정재격',
        '편관': '편관격',
        '정관': '정관격',
        '편인': '편인격',
        '정인': '정인격'
    };

    const DESCRIPTIONS: Record<Gyeokguk, string> = {
        '비견격': '주관이 뚜렷하고 독립적인 성향 (건록격)',
        '겁재격': '경쟁심이 강하고 추진력이 뛰어남 (양인격)',
        '식신격': '창의적이고 연구심이 깊으며 의식주가 풍족함',
        '상관격': '재능과 표현력이 뛰어나고 비판적 사고가 발달함',
        '편재격': '모험적이고 유동적인 재물운과 사교적 성향',
        '정재격': '성실하고 안정적인 자산 관리와 정직한 태도',
        '편관격': '강한 의지력과 리더십, 명예를 중시하는 성향',
        '정관격': '합리적이고 원칙을 준수하는 관리자형 성향',
        '편인격': '직관력이 뛰어나고 예술적, 학구적인 심미안',
        '정인격': '자애롭고 학문적 소양이 깊으며 수동적인 안정감',
        '종격': '특정한 기운에 순응하여 발휘되는 강력한 운세',
        '기타': '다양한 기운이 조화를 이루는 일반적인 삶의 구조'
    };

    const gyeok = GYEOK_MAP[gyeokSipsong] || '기타';

    return {
        gyeok,
        name: gyeok,
        description: DESCRIPTIONS[gyeok]
    };
}
