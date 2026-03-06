'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SajuProfileRepository } from '@/lib/repositories/saju-profile.repository';
import { SajuProfileResponse, SajuProfileMapper } from '@/types/schema';
import { STORAGE_KEYS } from '@/config';
import { getUserFromCookie } from '@/lib/kakao-auth';
import { getSupabaseClient } from '@/lib/supabase';

interface ProfileContextType {
    profiles: SajuProfileResponse[];
    activeProfile: SajuProfileResponse | null;
    setActiveProfileById: (id: string) => void;
    refreshProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profiles, setProfiles] = useState<SajuProfileResponse[]>([]);
    const [activeProfile, setActiveProfile] = useState<SajuProfileResponse | null>(null);

    const resolveUserId = useCallback(async (): Promise<string> => {
        const supabase = getSupabaseClient();
        if (supabase?.auth?.getUser) {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) return data.user.id;
        }
        const cookieUser = getUserFromCookie();
        if (cookieUser?.id) return String(cookieUser.id);
        return 'local-user';
    }, []);

    const refreshProfiles = useCallback(async () => {
        const userId = await resolveUserId();
        const saved = await SajuProfileRepository.findByUserId(userId);
        const formatted = saved.map(SajuProfileMapper.toResponse);
        setProfiles(formatted);

        // Attempt to restore active profile from localStorage or default to first
        const lastActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
        if (lastActiveId) {
            const found = formatted.find(p => p.id === lastActiveId);
            if (found) {
                setActiveProfile(found);
                return;
            }
        }

        if (formatted.length > 0) {
            setActiveProfile(formatted[0]);
        } else {
            setActiveProfile(null);
        }
    }, [resolveUserId]);

    useEffect(() => {
        refreshProfiles();
    }, [refreshProfiles]);

    const setActiveProfileById = (id: string) => {
        const found = profiles.find(p => p.id === id);
        if (found) {
            setActiveProfile(found);
            localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
        }
    };

    return (
        <ProfileContext.Provider value={{ profiles, activeProfile, setActiveProfileById, refreshProfiles }}>
            {children}
        </ProfileContext.Provider>
    );
}

export const useProfiles = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfiles must be used within a ProfileProvider');
    }
    return context;
};
