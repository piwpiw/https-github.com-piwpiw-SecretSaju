import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const pushMock = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/lib/integrations/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({
        data: { session: null },
        error: null,
      })),
    },
  },
}));

describe("auth callback UI", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    pushMock.mockReset();
    searchParams = new URLSearchParams();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        search: "",
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renders a clear provider-specific auth error", async () => {
    searchParams = new URLSearchParams({
      error: "oauth_callback_error",
      provider: "mcp",
      provider_error: "invalid_pkce_code_verifier",
      provider_error_description: "Invalid PKCE code_verifier",
      request_id: "req-123",
    });
    window.location.search = `?${searchParams.toString()}`;
    const { default: AuthCallback } = await import("@/app/auth/callback/page");
    render(<AuthCallback />);

    expect(await screen.findByText("로그인 실패")).toBeInTheDocument();
    expect(
      screen.getByText(
        "로그인 보안 검증에 실패했습니다. 다시 시도해 주세요. (Invalid PKCE code_verifier / Req: req-123)",
      ),
    ).toBeInTheDocument();
  });
});
