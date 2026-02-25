/**
 * Analytics Module — GA4 + Vercel Analytics
 * 
 * 이벤트 트래킹 통합 모듈.
 * GA4 gtag가 로드된 경우 실제 전송, 아닌 경우 dev 콘솔 로깅.
 * 
 * @team T10 Growth
 */

export type AnalyticsEvent =
  // Core flow
  | "result_view"
  | "share_click"
  | "share_complete"
  // Payments & Monetization
  | "payment_click"
  | "payment_complete"
  | "payment_fail"
  | "shop_open"
  | "jelly_purchase"
  | "unlock_content"
  // Social & Viral
  | "gift_click"
  | "referral_click"
  | "referral_complete"
  // Content
  | "daily_fortune_view"
  | "fortune_view"
  | "compatibility_view"
  | "dashboard_view"
  | "wiki_view"
  | "profile_add"
  // Auth
  | "login_start"
  | "login_complete"
  | "logout"
  // Navigation
  | "page_view";

export type AnalyticsParams = Record<string, string | number | boolean>;

/**
 * Core: Track a custom event
 */
export function trackEvent(event: AnalyticsEvent, params?: AnalyticsParams) {
  if (typeof window === "undefined") return;

  const w = window as any;

  // GA4 gtag
  if (w.gtag) {
    w.gtag('event', event, {
      ...params,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    });
  }

  // Vercel Analytics (if loaded)
  if (w.va) {
    w.va('event', { name: event, ...params });
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[Analytics]", event, params);
  }
}

/**
 * Track page views
 */
export function trackPageView(url: string) {
  if (typeof window === "undefined") return;

  const w = window as any;
  if (w.gtag) {
    w.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[Analytics] PageView:", url);
  }
}

// ─── Conversion Funnel Helpers ─────────────────────────────────────────────

/** 사주 결과 확인 */
export const trackResultView = (pillarCode: string) =>
  trackEvent('result_view', { pillar_code: pillarCode });

/** 젤리 구매 완료 */
export const trackJellyPurchase = (packageType: string, jellies: number, amount: number) =>
  trackEvent('jelly_purchase', { package_type: packageType, jellies, amount });

/** 콘텐츠 잠금 해제 */
export const trackUnlock = (sectionId: string, jelliesSpent: number) =>
  trackEvent('unlock_content', { section_id: sectionId, jellies_spent: jelliesSpent });

/** 카카오 로그인 완료 */
export const trackLoginComplete = () =>
  trackEvent('login_complete', { method: 'kakao' });

/** 공유 완료 */
export const trackShareComplete = (method: 'kakao' | 'link' | 'clipboard') =>
  trackEvent('share_complete', { share_method: method });

/** 프로필 추가 */
export const trackProfileAdd = (relationship: string) =>
  trackEvent('profile_add', { relationship });

