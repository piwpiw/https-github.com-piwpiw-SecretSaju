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

import {
    calculateTrueSolarTimeWithDetails,
    Location,
    KOREA_LOCATIONS,
} from '../astronomy/true-solar-time';
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
    meta?: SajuEngineMeta;
}

export interface SajuEngineMeta {
    qualityScore: number;
    inputs: {
        birthDateValid: boolean;
        birthTimeValid: boolean;
        timeUnknownFallbackUsed: boolean;
        calendarType: 'solar' | 'lunar';
        isLeapMonth: boolean;
        usedLocation: Location;
    };
    diagnostics: {
        warnings: string[];
        lunarConverted: boolean;
        trueSolarAdjusted: boolean;
        trueSolarOffsetMinutes: number;
        equationOfTimeMinutes: number;
        longitudeOffsetMinutes: number;
    };
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
        const resolvedLocation = { ...location };

        if (!(birthDate instanceof Date) || Number.isNaN(birthDate.getTime())) {
            throw new Error('[saju-engine] Invalid birthDate');
        }

        if (gender !== 'M' && gender !== 'F') {
            throw new Error('[saju-engine] Invalid gender');
        }

        const warnings: string[] = [];
        const qualityPenalty: number[] = [];

        const normalizeTime = (value: string): { hours: number; minutes: number; valid: boolean; source: 'strict' | 'fallback' } => {
            if (typeof value !== 'string') {
                warnings.push('birthTime is not provided in string format.');
                qualityPenalty.push(15);
                return { hours: 0, minutes: 0, valid: false, source: 'fallback' };
            }

            const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
            if (!match) {
                warnings.push('birthTime has invalid format. HH:mm format required. 00:00 used as fallback.');
                qualityPenalty.push(20);
                return { hours: 0, minutes: 0, valid: false, source: 'fallback' };
            }

            const [h, m] = value.split(':').map(Number);
            return { hours: h, minutes: m, valid: true, source: 'strict' };
        };

        const timeInfo = normalizeTime(birthTime ?? '');
        const { hours, minutes } = timeInfo;

        if (!timeInfo.valid) {
            qualityPenalty.push(15);
        }
        if (isTimeUnknown) {
            warnings.push('Time is marked unknown, using civil time only for hour pillar anchor.');
            qualityPenalty.push(8);
        }

        if (resolvedLocation.latitude < -90 || resolvedLocation.latitude > 90) {
            warnings.push('Location latitude is out of valid range. fallback to Seoul.');
            qualityPenalty.push(25);
            resolvedLocation.latitude = KOREA_LOCATIONS.SEOUL.latitude;
            resolvedLocation.longitude = KOREA_LOCATIONS.SEOUL.longitude;
        }
        if (resolvedLocation.longitude < -180 || resolvedLocation.longitude > 180) {
            warnings.push('Location longitude is out of valid range. fallback to Seoul.');
            qualityPenalty.push(25);
            resolvedLocation.latitude = KOREA_LOCATIONS.SEOUL.latitude;
            resolvedLocation.longitude = KOREA_LOCATIONS.SEOUL.longitude;
        }

        const year = birthDate.getFullYear();
        const month = birthDate.getMonth();
        const day = birthDate.getDate();

        // Build wall-clock birth time in Korea local civil time.
        // This must stay as entered to avoid hour/day drift in pillar calculations.
        const wallClockBirth = new Date(year, month, day, hours, minutes, 0, 0);

        // 1. Handle Lunar Date Conversion
        let baseDateKST = new Date(wallClockBirth);
        let lunarConverted = false;

        if (calendarType === 'lunar') {
            lunarConverted = true;
            const { lunarToSolar } = await import('../calendar/lunar-solar');
            const lunarInput = {
                year: birthDate.getFullYear(),
                month: birthDate.getMonth() + 1,
                day: birthDate.getDate(),
                isLeapMonth: isLeapMonth || false
            };
            const before = new Date(baseDateKST.getTime());
            const solarDate = lunarToSolar(lunarInput);
            if (Number.isNaN(solarDate.getTime())) {
                warnings.push('Lunar conversion returned invalid date. Using civil date for fallback.');
                qualityPenalty.push(30);
                solarDate.setHours(hours, minutes, 0, 0);
                baseDateKST = new Date(wallClockBirth);
            } else {
                solarDate.setHours(hours, minutes, 0, 0);
                baseDateKST = solarDate;
            }
            if (before.getTime() !== baseDateKST.getTime()) {
                warnings.push('Lunar date converted to solar date.');
            }
        }

        // 3. True Solar Time (Astronomical Precision)
        const solarDetails = calculateTrueSolarTimeWithDetails(baseDateKST, resolvedLocation);
        const trueSolarTime = solarDetails.trueSolarTime;

        const trueSolarAdjusted = Math.abs(solarDetails.totalOffset) >= 0.5;
        if (trueSolarAdjusted) {
            warnings.push(`True solar time applied (${solarDetails.totalOffset.toFixed(1)}m).`);
        }

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

        const qualityScore = Math.max(0, 100 - Math.min(60, qualityPenalty.reduce((a, b) => a + b, 0)));

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
            currentUn,
            meta: {
                qualityScore,
                inputs: {
                    birthDateValid: !(Number.isNaN(birthDate.getTime())),
                    birthTimeValid: timeInfo.valid,
                    timeUnknownFallbackUsed: !!isTimeUnknown,
                    calendarType,
                    isLeapMonth,
                    usedLocation: resolvedLocation
                },
                diagnostics: {
                    warnings,
                    lunarConverted,
                    trueSolarAdjusted,
                    trueSolarOffsetMinutes: Number(solarDetails.totalOffset.toFixed(2)),
                    equationOfTimeMinutes: Number(solarDetails.eot.toFixed(2)),
                    longitudeOffsetMinutes: Number(solarDetails.longitudeOffset.toFixed(2)),
                }
            },
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
