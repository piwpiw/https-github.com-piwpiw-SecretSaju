/**
 * Payment Types & Constants
 * 
 * 실제 결제 플로우는 JellyShopModal → /api/payment/initialize → Toss SDK 순서로 처리됩니다.
 * 이 모듈은 타입 및 상수 제공 용도로 유지됩니다.
 * 
 * @see src/components/shop/JellyShopModal.tsx (클라이언트 결제 UI)
 * @see src/app/api/payment/initialize/route.ts (서버 결제 초기화)
 * @see src/app/api/payment/verify/route.ts (서버 결제 검증)
 */

export type PaymentRequest = {
  amount: number;
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
};

export type PaymentResult = {
  success: boolean;
  paymentKey?: string;
  orderId?: string;
  amount?: number;
  error?: string;
};

/** 섹션 잠금해제 가격 (젤리 단위) */
export const UNLOCK_PRICE_JELLY = 1;

/** 프리미엄 운세 가격 (젤리 단위) */
export const PREMIUM_FORTUNE_PRICE_JELLY = 3;

