const READER_MEMBERSHIP_KEY = "secret_saju_reader_membership";
const MEMBERSHIP_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

type ReaderMembershipState = {
  active: boolean;
  startedAt?: number;
  expiresAt?: number;
  tier?: "signature";
};

function getDefaultState(): ReaderMembershipState {
  return { active: false };
}

export function getReaderMembership(): ReaderMembershipState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(READER_MEMBERSHIP_KEY);
    const parsed = raw ? JSON.parse(raw) : getDefaultState();
    if (!parsed?.active || !parsed?.expiresAt) return getDefaultState();
    if (Date.now() > parsed.expiresAt) {
      localStorage.setItem(READER_MEMBERSHIP_KEY, JSON.stringify(getDefaultState()));
      return getDefaultState();
    }
    return parsed;
  } catch {
    return getDefaultState();
  }
}

export function activateReaderMembership(): ReaderMembershipState {
  if (typeof window === "undefined") return getDefaultState();
  const startedAt = Date.now();
  const state: ReaderMembershipState = {
    active: true,
    startedAt,
    expiresAt: startedAt + MEMBERSHIP_DURATION_MS,
    tier: "signature",
  };
  localStorage.setItem(READER_MEMBERSHIP_KEY, JSON.stringify(state));
  return state;
}

export function clearReaderMembership(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(READER_MEMBERSHIP_KEY, JSON.stringify(getDefaultState()));
}
