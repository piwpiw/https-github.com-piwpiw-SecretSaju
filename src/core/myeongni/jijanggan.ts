/**
 * Ji-jang-gan (Hidden Stems) Saryeong (Commander) Module
 *
 * Implements the global Bazi standard for dynamically calculating
 * the dominant hidden stem based on the exact number of days passed
 * since the start of the month (Jeol-gi).
 */

import { Branch, Stem } from '../calendar/ganji';

// Definition of Hidden Stems per Branch
// Format: [Initial (Yeogi), Middle (Junggi), Main (Bongi)]
// The numbers represent the traditional duration in days for each Qi phase.
export interface HiddenStemPhase {
    stem: Stem;
    days: number;   // Standard days of command
    weight: number; // Base percentage out of 30 or total days
}

export type SaryeongType = '초기' | '중기' | '정기'; // Initial, Middle, Main

export interface SaryeongResult {
    commander: Stem;      // The stem currently in command
    phase: SaryeongType;   // Which phase (Initial, Middle, Main)
    exactDaysPassed: number; // Days passed since the Solar Term
    // Weights distributed for score calculation (0~100 normalized per branch)
    weights: { stem: Stem; weight: number }[];
}

// 12 Branches Hidden Stems Standard (Usually totals 30 days)
// In(寅): Mu(7) Byeong(7) Gap(16)
// Myo(卯): Gap(10) Eul(20)
// Jin(辰): Eul(9) Gye(3) Mu(18)
// Sa(巳): Mu(7) Gyeong(7) Byeong(16)
// O(午): Byeong(10) Gi(9) Jeong(11)
// Mi(未): Jeong(9) Eul(3) Gi(18)
// Shin(申): Mu(7) Im(7) Gyeong(16)
// Yu(酉): Gyeong(10) Sin(20)
// Sul(戌): Sin(9) Jeong(3) Mu(18)
// Hae(亥): Mu(7) Gap(7) Im(16)
// Ja(子): Im(10) Gye(20)
// Chuk(丑): Gye(9) Sin(3) Gi(18)

export const JIJANGGAN_TABLE: Record<Branch, HiddenStemPhase[]> = {
    '자': [{ stem: '임', days: 10, weight: 10 }, { stem: '계', days: 20, weight: 20 }],
    '축': [{ stem: '계', days: 9, weight: 9 }, { stem: '신', days: 3, weight: 3 }, { stem: '기', days: 18, weight: 18 }],
    '인': [{ stem: '무', days: 7, weight: 7 }, { stem: '병', days: 7, weight: 7 }, { stem: '갑', days: 16, weight: 16 }],
    '묘': [{ stem: '갑', days: 10, weight: 10 }, { stem: '을', days: 20, weight: 20 }],
    '진': [{ stem: '을', days: 9, weight: 9 }, { stem: '계', days: 3, weight: 3 }, { stem: '무', days: 18, weight: 18 }],
    '사': [{ stem: '무', days: 7, weight: 7 }, { stem: '경', days: 7, weight: 7 }, { stem: '병', days: 16, weight: 16 }],
    '오': [{ stem: '병', days: 10, weight: 10 }, { stem: '기', days: 9, weight: 9 }, { stem: '정', days: 11, weight: 11 }],
    '미': [{ stem: '정', days: 9, weight: 9 }, { stem: '을', days: 3, weight: 3 }, { stem: '기', days: 18, weight: 18 }],
    '신': [{ stem: '무', days: 7, weight: 7 }, { stem: '임', days: 7, weight: 7 }, { stem: '경', days: 16, weight: 16 }],
    '유': [{ stem: '경', days: 10, weight: 10 }, { stem: '신', days: 20, weight: 20 }],
    '술': [{ stem: '신', days: 9, weight: 9 }, { stem: '정', days: 3, weight: 3 }, { stem: '무', days: 18, weight: 18 }],
    '해': [{ stem: '무', days: 7, weight: 7 }, { stem: '갑', days: 7, weight: 7 }, { stem: '임', days: 16, weight: 16 }],
};

/**
 * Calculates the exact commander (Saryeong) of the hidden stems based on birth date vs solar term date.
 *
 * @param branch The branch of the month (or day/year/hour, though traditionally Saryeong applies strictly to Month)
 * @param termDate The exact date/time of the solar term that started this month
 * @param birthDate The exact birth date/time
 */
export function calculateSaryeong(branch: Branch, termDate: Date, birthDate: Date): SaryeongResult {
    // Calculate days passed since the start of the solar term
    const diffMs = birthDate.getTime() - termDate.getTime();
    
    // Ensure days is at least 0.001 to avoid negative or exact 0 edge cases.
    const daysPassed = Math.max(0.001, diffMs / (1000 * 60 * 60 * 24));
    
    const phases = JIJANGGAN_TABLE[branch];
    let accumulatedDays = 0;
    
    let commander: Stem = phases[phases.length - 1].stem; // Default to Main Qi
    let phaseType: SaryeongType = '정기';
    
    // Determine commander based on standard duration boundaries
    for (let i = 0; i < phases.length; i++) {
        accumulatedDays += phases[i].days;
        if (daysPassed <= accumulatedDays) {
            commander = phases[i].stem;
            if (i === 0) phaseType = '초기';
            else if (i === 1 && phases.length === 3) phaseType = '중기';
            else phaseType = '정기';
            break;
        }
    }

    // Dynamic Weighting Calculation (Global Standard Requirement)
    // Instead of static [10, 20] or [7, 7, 16], we dynamically boost the weight
    // of the actively commanding stem by 50%, while reducing others proportionally.
    // This reflects the "Qi" strength of the current time.
    
    const weights = phases.map(p => ({ stem: p.stem, weight: p.weight }));
    
    // Find the commander in the weights array and boost it
    const commanderIndex = weights.findIndex(w => w.stem === commander);
    if (commanderIndex !== -1) {
        // Boost commander by ~50% of its base weight
        const boost = weights[commanderIndex].weight * 0.5;
        weights[commanderIndex].weight += boost;
        
        // Deduct the boost proportionally from the others
        const others = weights.filter((_, i) => i !== commanderIndex);
        const totalOtherWeight = others.reduce((sum, o) => sum + o.weight, 0);
        
        if (totalOtherWeight > 0) {
            others.forEach(o => {
                o.weight -= boost * (o.weight / totalOtherWeight);
                // Prevent negative weights
                if(o.weight < 0) o.weight = 0.1; 
            });
        }
    }
    
    // Normalize weights to sum exactly to original branch total (usually 30)
    const baseTotal = phases.reduce((sum, p) => sum + p.weight, 0);
    const newTotal = weights.reduce((sum, w) => sum + w.weight, 0);
    weights.forEach(w => {
        w.weight = (w.weight / newTotal) * baseTotal;
    });

    return {
        commander,
        phase: phaseType,
        exactDaysPassed: Number(daysPassed.toFixed(2)),
        weights
    };
}
