export function getPaymentVerifyFailureMessage(errorCode?: string): string {
  switch (errorCode) {
    case "PAYMENT_AMOUNT_MISMATCH":
      return "결제 금액 정보가 일치하지 않습니다. 결제 시작 화면에서 다시 시도해 주세요.";
    case "PAYMENT_TOSS_AMOUNT_MISMATCH":
      return "결제 승인 금액이 주문 정보와 다릅니다. 다시 결제를 시도해 주세요.";
    case "PAYMENT_TOSS_ORDER_MISMATCH":
      return "결제 주문 정보가 일치하지 않습니다. 다시 결제를 시도해 주세요.";
    case "PAYMENT_TOSS_PAYMENT_KEY_MISMATCH":
      return "결제 승인 키가 일치하지 않습니다. 결제 화면에서 다시 시도해 주세요.";
    case "PAYMENT_TOSS_VERIFICATION_FAILED":
      return "결제 승인 확인 실패. 잠시 후 다시 시도하거나 결제 내역을 확인해 주세요.";
    case "PAYMENT_ORDER_NOT_PENDING":
      return "현재 주문 상태가 처리 대상이 아닙니다. 이미 처리되었거나 취소된 건일 수 있습니다.";
    case "PAYMENT_IDEMPOTENCY_LIMIT_EXCEEDED":
      return "요청이 지나치게 반복되었습니다. 1분 후 다시 시도해 주세요.";
    case "PAYMENT_VERIFICATION_SIGNATURE_INVALID":
      return "결제 검증 정보가 유효하지 않습니다. 결제 화면에서 다시 시도해 주세요.";
    case "PAYMENT_VALIDATION_MISSING_DATA":
      return "결제 확인 정보가 누락되었습니다. 결제 화면에서 다시 시도해 주세요.";
    default:
      return "결제 검증에 실패했습니다. 결제 페이지로 돌아가 재시도해 주세요.";
  }
}
