export type AnalyticsEvent =
  // Core flow
  | 'result_view'
  | 'share_click'
  | 'share_complete'
  | 'kakao_share_click'
  | 'kakao_share_complete'
  // Payments & Monetization
  | 'payment_click'
  | 'payment_init'
  | 'payment_complete'
  | 'payment_fail'
  | 'payment_verify_request'
  | 'payment_verify_complete'
  | 'payment_verify_error'
  | 'shop_open'
  | 'jelly_purchase'
  | 'unlock_content'
  // Social & Viral
  | 'gift_click'
  | 'referral_click'
  | 'referral_complete'
  | 'referral_code_copied'
  // Content
  | 'daily_fortune_view'
  | 'fortune_view'
  | 'compatibility_view'
  | 'dashboard_view'
  | 'wiki_view'
  | 'profile_add'
  // Auth
  | 'login_start'
  | 'login_complete'
  | 'logout'
  // Navigation
  | 'page_view'
  | 'start_analysis'
  | 'tarot_draw'
  | 'daily_fortune_refresh';


export type AnalyticsParams = Record<string, string | number | boolean>;

type AnalyticsDedupeState = { event: AnalyticsEvent; paramsKey: string; ts: number };
const ANALYTICS_DUPLICATE_WINDOW_MS = Number(process.env.NEXT_PUBLIC_ANALYTICS_DEDUPE_MS ?? 1000);
const ANALYTICS_DUPLICATE_WINDOW_SAFE = Number.isFinite(ANALYTICS_DUPLICATE_WINDOW_MS)
  ? ANALYTICS_DUPLICATE_WINDOW_MS
  : 1000;
const analyticsEventCache = new Map<string, AnalyticsDedupeState>();

function normalizeAnalyticsParams(params?: AnalyticsParams) {
  const normalized = params ?? {};
  const keys = Object.keys(normalized).sort();
  return keys
    .map((key) => `${key}=${String((normalized as Record<string, string | number | boolean>)[key])}`)
    .join('|');
}

function shouldDeduplicateEvent(event: AnalyticsEvent, paramsKey: string, now: number) {
  const key = `${event}:${paramsKey}`;
  const previous = analyticsEventCache.get(key);
  if (previous && now - previous.ts < ANALYTICS_DUPLICATE_WINDOW_SAFE) {
    return true;
  }
  analyticsEventCache.set(key, { event, paramsKey, ts: now });
  return false;
}

/**
 * Core: Track a custom event
 */
export function trackEvent(event: AnalyticsEvent, params?: AnalyticsParams) {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const paramsKey = normalizeAnalyticsParams(params);
  if (shouldDeduplicateEvent(event, paramsKey, now)) {
    return;
  }

  const w = window as any;

  if (w.gtag) {
    w.gtag('event', event, {
      ...params,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', event, params);
  }
}

/**
 * Track page views
 */
export function trackPageView(url: string) {
  if (typeof window === 'undefined') return;

  const w = window as any;
  if (w.gtag) {
    w.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics] PageView:', url);
  }
}

// Conversion helpers

/** 결과 페이지 조회 */
export const trackResultView = (pillarCode: string) =>
  trackEvent('result_view', { pillar_code: pillarCode });

/** 결제 클릭 */
export const trackPaymentClick = (packageType: string, amount: number) =>
  trackEvent('payment_click', { package_type: packageType, amount });

/** 결제 초기화 */
export const trackPaymentInit = (packageType: string, orderId: string, amount: number) =>
  trackEvent('payment_init', { package_type: packageType, order_id: orderId, amount });

/** 결제 확인 요청 */
export const trackPaymentVerifyRequest = (orderId: string, amount: number, stage: string) =>
  trackEvent('payment_verify_request', { order_id: orderId, amount, stage });

/** 결제 완료 */
export const trackPaymentComplete = (orderId: string, jellies: number) =>
  trackEvent('payment_complete', { order_id: orderId, jellies_credited: jellies });

/** 결제 실패 */
export const trackPaymentFail = (orderId: string | null, reason: string) =>
  trackEvent('payment_fail', { order_id: orderId ?? 'none', reason });

export const trackPaymentVerifyComplete = (orderId: string, jellies: number) =>
  trackEvent('payment_verify_complete', { order_id: orderId, jellies_credited: jellies });

export const trackPaymentVerifyError = (orderId: string | null, reason: string) =>
  trackEvent('payment_verify_error', { order_id: orderId ?? 'none', reason });

/** 결제 획득 */
export const trackJellyPurchase = (packageType: string, jellies: number, amount: number) =>
  trackEvent('jelly_purchase', { package_type: packageType, jellies, amount });

/** 콘텐츠 잠금 해제 */
export const trackUnlock = (sectionId: string, jelliesSpent: number) =>
  trackEvent('unlock_content', { section_id: sectionId, jellies_spent: jelliesSpent });

/** 로그인 완료 */
export const trackLoginComplete = () =>
  trackEvent('login_complete', { method: 'kakao' });

/** 공유 완료 */
export const trackShareComplete = (method: 'kakao' | 'link' | 'clipboard') =>
  trackEvent('share_complete', { share_method: method });

export const trackKakaoShareClick = (title: string) =>
  trackEvent('kakao_share_click', { title });

export const trackKakaoShareComplete = (method: 'kakao' | 'clipboard') =>
  trackEvent('kakao_share_complete', { method });

/** 프로필 추가 */
export const trackProfileAdd = (relationship: string) =>
  trackEvent('profile_add', { relationship });

/** 사주 분석 시작 */
export const trackStartAnalysis = (mode: 'profile' | 'manual', jellyBalance: number) =>
  trackEvent('start_analysis', { mode, jelly_balance: jellyBalance });

/** 타로 카드 드로우 */
export const trackTarotDraw = (deckSize: number) =>
  trackEvent('tarot_draw', { deck_size: deckSize });

/** 일일운세 새로고침 */
export const trackDailyFortuneRefresh = (tab: string) =>
  trackEvent('daily_fortune_refresh', { tab });
