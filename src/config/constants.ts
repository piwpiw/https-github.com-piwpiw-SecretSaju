/**
 * ============================================
 * APPLICATION CONSTANTS
 * ============================================
 * 
 * Non-sensitive configuration values that don't change
 * between environments.
 */

// ============================================
// BUSINESS INFORMATION
// ============================================

export const BUSINESS_INFO = {
    NAME: '990 사주마미',
    LEGAL_NAME: '주식회사 시크릿포즈',
    REGISTRATION_NUMBER: '123-45-67890',
    REPRESENTATIVE: '홍길동',
    ADDRESS: '서울특별시 강남구 테헤란로 123',
    EMAIL: 'contact@secretpaws.com',
    PHONE: '02-1234-5678',
} as const;

// ============================================
// JELLY ECONOMY
// ============================================

export const JELLY_PRICING = {
    TIERS: [
        {
            id: 'taste',
            jellies: 1,
            bonus: 0,
            price: 990,
            label: '맛보기',
        },
        {
            id: 'smart',
            jellies: 3,
            bonus: 1,
            price: 2900,
            label: '똑똑이',
            badge: '25% 할인',
        },
        {
            id: 'pro',
            jellies: 10,
            bonus: 3,
            price: 9900,
            label: '프로',
            badge: '최고 가성비',
            popular: true,
        },
    ],
    COSTS: {
        UNLOCK_PROFILE: 1,
        UNLOCK_SECTION: 1,
        DAILY_FORTUNE: 1,
        PREMIUM_FORTUNE: 3,
        NEW_YEAR_FORTUNE: 5,
    },
} as const;

// ============================================
// STORAGE KEYS
// ============================================

/**
 * LocalStorage keys used throughout the app
 * Centralized to prevent typos and conflicts
 */
export const STORAGE_KEYS = {
    // Authentication
    KAKAO_TOKEN: 'kakao_token',
    USER_DATA: 'user_data',

    // User Data
    SAJU_PROFILES: 'secret_paws_saju_profiles',

    // Wallet
    JELLY_WALLET: 'secret_paws_jelly_wallet',
    UNLOCKS: 'secret_paws_unlocks',
    CHURU_NYANG_WALLET: 'secret_paws_wallet',

    // UI State
    THEME: 'secret_paws_theme',

    // Feature Flags
    ONBOARDING_COMPLETED: 'secret_paws_onboarding',
    FIRST_VISIT: 'secret_paws_first_visit',
} as const;

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Internal API routes
 */
export const API_ROUTES = {
    AUTH: {
        KAKAO_CALLBACK: '/api/auth/kakao/callback',
        LOGOUT: '/api/auth/logout',
    },
    PAYMENT: {
        INITIALIZE: '/api/payment/initialize',
        VERIFY: '/api/payment/verify',
        WEBHOOK: '/api/payment/webhook',
    },
    SAJU: {
        CALCULATE: '/api/saju/calculate',
        COMPATIBILITY: '/api/saju/compatibility',
    },
    FORTUNE: {
        DAILY: '/api/fortune/daily',
        PREMIUM: '/api/fortune/premium',
        NEW_YEAR: '/api/fortune/new-year',
    },
    INQUIRY: {
        SUBMIT: '/api/inquiry/submit',
        LIST: '/api/inquiry/list',
    },
} as const;

// ============================================
// EXTERNAL URLS
// ============================================

/**
 * External service URLs
 */
export const EXTERNAL_URLS = {
    KAKAO: {
        AUTH: 'https://kauth.kakao.com/oauth',
        API: 'https://kapi.kakao.com',
        DEVELOPERS: 'https://developers.kakao.com',
    },
    TOSS: {
        PAYMENTS: 'https://api.tosspayments.com/v1',
    },
} as const;

// ============================================
// UI CONSTANTS
// ============================================

export const UI_CONSTANTS = {
    // Animations
    ANIMATION_DURATION: 300,
    LOADING_DELAY: 500,

    // Pagination
    ITEMS_PER_PAGE: 10,

    // Validation
    MAX_NAME_LENGTH: 20,
    MAX_RELATIONSHIP_LENGTH: 10,

    // Delays
    SUCCESS_MESSAGE_DURATION: 2000,
    ERROR_MESSAGE_DURATION: 3000,
} as const;

// ============================================
// DATE/TIME CONSTANTS
// ============================================

export const DATE_CONSTANTS = {
    // Formats
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',

    // Ranges
    MIN_BIRTH_YEAR: 1900,
    MAX_BIRTH_YEAR: new Date().getFullYear(),
} as const;

// ============================================
// RELATIONSHIP TYPES
// ============================================

export const RELATIONSHIP_TYPES = [
    { value: 'self', label: '본인' },
    { value: 'spouse', label: '배우자' },
    { value: 'child', label: '자녀' },
    { value: 'parent', label: '부모' },
    { value: 'friend', label: '친구' },
    { value: 'lover', label: '연인' },
    { value: 'other', label: '기타' },
] as const;

// ============================================
// INQUIRY CATEGORIES
// ============================================

export const INQUIRY_CATEGORIES = [
    { id: 'error', label: '오류 문의', description: '해결이 너무치 않나요?' },
    { id: 'feedback', label: '피드백 보내기', description: '개선 아이디어를 알려주세요' },
    { id: 'review', label: '리뷰 남기기', description: '사용 후기를 공유해주세요' },
    { id: 'refund', label: '환불 요청', description: '환불이 필요하신가요?' },
    { id: 'convert', label: '냥을 츄르로 바꾸기', description: '포인트 전환' },
] as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type RelationshipType = typeof RELATIONSHIP_TYPES[number]['value'];
export type InquiryCategoryId = typeof INQUIRY_CATEGORIES[number]['id'];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
