import { getSupabaseClient } from '@/lib/supabase';
import { SajuProfile, SajuProfileDTO, SajuProfileMapper, CreateSajuProfileRequest } from '@/types/schema';
import { readProfileStoragePayload, writeProfileStoragePayload } from '@/lib/profile-storage';

/**
 * Repository: Abstracts data access for Saju Profiles
 * Handles: localStorage fallback ??Supabase migration
 */
export class SajuProfileRepository {
    /**
     * Get all profiles for a user
     */
    static async findByUserId(userId: string): Promise<SajuProfile[]> {
        // 1. Try Supabase first
        const supabase = getSupabaseClient();

        // Check if configured (not null)
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('saju_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    return (data as unknown as SajuProfileDTO[]).map(SajuProfileMapper.toDomain);
                }
            } catch (e) {
                console.warn('Supabase fetch failed, falling back to local storage', e);
            }
        }

        // 2. Fallback to localStorage (Dual Mode)
        return this.findByUserIdLocal();
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
                        birth_time: req.birthTime ? `1970-01-01T${req.birthTime}:00` : null, // Full ISO needed for timestamptz or just Time? Schema says TIME, but DTO expects string.
                        // Note: Postgres TIME type input can be 'HH:MM:SS'. 
                        // Our DTO expects string. We need to be careful with format.
                        is_time_unknown: req.isTimeUnknown || false,
                        calendar_type: req.calendarType,
                        gender: req.gender,
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

    private static findByUserIdLocal(): SajuProfile[] {
        if (typeof window === 'undefined') return [];

        try {
            const rawParams = readProfileStoragePayload();
            // Map raw params (any) to SajuProfile domain
            return rawParams.map((p: any) => ({
                id: p.id,
                userId: 'local-user', // Storage doesn't track user ID usually
                name: p.name,
                relationship: p.relationship, // Might need normalization
                birthdate: new Date(p.birthdate),
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
        } catch {
            return [];
        }
    }

    private static createLocal(req: CreateSajuProfileRequest): SajuProfile {
        const profiles = this.findByUserIdLocal();

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
        writeProfileStoragePayload(updated);

        return newProfile;
    }

    private static deleteLocal(id: string): void {
        const profiles = this.findByUserIdLocal();
        const updated = profiles.filter(p => p.id !== id);
        writeProfileStoragePayload(updated);
    }
}

