'use client';

export interface SajuProfile {
    id: string;
    name: string;
    relationship: string;
    birthdate: string; // YYYY-MM-DD
    birthTime: string; // HH:mm
    isTimeUnknown: boolean;
    calendarType: 'solar' | 'lunar';
    gender: 'female' | 'male';
    createdAt: number;
}

const STORAGE_KEY = 'secret_paws_profiles';

export const getProfiles = (): SajuProfile[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveProfile = (profile: Omit<SajuProfile, 'id' | 'createdAt'>) => {
    const profiles = getProfiles();
    const newProfile: SajuProfile = {
        ...profile,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
    };
    const updated = [...profiles, newProfile];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newProfile;
};

export const deleteProfile = (id: string) => {
    const profiles = getProfiles();
    const updated = profiles.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const updateProfile = (id: string, updates: Partial<SajuProfile>) => {
    const profiles = getProfiles();
    const updated = profiles.map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
