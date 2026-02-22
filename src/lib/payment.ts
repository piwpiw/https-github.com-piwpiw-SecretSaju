/**
 * 결제 훅 (Toss Payments Widget Mode 연동 준비)
 * Phase 4: 토스 페이먼츠 SDK 연동 시 이 모듈에서 위젯 호출
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

/**
 * 결제 요청 (스텁 - 실제 연동 시 Toss Widget 호출)
 */
export async function requestPayment(req: PaymentRequest): Promise<PaymentResult> {
  // TODO: @tosspayments/payment-sdk 또는 위젯 스크립트 로드 후 호출
  // 예: window.TossPayments.requestPayment('카드', { ... })
  if (typeof window === "undefined") {
    return { success: false, error: "Client only" };
  }
  return {
    success: false,
    error: "토스 페이먼츠 연동 준비 중. Phase 4에서 적용됩니다.",
  };
}

export const UNLOCK_PRICE = 300;
