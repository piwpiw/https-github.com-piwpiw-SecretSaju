'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SajuProfileRepository } from '@/lib/saju/repositories/saju-profile.repository';
import { SajuProfileResponse, SajuProfileMapper } from '@/types/schema';
import { STORAGE_KEYS } from '@/config';
import { getUserFromCookie } from '@/lib/auth/kakao-auth';
import { getSupabaseClient } from '@/lib/integrations/supabase';

interface ProfileContextType {
    profiles: SajuProfileResponse[];
    activeProfile: SajuProfileResponse | null;
    setActiveProfileById: (id: string) => void;
    refreshProfiles: () => Promise<void>;
    syncIssue: {
        scope: 'profile';
        code: string;
        summary: string;
        detail: string;
        severity: 'info' | 'warning' | 'error';
    } | null;
    clearSyncIssue: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profiles, setProfiles] = useState<SajuProfileResponse[]>([]);
    const [activeProfile, setActiveProfile] = useState<SajuProfileResponse | null>(null);
    const [syncIssue, setSyncIssue] = useState<ProfileContextType['syncIssue']>(null);

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
        try {
            const userId = await resolveUserId();
            const saved = await SajuProfileRepository.findByUserId(userId);
            const formatted = saved.map(SajuProfileMapper.toResponse);
            setProfiles(formatted);

            if (userId === 'local-user') {
                setSyncIssue({
                    scope: 'profile',
                    code: 'PROFILE_LOCAL_MODE',
                    summary: '게스트 모드로 프로필을 읽고 있습니다.',
                    detail: '로그인 세션이 없어 브라우저 로컬 저장소의 프로필만 표시합니다.',
                    severity: 'info',
                });
            } else {
                setSyncIssue(null);
            }

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
        } catch (error) {
            setProfiles([]);
            setActiveProfile(null);
            setSyncIssue({
                scope: 'profile',
                code: 'PROFILE_SYNC_FAILED',
                summary: '프로필 목록을 불러오지 못했습니다.',
                detail: error instanceof Error ? error.message : '알 수 없는 profile fetch 오류',
                severity: 'error',
            });
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
        <ProfileContext.Provider
            value={{
                profiles,
                activeProfile,
                setActiveProfileById,
                refreshProfiles,
                syncIssue,
                clearSyncIssue: () => setSyncIssue(null),
            }}
        >
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
