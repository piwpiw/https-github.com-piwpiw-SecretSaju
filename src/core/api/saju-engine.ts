/**
 * Saju Engine API (High Precision)
 * 
 * Integrates:
 * 1. Astronomy Module (True Solar Time, Solar Terms)
 * 2. Calendar Module (60-Ganji, Lunar/Solar conversion)
 * 3. Myeongni Logic (Four Pillars determination, Sinsal, Sipsong, etc.)
 * 
 * Provides the main entry point for the enterprise-grade saju calculation.
 */

import { getTrueSolarTime, Location, KOREA_LOCATIONS } from '../astronomy/true-solar-time';
import { getYearPillar, getMonthPillar, getDayPillar, getHourPillar, FourPillars, GanJi } from '../calendar/ganji';
import { SCORING_MODEL, analyzeElements, type ElementAnalysisResult } from '../myeongni/elements';


export type { ElementAnalysisResult }; // Re-export for consumers
import { analyzeSinsal, type Sinsal } from '../myeongni/sinsal';
import { analyzeSipsong, type SipsongResult } from '../myeongni/sipsong';
import { determineGyeokguk, type GyeokgukInfo } from '../myeongni/gyeokguk';
import { analyzeSibiwoonseongAll, type SibiwoonseongAnalysis } from '../myeongni/sibiwoonseong';
import { calculateDaewun, getCurrentUnInfo, type DaewunInfo, type CurrentUnInfo } from '../myeongni/daewun';
import { calculateGangYak, type GangYakScore } from '../../lib/advancedScoring';
import { calculateYongshin, type YongshinAnalysis } from '../myeongni/yongshin';

const ENGINE_VERSION = "saju-engine@1.2.0";

export interface SajuCalculationInput {
    birthDate: Date;       // Javascript Date object
    birthTime: string;     // "HH:mm"
    gender: 'M' | 'F';
    isTimeUnknown?: boolean;
    location?: Location;   // Default: Seoul
    calendarType?: 'solar' | 'lunar'; // Default: solar
    isLeapMonth?: boolean;           // Added
}

export interface HighPrecisionSajuResult {
    version: string;
    model: string;
    integrity: string; // SHA-256 hash

    fourPillars: FourPillars;
    trueSolarTime: Date;
    gender: 'M' | 'F';

    // Myeongni Analysis
    elements: ElementAnalysisResult;
    sinsal: Sinsal[];
    sipsong: SipsongResult;
    gyeokguk: GyeokgukInfo;
    sibiwoonseong: SibiwoonseongAnalysis;
    gangyak: GangYakScore;
    yongshin: YongshinAnalysis;

    // Fortune context
    daewun: DaewunInfo;
    currentUn: CurrentUnInfo;
}

export class SajuEngine {
    /**
     * Calculates High-Precision Saju (Four Pillars)
     */
    static async calculate(input: SajuCalculationInput): Promise<HighPrecisionSajuResult> {
        const {
            birthDate,
            birthTime,
            gender,
            isTimeUnknown = false,
            location = KOREA_LOCATIONS.SEOUL,
            calendarType = 'solar',
            isLeapMonth = false
        } = input;

        // Validation: Required calculation data must be valid
        if (!birthTime || !birthTime.includes(':')) {
            throw new Error("[saju-engine] Invalid birth time provided. Logic rejected.");
        }

        const [hours, minutes] = birthTime.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            throw new Error("[saju-engine] Parse error on birth time. Calculation aborted.");
        }

        const year = birthDate.getFullYear();
        const month = birthDate.getMonth();
        const day = birthDate.getDate();

        // Build wall-clock birth time in Korea local civil time.
        // This must stay as entered to avoid hour/day drift in pillar calculations.
        const wallClockBirth = new Date(year, month, day, hours, minutes, 0, 0);

        // 1. Handle Lunar Date Conversion
        let baseDateKST = new Date(wallClockBirth);

        if (calendarType === 'lunar') {
            const { lunarToSolar } = await import('../calendar/lunar-solar');
            const lunarInput = {
                year: birthDate.getFullYear(),
                month: birthDate.getMonth() + 1,
                day: birthDate.getDate(),
                isLeapMonth: isLeapMonth || false
            };
            const solarDate = lunarToSolar(lunarInput);
            solarDate.setHours(hours, minutes, 0, 0);
            baseDateKST = solarDate;
        }

        // 3. True Solar Time (Astronomical Precision)
        const trueSolarTime = getTrueSolarTime(baseDateKST, location);

        // 4. Calculate Four Pillars
        const yearPillar = getYearPillar(baseDateKST);
        const monthPillar = getMonthPillar(baseDateKST, yearPillar.stemIndex);
        const dayPillar = getDayPillar(baseDateKST);
        // If birth time is unknown (conventionally entered as 00:00), use civil time
        // to avoid artificial day/hour drift caused by true-solar correction.
        const hourBaseTime = isTimeUnknown ? baseDateKST : trueSolarTime;
        const hourPillar = getHourPillar(hourBaseTime, dayPillar.stemIndex);

        const fourPillars: FourPillars = {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar
        };

        // 5. Myeongni Analysis (Isolated Logic Layers)
        const elements = analyzeElements(fourPillars, baseDateKST);
        const sinsal = analyzeSinsal(fourPillars);
        const sipsong = analyzeSipsong(fourPillars);
        const gyeokguk = determineGyeokguk(fourPillars);
        const sibiwoonseong = analyzeSibiwoonseongAll(fourPillars);
        const gangyak = calculateGangYak(fourPillars);
        const yongshin = calculateYongshin(elements, gangyak);

        // 6. Daewun/Saewun
        const daewun = calculateDaewun(baseDateKST, fourPillars, gender);
        const currentUn = getCurrentUnInfo(baseDateKST, fourPillars, gender);

        // 7. Result Assembly & Integrity Verification
        const resultPayload: Omit<HighPrecisionSajuResult, 'integrity'> = {
            version: ENGINE_VERSION,
            model: SCORING_MODEL,
            fourPillars,
            trueSolarTime,
            gender,
            elements,
            sinsal,
            sipsong,
            gyeokguk,
            sibiwoonseong,
            gangyak,
            yongshin,
            daewun,
            currentUn
        };

        // SHA-256 Hash of canonical stringified result
        const canonical = JSON.stringify(resultPayload);
        let integrity = `hash-${Date.now()}`;
        try {
            if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
                const msgBuffer = new TextEncoder().encode(canonical);
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                integrity = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        } catch (e) { }

        return {
            ...resultPayload,
            integrity
        };
    }
}

export async function calculateHighPrecisionSaju(input: SajuCalculationInput): Promise<HighPrecisionSajuResult> {
    return await SajuEngine.calculate(input);
}
