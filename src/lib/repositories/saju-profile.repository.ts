import { getSupabaseClient } from '@/lib/supabase';
import { SajuProfile, SajuProfileDTO, SajuProfileMapper, CreateSajuProfileRequest } from '@/types/schema';
import { readProfileStoragePayload, writeProfileStoragePayload } from '@/lib/profile-storage';
import { formatCivilDate, formatClockTime, parseCivilDate } from '@/lib/civil-date';

type LocalStoredProfile = {
    id: string;
    userId?: string;
    name: string;
    relationship: string;
    birthdate: string;
    birthTime: string | null;
    isTimeUnknown: boolean;
    calendarType: string;
    isLeapMonth?: boolean;
    gender: string;
    createdAt?: string | number;
    updatedAt?: string | number;
};

/**
 * Repository: Abstracts data access for Saju Profiles
 * Handles: localStorage fallback ??Supabase migration
 */
export class SajuProfileRepository {
    private static serializeLocalProfile(profile: SajuProfile): LocalStoredProfile {
        return {
            id: profile.id,
            userId: profile.userId,
            name: profile.name,
            relationship: profile.relationship,
            birthdate: formatCivilDate(profile.birthdate) ?? '1990-01-01',
            birthTime: formatClockTime(profile.birthTime),
            isTimeUnknown: profile.isTimeUnknown,
            calendarType: profile.calendarType,
            isLeapMonth: profile.isLeapMonth || false,
            gender: profile.gender,
            createdAt: profile.createdAt.toISOString(),
            updatedAt: profile.updatedAt.toISOString(),
        };
    }

    /**
     * Get all profiles for a user
     */
    static async findByUserId(userId: string): Promise<SajuProfile[]> {
        // 1. Try Supabase first
        const supabase = getSupabaseClient();
        const localProfiles = this.findByUserIdLocal(userId);

        // Check if configured (not null)
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('saju_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    return (data as unknown as SajuProfileDTO[]).map(SajuProfileMapper.toDomain);
                }

                // Supabase is reachable but may return empty due migration/RLS/local-only saves.
                // In that case, return local profiles to keep UX stable.
                if (!error && (!data || data.length === 0)) {
                    return localProfiles;
                }
            } catch (e) {
                console.warn('Supabase fetch failed, falling back to local storage', e);
            }
        }

        // 2. Fallback to localStorage (Dual Mode)
        return localProfiles;
    }

    /**
     * Create a new profile
     */
    static async create(req: CreateSajuProfileRequest, userId: string): Promise<SajuProfile> {
        const supabase = getSupabaseClient();

        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('saju_profiles')
                    .insert({
                        user_id: userId,
                        name: req.name,
                        relationship: req.relationship,
                        birthdate: req.birthdate, // "YYYY-MM-DD"
                        birth_time: req.birthTime ? `${req.birthTime}:00` : null, // TIME 컬럼은 HH:mm:ss 형식이 안전합니다.
                        // Note: Postgres TIME type input can be 'HH:MM:SS'. 
                        // Our DTO expects string. We need to be careful with format.
                        is_time_unknown: req.isTimeUnknown || false,
                        calendar_type: req.calendarType,
                        gender: req.gender,
                        is_leap_month: req.isLeapMonth || false,
                    })
                    .select()
                    .single();

                if (error) throw new Error(`Failed to create profile: ${error.message}`);

                return SajuProfileMapper.toDomain(data as unknown as SajuProfileDTO);
            } catch (e) {
                console.error('Supabase create failed', e);
                // If DB fails, do we fallback? 
                // For consistency, if we are in "DB Mode", we should probably error out.
                // But for MVP hybrid, we might fallback. 
                // Let's fallback for now to ensure user experience.
                return this.createLocal(req);
            }
        }

        // Fallback to localStorage
        return this.createLocal(req);
    }

    /**
     * Delete a profile
     */
    static async delete(id: string): Promise<void> {
        const supabase = getSupabaseClient();

        if (supabase) {
            const { error } = await supabase
                .from('saju_profiles')
                .delete()
                .eq('id', id);

            if (error) throw new Error(`Failed to delete profile: ${error.message}`);
            return;
        }

        this.deleteLocal(id);
    }

    // ============================================
    // LOCAL STORAGE FALLBACKS (Private)
    // ============================================

    private static findByUserIdLocal(userId: string = 'local-user'): SajuProfile[] {
        if (typeof window === 'undefined') return [];

        try {
            const rawParams = readProfileStoragePayload();
            // Map raw params (any) to SajuProfile domain
            const mapped = rawParams.map((p: any) => ({
                id: p.id,
                userId: p.userId || 'local-user', // Storage may not track user ID in legacy format
                name: p.name,
                relationship: p.relationship, // Might need normalization
                birthdate: parseCivilDate(p.birthdate) ?? new Date(1990, 0, 1, 12, 0, 0, 0),
                birthTime: p.birthTime ? (
                    typeof p.birthTime === 'string' && p.birthTime.includes(':') && !p.birthTime.includes('T')
                        ? new Date(`1970-01-01T${p.birthTime}`)
                        : new Date(p.birthTime)
                ) : null,
                isTimeUnknown: p.isTimeUnknown,
                calendarType: p.calendarType,
                isLeapMonth: p.isLeapMonth || false,
                gender: p.gender,
                createdAt: new Date(p.createdAt || Date.now()),
                updatedAt: new Date(p.createdAt || Date.now()),
            }));

            // Legacy local data may not have userId, so treat missing as local-user.
            return mapped.filter((p) => (p.userId || 'local-user') === userId);
        } catch {
            return [];
        }
    }

    private static createLocal(req: CreateSajuProfileRequest): SajuProfile {
        const profiles = this.findByUserIdLocal('local-user');

        // Create new domain object
        const newProfile: SajuProfile = {
            ...SajuProfileMapper.fromRequest(req, 'local-user'),
            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Save back to storage (adapting to storage format if needed, or simply saving domain object)
        // We will save Domain object structure now for consistency
        const updated = [...profiles, newProfile];
        writeProfileStoragePayload(updated.map((profile) => this.serializeLocalProfile(profile)));

        return newProfile;
    }

    private static deleteLocal(id: string): void {
        const profiles = this.findByUserIdLocal('local-user');
        const updated = profiles.filter(p => p.id !== id);
        writeProfileStoragePayload(updated.map((profile) => this.serializeLocalProfile(profile)));
    }
}

