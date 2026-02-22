/**
 * Phase 2 예측: GA4 / Vercel Analytics 퍼널 트래킹
 * 이벤트: result_view, share_click, payment_click, payment_complete
 */

export type AnalyticsEvent =
  | "result_view"
  | "share_click"
  | "payment_click"
  | "payment_complete"
  | "gift_click"
  | "daily_fortune_view";

export function trackEvent(event: AnalyticsEvent, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  // TODO: window.gtag('event', event, params) 또는 Vercel Analytics
  if (process.env.NODE_ENV === "development") {
    console.debug("[Analytics]", event, params);
  }
}
