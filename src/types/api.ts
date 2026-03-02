/**
 * API Type Definitions
 * Centralized type definitions for all API endpoints
 */

import type { FourPillars, GanJi } from '@/core/calendar/ganji';
import type { ElementAnalysisResult } from '@/core/myeongni/elements';
import type { Sinsal } from '@/core/myeongni/sinsal';
import type { SipsongResult } from '@/core/myeongni/sipsong';
import type { GyeokgukInfo } from '@/core/myeongni/gyeokguk';
import type { SibiwoonseongAnalysis } from '@/core/myeongni/sibiwoonseong';
import type { DaewunInfo, CurrentUnInfo } from '@/core/myeongni/daewun';

// ============================================
// Saju Calculation API
// ============================================

export interface SajuCalculateRequest {
    birthDate: string; // ISO 8601 format
    birthTime: string; // "HH:mm"
    gender: 'M' | 'F';
    isTimeUnknown?: boolean;
    calendarType?: 'solar' | 'lunar';
    location?: {
        latitude: number;
        longitude: number;
        timezone: string;
    };
}

export interface SajuCalculateResponse {
    fourPillars: FourPillars;
    trueSolarTime: string; // ISO 8601
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

// ============================================
// Profile Management API
// ============================================

export interface ProfileCreateRequest {
    name: string;
    relationship: 'self' | 'spouse' | 'child' | 'parent' | 'friend' | 'lover' | 'other';
    birthdate: string; // YYYY-MM-DD
    birthTime?: string; // HH:mm
    isTimeUnknown?: boolean;
    calendarType: 'solar' | 'lunar';
    gender: 'female' | 'male';
}

export interface ProfileResponse {
    id: string;
    userId: string;
    name: string;
    relationship: string;
    birthdate: string;
    birthTime: string | null;
    isTimeUnknown: boolean;
    calendarType: 'solar' | 'lunar';
    gender: 'female' | 'male';
    createdAt: string;
    updatedAt: string;
}

export interface ProfileListResponse {
    profiles: ProfileResponse[];
    total: number;
}

// ============================================
// Recommendations API
// ============================================

export interface FoodRecommendation {
    name: string;
    reason: string;
    emoji: string;
}

export interface ProductRecommendation {
    name: string;
    category: string;
    reason: string;
    emoji: string;
    link?: string;
}

export interface RecommendationsResponse {
    code: string;
    ageGroup: string;
    food: FoodRecommendation[];
    products: ProductRecommendation[];
}

// ============================================
// Celebrity Match API
// ============================================

export interface CelebrityMatch {
    name: string;
    code: string;
    description: string;
    matchPercentage: number;
    matchReason: string;
}

export interface CelebrityMatchResponse {
    matches: CelebrityMatch[];
}

// ============================================
// Daily Fortune API
// ============================================

export interface DailyFortuneResponse {
    fortune: string;
    date: string; // YYYY-MM-DD
}

// ============================================
// Payment API
// ============================================

export interface PaymentVerifyRequest {
    paymentKey: string;
    orderId: string;
    amount: number;
}

export interface PaymentVerifyResponse {
    success: boolean;
    jellies?: number;
    transactionId?: string;
}

export interface PaymentSuccessQuery {
    paymentKey: string;
    orderId: string;
    amount: string;
}

// ============================================
// Wallet API
// ============================================

export interface WalletBalanceResponse {
    userId: string;
    balance: number;
    totalPurchased: number;
    totalConsumed: number;
}

export interface WalletTransactionRequest {
    type: 'purchase' | 'consume' | 'gift';
    jellies: number;
    amount: number;
    purpose: string;
    metadata?: Record<string, unknown>;
}

export interface WalletTransactionResponse {
    id: string;
    userId: string;
    type: 'purchase' | 'consume' | 'gift';
    amount: number;
    jellies: number;
    purpose: string;
    createdAt: string;
    newBalance: number;
}

// ============================================
// User API
// ============================================

export interface UserProfileResponse {
    id: string;
    kakaoId: number;
    nickname: string;
    email: string | null;
    profileImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Error Responses
// ============================================

export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

// ============================================
// Type Guards
// ============================================

export function isSajuCalculateRequest(data: unknown): data is SajuCalculateRequest {
    if (typeof data !== 'object' || data === null) return false;
    const req = data as any;
    return (
        typeof req.birthDate === 'string' &&
        typeof req.birthTime === 'string' &&
        (req.gender === 'M' || req.gender === 'F') &&
        (req.isTimeUnknown === undefined || typeof req.isTimeUnknown === 'boolean')
    );
}

export function isProfileCreateRequest(data: unknown): data is ProfileCreateRequest {
    if (typeof data !== 'object' || data === null) return false;
    const req = data as any;
    const validRelationships = ['self', 'spouse', 'child', 'parent', 'friend', 'lover', 'other'];
    return (
        typeof req.name === 'string' &&
        validRelationships.includes(req.relationship) &&
        typeof req.birthdate === 'string' &&
        (req.calendarType === 'solar' || req.calendarType === 'lunar') &&
        (req.gender === 'female' || req.gender === 'male')
    );
}
