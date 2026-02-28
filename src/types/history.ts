export type AnalysisType = 'SAJU' | 'DREAM' | 'PALMISTRY' | 'NAMING' | 'ASTROLOGY' | 'TAROT';

export interface AnalysisHistoryLog {
    id: string;
    type: AnalysisType;
    title: string;
    subtitle: string;
    profileId?: string;
    profileName?: string;
    resultUrl?: string;
    resultPreview?: string;
    result: any; // The full result object
    timestamp: number;
}
