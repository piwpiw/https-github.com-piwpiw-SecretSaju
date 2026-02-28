/**
 * Referral System - Utility Functions
 * 친구 초대 시스템 핵심 로직
 */

/**
 * Generate unique referral code
 * Format: USER{6-digit-alphanumeric}
 */
export function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 헷갈리는 문자 제외 (I, O, 1, 0)
    let code = 'USER';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
    return /^USER[A-Z2-9]{6}$/.test(code);
}

/**
 * 보상 정책 (환경 변수로 관리 가능)
 */
export const REFERRAL_REWARDS = {
    REFERRER: Number(process.env.NEXT_PUBLIC_REFERRAL_REWARD_REFERRER) || 2, // 초대한 사람
    REFERRED: Number(process.env.NEXT_PUBLIC_REFERRAL_REWARD_REFERRED) || 1, // 초대받은 사람
} as const;

export const SIGNUP_REWARDS = {
    SIGNUP_BONUS: Number(process.env.NEXT_PUBLIC_SIGNUP_BONUS) || 1,
    FIRST_SAJU: Number(process.env.NEXT_PUBLIC_FIRST_SAJU_REWARD) || 0,
    PROFILE_SAVE: Number(process.env.NEXT_PUBLIC_PROFILE_SAVE_REWARD) || 0,
} as const;

/**
 * Share URL generator (for Kakao/SNS)
 */
export function generateInviteUrl(referralCode: string, baseUrl?: string): string {
    const domain = baseUrl || process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${domain}/invite/${referralCode}`;
}
