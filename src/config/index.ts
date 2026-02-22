/**
 * ============================================
 * CONFIGURATION INDEX
 * ============================================
 * 
 * Central export point for all configuration
 */

// Environment Configuration
export {
    ENV,
    APP_CONFIG,
    KAKAO_CONFIG,
    PAYMENT_CONFIG,
    DATABASE_CONFIG,
    ANALYTICS_CONFIG,
    FEATURES,
    validateEnvironment,
    logEnvironmentStatus,
    getEnvironment,
    isBrowser,
    isServer,
} from './env';

export type {
    Environment,
    KakaoConfig,
    PaymentConfig,
    DatabaseConfig,
    AnalyticsConfig,
    AppConfig,
} from './env';

// Application Constants
export {
    BUSINESS_INFO,
    JELLY_PRICING,
    STORAGE_KEYS,
    API_ROUTES,
    EXTERNAL_URLS,
    UI_CONSTANTS,
    DATE_CONSTANTS,
    RELATIONSHIP_TYPES,
    INQUIRY_CATEGORIES,
} from './constants';

export type {
    RelationshipType,
    InquiryCategoryId,
    StorageKey,
} from './constants';
