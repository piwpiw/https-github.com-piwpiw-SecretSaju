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

function normalizeHostToUrl(host: string): string {
    const trimmed = host.trim();
    if (!trimmed) return '';
    return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getRenderBaseUrl(): string {
    const renderHost = process.env.RENDER_EXTERNAL_HOSTNAME || process.env.RENDER_EXTERNAL_URL || process.env.RENDER_URL || '';
    return renderHost ? normalizeHostToUrl(renderHost) : '';
}

/**
 * Vercel 이 배포마다 자동 주입하는 시스템 환경변수에서 기준 도메인을 얻는다.
 *
 * VERCEL_PROJECT_PRODUCTION_URL 은 **프로젝트의 프로덕션 도메인으로 고정**이라
 * sitemap·robots 처럼 안정적인 절대 URL 이 필요한 곳에 쓸 수 있다.
 * VERCEL_URL 은 배포마다 바뀌는 일회성 주소라 의도적으로 쓰지 않는다.
 *
 * NEXT_PUBLIC_ 접두사가 없어 **서버에서만** 채워진다 — 클라이언트 번들에서는
 * 빈 문자열이 되며, 그래서 APP_CONFIG.BASE_URL 에는 넣지 않는다
 * (넣으면 서버/클라이언트 렌더 결과가 갈린다).
 */
function getVercelBaseUrl(): string {
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
    return host ? normalizeHostToUrl(host) : '';
}

export const APP_CONFIG = {
    NAME: '시크릿사주 - 보헤미안 스튜디오',
    VERSION: '1.0.0',
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || getRenderBaseUrl(),
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
} as const;

/**
 * 서버에서 **절대 URL** 이 필요할 때 쓰는 기준 도메인.
 * 우선순위: 명시 설정(NEXT_PUBLIC_BASE_URL 등) → Vercel 프로덕션 도메인 → Render.
 *
 * 어디서도 얻지 못하면 **빈 문자열**을 돌려준다. 존재하지 않는 도메인을
 * 지어내지 않는 것이 핵심이다 — 예전에는 호출부마다
 * 'https://secret-saju.vercel.app' / 'https://secretsaju.example.com' 같은
 * 실재하지 않는 값을 fallback 으로 박아 두어, 환경변수가 비면 검색엔진에
 * 엉뚱한 sitemap 을 알려주고 추천 링크가 조용히 깨진 주소로 발급됐다.
 * 판단은 호출부가 한다(생략하거나 500 을 낸다).
 */
export function resolveServerBaseUrl(): string {
    return APP_CONFIG.BASE_URL || getVercelBaseUrl();
}

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
// MCP AUTHENTICATION (OAuth 2.1 + PKCE)
// ============================================

/**
 * MCP OAuth configuration.
 * Values are intentionally kept mostly env-driven for provider swaps.
 */
export const MCP_CONFIG = {
    // Public values
    CLIENT_ID: process.env.NEXT_PUBLIC_MCP_CLIENT_ID || '',
    CLIENT_SECRET: process.env.MCP_CLIENT_SECRET || '',
    AUTH_URL: process.env.NEXT_PUBLIC_MCP_AUTH_URL || 'https://mcp.example.com/oauth/authorize',
    TOKEN_URL: process.env.NEXT_PUBLIC_MCP_TOKEN_URL || 'https://mcp.example.com/oauth/token',
    USERINFO_URL: process.env.NEXT_PUBLIC_MCP_USERINFO_URL || 'https://mcp.example.com/oauth/userinfo',
    REDIRECT_URI: process.env.NEXT_PUBLIC_MCP_REDIRECT_URI || `${APP_CONFIG.BASE_URL}/api/auth/mcp/callback`,

    SCOPE: process.env.NEXT_PUBLIC_MCP_SCOPE || 'openid profile email',

    get isConfigured(): boolean {
        return !!(this.CLIENT_ID && this.AUTH_URL && this.TOKEN_URL && this.REDIRECT_URI);
    },

    get error(): string | null {
        if (!this.CLIENT_ID) return 'NEXT_PUBLIC_MCP_CLIENT_ID is not configured';
        if (!this.AUTH_URL) return 'NEXT_PUBLIC_MCP_AUTH_URL is not configured';
        if (!this.TOKEN_URL) return 'NEXT_PUBLIC_MCP_TOKEN_URL is not configured';
        if (!this.USERINFO_URL) return 'NEXT_PUBLIC_MCP_USERINFO_URL is not configured';
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
    MCP: MCP_CONFIG.isConfigured,
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

    if (MCP_CONFIG.error) {
        warnings.push(`MCP is not fully configured. ${MCP_CONFIG.error}`);
    }

    if (!PAYMENT_CONFIG.isConfigured && ENV.IS_PROD) {
        warnings.push('Payment gateway is not configured in production');
    }

    if (PAYMENT_CONFIG.isConfigured && PAYMENT_CONFIG.isTestMode && ENV.IS_PROD) {
        errors.push('CRITICAL: Production is using Toss TEST keys. Live payments will not work.');
    }

    if (ENV.IS_PROD) {
        if (!MCP_CONFIG.USERINFO_URL) {
            warnings.push('MCP userinfo endpoint URL is missing. MCP profile sync will fail.');
        }
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
        console.log(`  ✓ MCP: ${FEATURES.MCP ? '✅' : '❌'}`);
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
export type MCPConfig = typeof MCP_CONFIG;
export type PaymentConfig = typeof PAYMENT_CONFIG;
export type DatabaseConfig = typeof DATABASE_CONFIG;
export type AnalyticsConfig = typeof ANALYTICS_CONFIG;
export type AppConfig = typeof APP_CONFIG;
