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
import * as crypto from 'crypto';

export type { ElementAnalysisResult }; // Re-export for consumers
import { analyzeSinsal, type Sinsal } from '../myeongni/sinsal';
import { analyzeSipsong, type SipsongResult } from '../myeongni/sipsong';
import { determineGyeokguk, type GyeokgukInfo } from '../myeongni/gyeokguk';
import { analyzeSibiwoonseongAll, type SibiwoonseongAnalysis } from '../myeongni/sibiwoonseong';
import { calculateDaewun, getCurrentUnInfo, type DaewunInfo, type CurrentUnInfo } from '../myeongni/daewun';

const ENGINE_VERSION = "saju-engine@1.2.0";

export interface SajuCalculationInput {
    birthDate: Date;       // Javascript Date object
    birthTime: string;     // "HH:mm"
    gender: 'M' | 'F';
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

        // 1. Adjust for Historical Timezone Offset & Summer Time
        const { getKoreaSummerTimeOffset, getKoreaStandardOffsetMinutes } = await import('../astronomy/timezone');

        // Proxy date to check historical offsets (Locale Agnostic)
        const proxyDate = new Date(Date.UTC(year, month, day, hours, minutes));
        const standardOffset = getKoreaStandardOffsetMinutes(proxyDate);
        const summerTimeOffset = getKoreaSummerTimeOffset(proxyDate);

        // Total offset relative to UTC (minutes)
        const totalOffset = standardOffset + summerTimeOffset;

        // Convert Wall Clock Time to UTC
        const utcTimestamp = proxyDate.getTime() - (totalOffset * 60 * 1000);
        const birthUTC = new Date(utcTimestamp);

        // 2. Handle Lunar Date Conversion
        let baseDateKST = new Date(birthUTC.getTime() + (9 * 60 * 60 * 1000)); // Standard KST (UTC+9) for display & basic logic

        if (calendarType === 'lunar') {
            const { lunarToSolar } = await import('../calendar/lunar-solar');
            const lunarInput = {
                year: birthDate.getFullYear(),
                month: birthDate.getMonth() + 1,
                day: birthDate.getDate(),
                isLeapMonth: isLeapMonth || false
            };
            const solarDate = lunarToSolar(lunarInput);
            solarDate.setUTCHours(birthUTC.getUTCHours(), birthUTC.getUTCMinutes());
            baseDateKST = new Date(solarDate.getTime() + (9 * 60 * 60 * 1000));
        }

        // 3. True Solar Time (Astronomical Precision)
        const trueSolarTime = getTrueSolarTime(baseDateKST, location);

        // 4. Calculate Four Pillars
        const yearPillar = getYearPillar(baseDateKST);
        const monthPillar = getMonthPillar(baseDateKST, yearPillar.stemIndex);
        const dayPillar = getDayPillar(baseDateKST);
        const hourPillar = getHourPillar(trueSolarTime, dayPillar.stemIndex);

        const fourPillars: FourPillars = {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar
        };

        // 5. Myeongni Analysis (Isolated Logic Layers)
        const elements = analyzeElements(fourPillars);
        const sinsal = analyzeSinsal(fourPillars);
        const sipsong = analyzeSipsong(fourPillars);
        const gyeokguk = determineGyeokguk(fourPillars);
        const sibiwoonseong = analyzeSibiwoonseongAll(fourPillars);

        // 6. Daewun/Saewun
        const daewun = calculateDaewun(birthDate, fourPillars, gender);
        const currentUn = getCurrentUnInfo(birthDate, fourPillars, gender);

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
            daewun,
            currentUn
        };

        // SHA-256 Hash of canonical stringified result
        const canonical = JSON.stringify(resultPayload);
        const integrity = crypto.createHash('sha256').update(canonical).digest('hex');

        return {
            ...resultPayload,
            integrity
        };
    }
}

export async function calculateHighPrecisionSaju(input: SajuCalculationInput): Promise<HighPrecisionSajuResult> {
    return await SajuEngine.calculate(input);
}
