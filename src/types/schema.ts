/**
 * SINGLE SOURCE OF TRUTH (SSOT)
 * ==============================================================================
 * All data types originate here.
 * Database, API, and frontend all derive from this schema.
 * 
 * VERSION: 1.0.0
 * CREATED: 2026-01-31
 * ==============================================================================
 */

// ============================================
// ENUMS & CONSTANTS
// ============================================

export const RelationshipType = {
    SELF: 'self',
    SPOUSE: 'spouse',
    CHILD: 'child',
    PARENT: 'parent',
    FRIEND: 'friend',
    LOVER: 'lover',
    OTHER: 'other',
} as const;

export type RelationshipType = typeof RelationshipType[keyof typeof RelationshipType];

export const CalendarType = {
    SOLAR: 'solar',
    LUNAR: 'lunar',
} as const;

export type CalendarType = typeof CalendarType[keyof typeof CalendarType];

export const Gender = {
    FEMALE: 'female',
    MALE: 'male',
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export const TransactionType = {
    PURCHASE: 'purchase',
    CONSUME: 'consume',
    GIFT: 'gift',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

// ============================================
// CORE ENTITIES (Domain Models)
// ============================================

/**
 * Base User entity
 */
export interface User {
    id: string;
    kakaoId: number;
    nickname: string;
    email: string | null;
    profileImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Saju Profile entity
 */
export interface SajuProfile {
    id: string;
    userId: string;
    name: string;
    relationship: RelationshipType;
    birthdate: Date;
    birthTime: Date | null;
    isTimeUnknown: boolean;
    calendarType: CalendarType;
    isLeapMonth: boolean; // Added
    gender: Gender;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Jelly Wallet entity
 */
export interface JellyWallet {
    id: string;
    userId: string;
    balance: number;
    totalPurchased: number;
    totalConsumed: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Jelly Transaction entity
 */
export interface JellyTransaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    jellies: number;
    purpose: string;
    metadata: Record<string, any>;
    paymentId: string | null;
    createdAt: Date;
}

// ============================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================

/**
 * DATABASE DTOs (Snake Case)
 * Matches Supabase table structure
 */
export interface SajuProfileDTO {
    id: string;
    user_id: string;
    name: string;
    relationship: string;
    birthdate: string;  // ISO date string
    birth_time: string | null;
    is_time_unknown: boolean;
    calendar_type: string;
    is_leap_month: boolean; // Added
    gender: string;
    created_at: string; // ISO datetime string
    updated_at: string;
}

/**
 * API RESPONSE DTOs (Camel Case)
 * What the API returns to the frontend
 */
export interface SajuProfileResponse {
    id: string;
    userId: string;
    name: string;
    relationship: RelationshipType;
    birthdate: string;  // YYYY-MM-DD
    birthTime: string | null;  // HH:mm
    isTimeUnknown: boolean;
    calendarType: CalendarType;
    gender: Gender;
    createdAt: string;  // ISO
    updatedAt: string;  // ISO
}

/**
 * REQUEST DTOs
 * What the client sends to the API
 */
export interface CreateSajuProfileRequest {
    name: string;
    relationship: RelationshipType;
    birthdate: string;  // YYYY-MM-DD
    birthTime?: string;  // HH:mm
    isTimeUnknown?: boolean;
    calendarType: CalendarType;
    isLeapMonth?: boolean; // Added
    gender: Gender;
}

export interface UpdateSajuProfileRequest extends Partial<CreateSajuProfileRequest> {
    id: string;
}

// ============================================
// MAPPERS (Transform functions)
// ============================================

export class SajuProfileMapper {
    /**
     * Database DTO → Domain Entity
     */
    static toDomain(dto: SajuProfileDTO): SajuProfile {
        return {
            id: dto.id,
            userId: dto.user_id,
            name: dto.name,
            relationship: dto.relationship as RelationshipType,
            birthdate: new Date(dto.birthdate),
            birthTime: dto.birth_time ? new Date(`1970-01-01T${dto.birth_time}`) : null,
            isTimeUnknown: dto.is_time_unknown,
            calendarType: dto.calendar_type as CalendarType,
            isLeapMonth: dto.is_leap_month || false,
            gender: dto.gender as Gender,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
        };
    }

    /**
     * Domain Entity → API Response
     */
    static toResponse(profile: SajuProfile): SajuProfileResponse {
        // Format birthTime to HH:mm if exists
        let birthTimeStr: string | null = null;
        if (profile.birthTime) {
            const hours = profile.birthTime.getHours().toString().padStart(2, '0');
            const minutes = profile.birthTime.getMinutes().toString().padStart(2, '0');
            birthTimeStr = `${hours}:${minutes}`;
        }

        return {
            id: profile.id,
            userId: profile.userId,
            name: profile.name,
            relationship: profile.relationship,
            birthdate: profile.birthdate.toISOString().split('T')[0],
            birthTime: birthTimeStr,
            isTimeUnknown: profile.isTimeUnknown,
            calendarType: profile.calendarType,
            gender: profile.gender,
            createdAt: profile.createdAt.toISOString(),
            updatedAt: profile.updatedAt.toISOString(),
        };
    }

    /**
     * Request → Domain (Partial for creation)
     */
    static fromRequest(req: CreateSajuProfileRequest, userId: string): Omit<SajuProfile, 'id' | 'createdAt' | 'updatedAt'> {
        // Parse time string "HH:mm" to Date object
        let birthTimeDate: Date | null = null;
        if (req.birthTime) {
            const [hours, minutes] = req.birthTime.split(':').map(Number);
            const now = new Date();
            now.setHours(hours, minutes, 0, 0);
            birthTimeDate = now;
        }

        return {
            userId,
            name: req.name,
            relationship: req.relationship,
            birthdate: new Date(req.birthdate),
            birthTime: birthTimeDate,
            isTimeUnknown: req.isTimeUnknown || false,
            calendarType: req.calendarType,
            isLeapMonth: req.isLeapMonth || false,
            gender: req.gender,
        };
    }
}
