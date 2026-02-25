/**
 * Analytics Module — GA4 + Vercel Analytics
 * 
 * 이벤트 트래킹 통합 모듈.
 * GA4 gtag가 로드된 경우 실제 전송, 아닌 경우 dev 콘솔 로깅.
 */

export type AnalyticsEvent =
  | "result_view"
  | "share_click"
  | "payment_click"
  | "payment_complete"
  | "gift_click"
  | "daily_fortune_view"
  | "page_view"
  | "shop_open"
  | "unlock_content";

/**
 * Track a custom event
 */
export function trackEvent(event: AnalyticsEvent, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  // GA4 gtag
  const w = window as any;
  if (w.gtag) {
    w.gtag('event', event, params);
  }

  // Dev logging
  if (process.env.NODE_ENV === "development") {
    console.debug("[Analytics]", event, params);
  }
}

/**
 * Track page views (called from layout or route changes)
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
