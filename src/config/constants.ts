/**
 * ============================================
 * APPLICATION CONSTANTS
 * ============================================
 *
 * Non-sensitive configuration values that don't change
 * between environments.
 */

// ============================================
// LAUNCH FLAGS
// ============================================

/**
 * Free open-launch mode. When on, all premium / "secret" content is unlocked
 * for everyone and the jelly paywall is bypassed (no payment integration
 * required to launch). Flip to `false` here to re-enable paid unlocks once
 * the payment flow goes live.
 *
 * Deliberately a literal, not `process.env.NEXT_PUBLIC_*`: Next.js only
 * inlines public env vars that are actually defined at build time, so an
 * unset var leaves `process.env` untouched in the client bundle, where
 * `process` is undefined — the expression then evaluates falsy and silently
 * re-locks every paywall.
 */
export const FREE_LAUNCH = true;

// ============================================
// BUSINESS INFORMATION
// ============================================

export const BUSINESS_INFO = {
  NAME: 'Bohemian Studio',
  LEGAL_NAME: 'Bohemian Studio Ltd.',
  REGISTRATION_NUMBER: '123-45-67890',
  REPRESENTATIVE: 'Admin',
  ADDRESS: 'Seoul, Korea 123',
  EMAIL: 'contact@bohemianstudio.com',
  PHONE: '070-1234-5678',
} as const;

// ============================================
// JELLY ECONOMY
// ============================================

/**
 * 신규 지갑 생성 시 1회 지급되는 웰컴 보너스 젤리.
 * 잔액은 0에서 시작하고, 보너스는 명시적인 'welcome_bonus' 트랜잭션으로
 * 적립되어 히스토리에 근거가 남는다 (jelly-wallet.ts 참조).
 */
export const WELCOME_JELLY = 3;

/**
 * 판매 상품 정의의 단일 소스.
 * jelly-wallet.ts 의 `PRICING_TIERS` 는 이 배열을 re-export 한다.
 * (과거에는 영문 라벨 버전과 한글 라벨 버전이 중복 정의되어 있었다.)
 */
export interface JellyPricingTier {
  id: 'taste' | 'smart' | 'pro' | 'donation';
  jellies: number;
  bonus: number;
  price: number;
  label: string;
  badge?: string;
  popular?: boolean;
}

export const JELLY_PRICING_TIERS: readonly JellyPricingTier[] = [
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
  {
    id: 'donation',
    jellies: 50,
    bonus: 10,
    price: 49000,
    label: '개발자 후원 (VIP)',
    badge: 'Bohemian VIP',
  },
];

export const JELLY_PRICING = {
  TIERS: JELLY_PRICING_TIERS,
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
 * LocalStorage keys used throughout the app.
 * Centralized to prevent typos and conflicts.
 */
export const STORAGE_KEYS = {
  // Authentication
    KAKAO_TOKEN: 'kakao_token',
    NAVER_TOKEN: 'naver_token',
    AUTH_SESSION_TOKEN: 'secret_saju_auth_session',
    USER_DATA: 'user_data',
  MCP_TOKEN: 'mcp_access_token',
  MCP_REFRESH_TOKEN: 'mcp_refresh_token',
  MCP_STATE: 'mcp_oauth_state',
  MCP_CODE_VERIFIER: 'mcp_code_verifier',

  // User Data
  SAJU_PROFILES: 'secret_saju_profiles',

  // Wallet
  JELLY_WALLET: 'secret_saju_jelly_wallet',
  UNLOCKS: 'secret_saju_unlocks',
  CHURU_NYANG_WALLET: 'secret_saju_wallet',

  // UI State
  THEME: 'secret_saju_theme',
  ACTIVE_PROFILE_ID: 'secret_saju_active_profile_id',

  // Feature Flags
  ONBOARDING_COMPLETED: 'secret_saju_onboarding',
  FIRST_VISIT: 'secret_saju_first_visit',
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
    MCP_CALLBACK: '/api/auth/mcp/callback',
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
  ANIMATION_DURATION: 300,
  LOADING_DELAY: 500,
  ITEMS_PER_PAGE: 10,
  MAX_NAME_LENGTH: 20,
  MAX_RELATIONSHIP_LENGTH: 10,
  SUCCESS_MESSAGE_DURATION: 2000,
  ERROR_MESSAGE_DURATION: 3000,
} as const;

// ============================================
// DATE/TIME CONSTANTS
// ============================================

export const DATE_CONSTANTS = {
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  MIN_BIRTH_YEAR: 1900,
  MAX_BIRTH_YEAR: new Date().getFullYear(),
} as const;

// ============================================
// RELATIONSHIP TYPES
// ============================================

export const RELATIONSHIP_TYPES = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'friend', label: 'Friend' },
  { value: 'lover', label: 'Lover' },
  { value: 'other', label: 'Other' },
] as const;

// ============================================
// INQUIRY CATEGORIES
// ============================================

export const INQUIRY_CATEGORIES = [
  { id: 'error', label: 'Bug', description: 'Technical issue or error reporting' },
  {
    id: 'feedback',
    label: 'Feedback',
    description: 'Feature suggestions and improvement ideas',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'App experience review and rating feedback',
  },
  { id: 'refund', label: 'Refund', description: 'Refund request and billing questions' },
  { id: 'convert', label: 'Conversion', description: 'Requesting account conversion changes' },
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number]['value'];
export type InquiryCategoryId = typeof INQUIRY_CATEGORIES[number]['id'];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
