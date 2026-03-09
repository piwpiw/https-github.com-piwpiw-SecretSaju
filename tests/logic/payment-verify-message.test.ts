import { describe, expect, it } from "vitest";
import { getPaymentVerifyFailureMessage } from "@/lib/payment/payment-verify-message";

describe("getPaymentVerifyFailureMessage", () => {
  it("returns a specific message for payment key mismatch", () => {
    expect(getPaymentVerifyFailureMessage("PAYMENT_TOSS_PAYMENT_KEY_MISMATCH")).toBe(
      "결제 승인 키가 일치하지 않습니다. 결제 화면에서 다시 시도해 주세요.",
    );
  });

  it("falls back to the generic message for unknown codes", () => {
    expect(getPaymentVerifyFailureMessage("UNKNOWN_CODE")).toBe(
      "결제 검증에 실패했습니다. 결제 페이지로 돌아가 재시도해 주세요.",
    );
  });
});
