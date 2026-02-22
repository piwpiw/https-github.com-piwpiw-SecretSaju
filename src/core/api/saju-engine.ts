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
import { analyzeElementBalance, type ElementAnalysisResult } from '../myeongni/elements';
export type { ElementAnalysisResult }; // Re-export for consumers
import { analyzeSinsal, type Sinsal } from '../myeongni/sinsal';
import { analyzeSipsong, type SipsongResult } from '../myeongni/sipsong';
import { determineGyeokguk, type GyeokgukInfo } from '../myeongni/gyeokguk';
import { analyzeSibiwoonseongAll, type SibiwoonseongAnalysis } from '../myeongni/sibiwoonseong';
import { calculateDaewun, getCurrentUnInfo, type DaewunInfo, type CurrentUnInfo } from '../myeongni/daewun';

export interface SajuCalculationInput {
    birthDate: Date;       // Javascript Date object
    birthTime: string;     // "HH:mm"
    gender: 'M' | 'F';
    location?: Location;   // Default: Seoul
    calendarType?: 'solar' | 'lunar'; // Default: solar
}

export interface HighPrecisionSajuResult {
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
            calendarType = 'solar'
        } = input;

        // 1. Time string parsing
        const [hours, minutes] = birthTime.split(':').map(Number);
        let birthDateTime = new Date(birthDate);
        birthDateTime.setHours(hours, minutes, 0, 0);

        // 2. Adjust for Summer Time (Historical Data)
        const { getKoreaSummerTimeOffset } = await import('../astronomy/timezone');
        const summerTimeOffset = getKoreaSummerTimeOffset(birthDateTime);
        if (summerTimeOffset > 0) {
            birthDateTime = new Date(birthDateTime.getTime() - summerTimeOffset * 60 * 1000);
        }

        // 3. Handle Lunar Date Conversion
        let adjustedDate = birthDateTime;
        if (calendarType === 'lunar') {
            const { solarToLunar, lunarToSolar } = await import('../calendar/lunar-solar');
            // Assuming the year/month/day in birthDate refers to Lunar components
            const lunarInput = {
                year: birthDate.getFullYear(),
                month: birthDate.getMonth() + 1,
                day: birthDate.getDate(),
                isLeapMonth: false // Default to non-leap unless input expanded
            };
            adjustedDate = lunarToSolar(lunarInput);
            adjustedDate.setHours(birthDateTime.getHours(), birthDateTime.getMinutes());
        }

        // 4. Adjust for True Solar Time (Astronomical Precision)
        const trueSolarTime = getTrueSolarTime(adjustedDate, location);

        // 3. Calculate Four Pillars
        const yearPillar = getYearPillar(adjustedDate);
        const monthPillar = getMonthPillar(adjustedDate, yearPillar.stemIndex);
        const dayPillar = getDayPillar(adjustedDate);
        const hourPillar = getHourPillar(trueSolarTime, dayPillar.stemIndex);

        const fourPillars: FourPillars = {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar
        };

        // 4. Myeongni Analysis
        const elements = analyzeElementBalance(fourPillars);
        const sinsal = analyzeSinsal(fourPillars);
        const sipsong = analyzeSipsong(fourPillars);
        const gyeokguk = determineGyeokguk(fourPillars);
        const sibiwoonseong = analyzeSibiwoonseongAll(fourPillars);

        // 5. Daewun/Saewun
        const daewun = calculateDaewun(birthDate, fourPillars, gender);
        const currentUn = getCurrentUnInfo(birthDate, fourPillars, gender);

        return {
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
    }
}

/**
 * Wrapper function for easy access
 */
export async function calculateHighPrecisionSaju(input: SajuCalculationInput): Promise<HighPrecisionSajuResult> {
    return await SajuEngine.calculate(input);
}
