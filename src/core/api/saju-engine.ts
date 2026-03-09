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
import {
    buildKoreaWallClockDate,
    getKoreaCivilOffsetsFromWallClock,
    koreaWallClockToUTC,
} from '../astronomy/timezone';
import { isBeforeLichun } from '../astronomy/solar-terms';
import { getYearPillar, getMonthPillar, getDayPillar, getHourPillar, FourPillars, GanJi } from '../calendar/ganji';
import { handleJasiLogic } from '../calendar/yajasi';
import { solarToLunar } from '../calendar/lunar-solar';
import { SCORING_MODEL, analyzeElements, type ElementAnalysisResult } from '../myeongni/elements';
export type { ElementAnalysisResult }; // Re-export for consumers
import { analyzeSinsal, type Sinsal } from '../myeongni/sinsal';
import { analyzeSipsong, type SipsongResult } from '../myeongni/sipsong';
import { determineGyeokguk, type GyeokgukInfo } from '../myeongni/gyeokguk';
import { analyzeSibiwoonseongAll, type SibiwoonseongAnalysis } from '../myeongni/sibiwoonseong';
import { analyzeTransitInteractions, analyzeVisibleInteractions, type InteractionEvent } from '../myeongni/interactions';
import { calculateDaewun, getCurrentUnInfo, type DaewunInfo, type CurrentUnInfo } from '../myeongni/daewun';
import { calculateGangYak, type GangYakScore } from '@/lib/saju/advancedScoring';
import { calculateYongshin, type YongshinAnalysis } from '../myeongni/yongshin';
import { evaluateGyeokgukCandidates } from '../myeongni/gyeokguk-candidates';
import { evaluateYongshinCandidates } from '../myeongni/yongshin-candidates';
import { buildCanonicalSajuFeatures, type CanonicalSajuFeatures, type EvidenceEntry } from './saju-canonical';
import { resolveLineageProfile, type LineageProfile } from './saju-lineage';

const ENGINE_VERSION = "saju-engine@1.4.0";

