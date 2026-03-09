import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = vi.fn();
const trackPaymentFailMock = vi.fn();
const trackPaymentVerifyRequestMock = vi.fn();
const trackPaymentVerifyCompleteMock = vi.fn();

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParams,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/lib/app/analytics", () => ({
  trackPaymentFail: (...args: unknown[]) => trackPaymentFailMock(...args),
  trackPaymentVerifyRequest: (...args: unknown[]) => trackPaymentVerifyRequestMock(...args),
  trackPaymentVerifyComplete: (...args: unknown[]) => trackPaymentVerifyCompleteMock(...args),
}));

describe("payment pages UI", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    searchParams = new URLSearchParams();
    pushMock.mockReset();
    trackPaymentFailMock.mockReset();
    trackPaymentVerifyRequestMock.mockReset();
    trackPaymentVerifyCompleteMock.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("shows specific success-page error message for payment key mismatch", async () => {
    searchParams = new URLSearchParams({
      paymentKey: "client-payment-key",
      orderId: "order_user123_abcd1234",
      amount: "990",
      verifyToken: "verify-token",
      verifySignature: "verify-signature",
    });

    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error_code: "PAYMENT_TOSS_PAYMENT_KEY_MISMATCH",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    ) as typeof global.fetch;

    const { default: SuccessPage } = await import("@/app/payment/success/page");
    render(<SuccessPage />);

    expect(await screen.findByText("결제 검증 실패")).toBeInTheDocument();
    expect(screen.getByText("결제 승인 키가 일치하지 않습니다. 결제 화면에서 다시 시도해 주세요.")).toBeInTheDocument();
    expect(trackPaymentFailMock).toHaveBeenCalledWith("order_user123_abcd1234", "PAYMENT_TOSS_PAYMENT_KEY_MISMATCH");
  });

  it("routes amount-related failures back to shop from fail page", async () => {
    searchParams = new URLSearchParams({
      code: "PAYMENT_TOSS_AMOUNT_MISMATCH",
      message: "결제 금액이 다릅니다.",
    });

    const { default: FailPage } = await import("@/app/payment/fail/page");
    render(<FailPage />);

    expect(await screen.findByText("결제 실패")).toBeInTheDocument();
    fireEvent.click(screen.getByText("다시 결제 시도"));

    expect(pushMock).toHaveBeenCalledWith("/shop");
    expect(trackPaymentFailMock).toHaveBeenCalledWith(null, "PAYMENT_TOSS_AMOUNT_MISMATCH");
  });

  it("shows success state and allows direct navigation to mypage", async () => {
    searchParams = new URLSearchParams({
      paymentKey: "client-payment-key",
      orderId: "order_user123_abcd1234",
      amount: "990",
      verifyToken: "verify-token",
      verifySignature: "verify-signature",
    });

    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          jellies_credited: 5,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    ) as typeof global.fetch;
    const { default: SuccessPage } = await import("@/app/payment/success/page");
    render(<SuccessPage />);

    expect(await screen.findByText("결제 완료")).toBeInTheDocument();
    expect(screen.getByText("결제가 완료되었습니다. 5개 젤리가 충전됩니다.")).toBeInTheDocument();
    expect(trackPaymentVerifyCompleteMock).toHaveBeenCalledWith("order_user123_abcd1234", 5);
    fireEvent.click(screen.getByText("바로 이동"));
    expect(pushMock).toHaveBeenCalledWith("/mypage");
  });
});
