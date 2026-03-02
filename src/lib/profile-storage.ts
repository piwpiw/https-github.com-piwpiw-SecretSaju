import { STORAGE_KEYS } from '@/config';

const LEGACY_PROFILE_STORAGE_KEYS = ['secret_paws_saju_profiles', 'secret_paws_profiles'] as const;
const PROFILE_STORAGE_KEYS = [STORAGE_KEYS.SAJU_PROFILES, ...LEGACY_PROFILE_STORAGE_KEYS] as const;

function parseArrayPayload(raw: string | null): unknown[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readProfileStoragePayload(): unknown[] {
  if (typeof window === 'undefined') return [];

  for (const key of PROFILE_STORAGE_KEYS) {
    const parsed = parseArrayPayload(localStorage.getItem(key));
    if (parsed) {
      // Canonical key is always kept warm for gradual migration.
      if (key !== STORAGE_KEYS.SAJU_PROFILES) {
        localStorage.setItem(STORAGE_KEYS.SAJU_PROFILES, JSON.stringify(parsed));
      }
      return parsed;
    }
  }

  return [];
}

export function writeProfileStoragePayload(payload: unknown[]): void {
  if (typeof window === 'undefined') return;

  const serialized = JSON.stringify(payload);
  // Write both keys for backward compatibility with legacy readers.
  localStorage.setItem(STORAGE_KEYS.SAJU_PROFILES, serialized);
  for (const key of LEGACY_PROFILE_STORAGE_KEYS) {
    localStorage.setItem(key, serialized);
  }
}