export interface SajuCalculationInput {
    birthDate: Date;       // Javascript Date object
    birthTime: string;     // "HH:mm"
    gender: 'M' | 'F';
    isTimeUnknown?: boolean;
    location?: Location;   // Default: Seoul
    calendarType?: 'solar' | 'lunar'; // Default: solar
    isLeapMonth?: boolean;
    lineageProfileId?: string;
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
    interactions: InteractionEvent[];
    evidence: EvidenceEntry[];
    canonicalFeatures: CanonicalSajuFeatures;

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
        lineageProfileId: string;
    };
    diagnostics: {
        warnings: string[];
        lunarConverted: boolean;
        trueSolarAdjusted: boolean;
        trueSolarOffsetMinutes: number;
        equationOfTimeMinutes: number;
        longitudeOffsetMinutes: number;
        historicalUtcOffsetMinutes: number;
        historicalDstOffsetMinutes: number;
        birthInstantUtc: string;
        officialCalendarYear: number | null;
        myeongriCalendarYear: number;
    };
    lineage: LineageProfile;
    evidence: EvidenceEntry[];
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
            isLeapMonth = false,
            lineageProfileId,
        } = input;
        const resolvedLocation = { ...location };
        const lineageProfile = resolveLineageProfile(lineageProfileId);

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

        const civilBirthWallClock = buildKoreaWallClockDate({
            year: baseDateKST.getFullYear(),
            month: baseDateKST.getMonth() + 1,
            day: baseDateKST.getDate(),
            hour: baseDateKST.getHours(),
            minute: baseDateKST.getMinutes(),
            second: baseDateKST.getSeconds(),
        });
        const civilOffsets = getKoreaCivilOffsetsFromWallClock(civilBirthWallClock);
        const birthInstantUtc = koreaWallClockToUTC(civilBirthWallClock);
        let officialCalendarYear: number | null = null;
        try {
            officialCalendarYear = solarToLunar(baseDateKST).year;
        } catch (error) {
            warnings.push('Official lunar calendar year could not be derived from the runtime Chinese calendar support.');
            qualityPenalty.push(6);
        }
        const myeongriCalendarYear = isBeforeLichun(baseDateKST)
            ? baseDateKST.getFullYear() - 1
            : baseDateKST.getFullYear();

        // 3. True Solar Time (Astronomical Precision)
        const solarDetails = calculateTrueSolarTimeWithDetails(baseDateKST, resolvedLocation);
        const trueSolarTime = solarDetails.trueSolarTime;

        const trueSolarAdjusted = Math.abs(solarDetails.totalOffset) >= 0.5;
        if (trueSolarAdjusted) {
            warnings.push(`True solar time applied (${solarDetails.totalOffset.toFixed(1)}m).`);
        }
        if (isTimeUnknown && lineageProfile.hourPillarSource === 'true-solar') {
            warnings.push('Time is unknown, so hour pillar used civil fallback instead of true solar time.');
        }

        // 4. Calculate Four Pillars
        const yearPillar = getYearPillar(baseDateKST);
        const monthPillar = getMonthPillar(baseDateKST, yearPillar.stemIndex);
        const strictYajasi = lineageProfile.yajasiPolicy === 'strict';
        const hourStemBaseTime = isTimeUnknown || lineageProfile.hourPillarSource === 'civil'
            ? baseDateKST
            : trueSolarTime;
        const hourBranchBaseTime = isTimeUnknown || lineageProfile.hourBranchPolicy === 'civil'
            ? baseDateKST
            : hourStemBaseTime;
        const dayBaseTime = isTimeUnknown || lineageProfile.dayBoundaryPolicy === 'civil'
            ? baseDateKST
            : hourStemBaseTime;
        const dayJasiResult = handleJasiLogic(dayBaseTime, strictYajasi);
        const hourJasiResult = handleJasiLogic(hourStemBaseTime, strictYajasi);
        const dayPillar = isTimeUnknown ? getDayPillar(baseDateKST) : dayJasiResult.dayPillar;
        const hourPillar = isTimeUnknown
            ? getHourPillar(baseDateKST, dayPillar.stemIndex)
            : getHourPillar(hourBranchBaseTime, hourJasiResult.hourStemStemIndexUsed);

        if (
            !isTimeUnknown
            && lineageProfile.dayBoundaryPolicy !== 'hour-source'
            && dayBaseTime.toDateString() !== hourStemBaseTime.toDateString()
        ) {
            warnings.push('Day pillar used the civil-day boundary while hour pillar used a shifted hour source.');
        }
        if (
            !isTimeUnknown
            && lineageProfile.hourBranchPolicy !== 'hour-source'
            && hourBranchBaseTime.getHours() !== hourStemBaseTime.getHours()
        ) {
            warnings.push('Hour branch used the civil-time bucket while hour stem followed a shifted hour-source policy.');
        }

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
        const interactions = analyzeVisibleInteractions(fourPillars);
        const structureCandidates = evaluateGyeokgukCandidates(fourPillars);
        const yongshinCandidates = evaluateYongshinCandidates(elements, gangyak, yongshin);

        // 6. Daewun/Saewun
        const daewun = calculateDaewun(baseDateKST, fourPillars, gender);
        const currentUn = getCurrentUnInfo(baseDateKST, fourPillars, gender);
        const transitInteractions = analyzeTransitInteractions(fourPillars, {
            daewun: currentUn.daewun?.pillar ?? null,
            saewun: currentUn.saewun?.pillar ?? null,
            wolun: currentUn.wolun?.pillar ?? null,
            ilun: currentUn.ilun?.pillar ?? null,
        });

        const qualityScore = Math.max(0, 100 - Math.min(60, qualityPenalty.reduce((a, b) => a + b, 0)));
        const canonicalFeatures = buildCanonicalSajuFeatures({
            version: ENGINE_VERSION,
            model: SCORING_MODEL,
            calendarType,
            isLeapMonth,
            fourPillars,
            civilBirthTime: baseDateKST,
            birthInstantUtc,
            trueSolarTime,
            trueSolarOffsetMinutes: solarDetails.totalOffset,
            historicalUtcOffsetMinutes: civilOffsets.standardOffsetMinutes,
            historicalDstOffsetMinutes: civilOffsets.dstOffsetMinutes,
            location: resolvedLocation,
            timeUnknownFallbackUsed: !!isTimeUnknown,
            lineageProfile,
            officialCalendarYear,
            myeongriCalendarYear,
            elements,
            sipsong,
            interactions,
            transitInteractions,
            gangyak,
            gyeokguk,
            structureCandidates,
            yongshin,
            yongshinCandidates,
            daewun,
            currentUn,
            sinsal,
            sibiwoonseong,
            warnings,
            qualityScore,
            lunarConverted,
            trueSolarAdjusted,
        });
        const evidence = canonicalFeatures.evidence;

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
            interactions,
            evidence,
            canonicalFeatures,
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
                    usedLocation: resolvedLocation,
                    lineageProfileId: lineageProfile.id,
                },
                diagnostics: {
                    warnings,
                    lunarConverted,
                    trueSolarAdjusted,
                    trueSolarOffsetMinutes: Number(solarDetails.totalOffset.toFixed(2)),
                    equationOfTimeMinutes: Number(solarDetails.eot.toFixed(2)),
                    longitudeOffsetMinutes: Number(solarDetails.longitudeOffset.toFixed(2)),
                    historicalUtcOffsetMinutes: civilOffsets.standardOffsetMinutes,
                    historicalDstOffsetMinutes: civilOffsets.dstOffsetMinutes,
                    birthInstantUtc: birthInstantUtc.toISOString(),
                    officialCalendarYear,
                    myeongriCalendarYear,
                },
                lineage: lineageProfile,
                evidence,
            },
        };

        // SHA-256 Hash of canonical stringified result
        const canonical = JSON.stringify(resultPayload);
        let integrity = `hash-${Date.now()}`;
        try {
            if (globalThis.crypto?.subtle) {
                const msgBuffer = new TextEncoder().encode(canonical);
                const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgBuffer);
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
