/**
 * ============================================
 * CENTRALIZED ENVIRONMENT CONFIGURATION
 * ============================================
 * 
 * All environment variables are managed here.
 * Type-safe with validation and fallbacks.
 * 
 * USAGE:
 * import { ENV, KAKAO_CONFIG, PAYMENT_CONFIG } from '@/config/env';
 */

// Environment type
export type Environment = 'development' | 'production' | 'test';

/**
 * Get current environment
 */
export const getEnvironment = (): Environment => {
    const env = process.env.NODE_ENV as Environment;
    return env || 'development';
};

/**
 * Check if running in browser
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if running in server
 */
export const isServer = !isBrowser;

// ============================================
// BASE CONFIGURATION
// ============================================

export const ENV = {
    NODE_ENV: getEnvironment(),
    IS_DEV: getEnvironment() === 'development',
    IS_PROD: getEnvironment() === 'production',
    IS_TEST: getEnvironment() === 'test',
} as const;

// ============================================
// APPLICATION CONFIGURATION
// ============================================

export const APP_CONFIG = {
    NAME: 'Secret Paws - 990 사주마미',
    VERSION: '1.0.0',
    // Fallback order: Explicit ENV -> Vercel PR URL -> Vercel Production URL -> localhost
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'),
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
} as const;

// ============================================
// KAKAO AUTHENTICATION
// ============================================

/**
 * Kakao OAuth Configuration
 * REQUIRED: Must be set in .env.local
 */
export const KAKAO_CONFIG = {
    // Public (Client-side accessible)
    JS_KEY: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '',

    // Private (Server-side only)
    REST_API_KEY: process.env.KAKAO_REST_API_KEY || '',
    CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET || '',

    // OAuth URLs
    REDIRECT_URI: `${APP_CONFIG.BASE_URL}/api/auth/kakao/callback`,

    // Validation
    get isConfigured(): boolean {
        return !!(this.JS_KEY && this.REST_API_KEY);
    },

    get error(): string | null {
        if (!this.JS_KEY) return 'NEXT_PUBLIC_KAKAO_JS_KEY is not configured';
        if (!this.REST_API_KEY) return 'KAKAO_REST_API_KEY is not configured';
        return null;
    },
} as const;

// ============================================
// PAYMENT GATEWAY (Toss Payments)
// ============================================

/**
 * Toss Payments Configuration
 * OPTIONAL: Only required when payment feature is enabled
 */
export const PAYMENT_CONFIG = {
    // Public
    CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '',

    // Private
    SECRET_KEY: process.env.TOSS_SECRET_KEY || '',

    // URLs
    SUCCESS_URL: process.env.NEXT_PUBLIC_TOSS_SUCCESS_URL || `${APP_CONFIG.BASE_URL}/payment/success`,
    FAIL_URL: process.env.NEXT_PUBLIC_TOSS_FAIL_URL || `${APP_CONFIG.BASE_URL}/payment/fail`,

    // Validation
    get isConfigured(): boolean {
        return !!(this.CLIENT_KEY && this.SECRET_KEY);
    },

    get isTestMode(): boolean {
        return this.CLIENT_KEY.startsWith('test_');
    },
} as const;

// ============================================
// DATABASE (Supabase)
// ============================================

/**
 * Supabase Configuration
 * OPTIONAL: Only required when backend integration is enabled
 */
export const DATABASE_CONFIG = {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    get isConfigured(): boolean {
        return !!(this.URL && this.ANON_KEY);
    },
} as const;

// ============================================
// ANALYTICS
// ============================================

/**
 * Analytics Configuration
 * OPTIONAL: For tracking and analytics
 */
export const ANALYTICS_CONFIG = {
    // Google Analytics
    GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',

    // Kakao Pixel
    KAKAO_PIXEL_ID: process.env.NEXT_PUBLIC_KAKAO_PIXEL_ID || '',

    get isGAEnabled(): boolean {
        return !!this.GA_ID && ENV.IS_PROD;
    },

    get isKakaoPixelEnabled(): boolean {
        return !!this.KAKAO_PIXEL_ID && ENV.IS_PROD;
    },
} as const;

// ============================================
// FEATURE FLAGS
// ============================================

/**
 * Feature Flags
 * Control feature availability per environment
 */
export const FEATURES = {
    KAKAO_LOGIN: KAKAO_CONFIG.isConfigured,
    PAYMENT: PAYMENT_CONFIG.isConfigured,
    DATABASE: DATABASE_CONFIG.isConfigured,
    ANALYTICS: ENV.IS_PROD,
    DEBUG_MODE: ENV.IS_DEV,
} as const;

// ============================================
// VALIDATION
// ============================================

/**
 * Validate critical environment variables
 * Call this at app startup
 */
export function validateEnvironment(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Critical checks (will prevent app from running)
    if (!APP_CONFIG.BASE_URL) {
        errors.push('NEXT_PUBLIC_BASE_URL is not set');
    }

    // Feature-specific checks
    if (!KAKAO_CONFIG.isConfigured) {
        warnings.push('Kakao login is not configured. Users cannot log in.');
        if (KAKAO_CONFIG.error) {
            warnings.push(`Kakao Error: ${KAKAO_CONFIG.error}`);
        }
    }

    if (!PAYMENT_CONFIG.isConfigured && ENV.IS_PROD) {
        warnings.push('Payment gateway is not configured in production');
    }

    if (PAYMENT_CONFIG.isConfigured && PAYMENT_CONFIG.isTestMode && ENV.IS_PROD) {
        errors.push('CRITICAL: Production is using Toss TEST keys. Live payments will not work.');
    }

    if (ENV.IS_PROD) {
        if (!DATABASE_CONFIG.SERVICE_ROLE_KEY) {
            errors.push('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in production. Server operations will fail.');
        }
        if (!KAKAO_CONFIG.CLIENT_SECRET) {
            errors.push('CRITICAL: KAKAO_CLIENT_SECRET is missing in production.');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Log environment configuration status
 * Safe for production (doesn't expose secrets)
 */
export function logEnvironmentStatus(): void {
    if (isServer) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔧 ENVIRONMENT CONFIGURATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Environment: ${ENV.NODE_ENV}`);
        console.log(`Base URL: ${APP_CONFIG.BASE_URL}`);
        console.log('');
        console.log('Features:');
        console.log(`  ✓ Kakao Login: ${FEATURES.KAKAO_LOGIN ? '✅' : '❌'}`);
        console.log(`  ✓ Payment: ${FEATURES.PAYMENT ? '✅' : '❌'}`);
        console.log(`  ✓ Database: ${FEATURES.DATABASE ? '✅' : '❌'}`);
        console.log(`  ✓ Analytics: ${FEATURES.ANALYTICS ? '✅' : '❌'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const validation = validateEnvironment();

        if (validation.errors.length > 0) {
            console.error('❌ CRITICAL ERRORS:');
            validation.errors.forEach(err => console.error(`  - ${err}`));
        }

        if (validation.warnings.length > 0) {
            console.warn('⚠️  WARNINGS:');
            validation.warnings.forEach(warn => console.warn(`  - ${warn}`));
        }

        if (validation.isValid && validation.warnings.length === 0) {
            console.log('✅ All environment variables are properly configured');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}

// ============================================
// TYPE EXPORTS
// ============================================

export type KakaoConfig = typeof KAKAO_CONFIG;
export type PaymentConfig = typeof PAYMENT_CONFIG;
export type DatabaseConfig = typeof DATABASE_CONFIG;
export type AnalyticsConfig = typeof ANALYTICS_CONFIG;
export type AppConfig = typeof APP_CONFIG;
