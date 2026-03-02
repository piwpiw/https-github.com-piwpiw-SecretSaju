'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SajuProfileRepository } from '@/lib/repositories/saju-profile.repository';
import { SajuProfileResponse, SajuProfileMapper } from '@/types/schema';
import { STORAGE_KEYS } from '@/config';

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

    const refreshProfiles = async () => {
        // userId: 'local-user' for now as per repository fallback
        const saved = await SajuProfileRepository.findByUserId('local-user');
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
    };

    useEffect(() => {
        refreshProfiles();
    }, []);

    const setActiveProfileById = (id: string) => {
        const found = profiles.find(p => p.id === id);
        if (found) {
            setActiveProfile(found);
            localStorage.setItem('secret_paws_active_profile_id', id);
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
