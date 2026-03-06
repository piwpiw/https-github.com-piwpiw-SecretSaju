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

export const JELLY_PRICING = {
  TIERS: [
    {
      id: 'taste',
      jellies: 1,
      bonus: 0,
      price: 990,
      label: 'Starter',
    },
    {
      id: 'smart',
      jellies: 3,
      bonus: 1,
      price: 2900,
      label: 'Starter Plus',
      badge: 'Best Value',
    },
    {
      id: 'pro',
      jellies: 10,
      bonus: 3,
      price: 9900,
      label: 'Pro',
      badge: 'Most Popular',
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
 * LocalStorage keys used throughout the app.
 * Centralized to prevent typos and conflicts.
 */
export const STORAGE_KEYS = {
  // Authentication
    KAKAO_TOKEN: 'kakao_token',
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
