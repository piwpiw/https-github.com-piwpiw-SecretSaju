import { describe, expect, it } from "vitest";
import { buildAuthCallbackMessage } from "@/lib/auth/auth-callback-message";

describe("buildAuthCallbackMessage", () => {
  it("prefers provider_error over generic error", () => {
    const message = buildAuthCallbackMessage({
      error: "oauth_callback_error",
      provider: "mcp",
      providerError: "invalid_pkce_code_verifier",
    });

    expect(message).toBe("로그인 보안 검증에 실패했습니다. 다시 시도해 주세요.");
  });

  it("appends detail and request id when provided", () => {
    const message = buildAuthCallbackMessage({
      error: "provider_error",
      provider: "kakao",
      providerError: "kakao_user_sync_failed",
      providerErrorDescription: "db timeout",
      requestId: "req-123",
    });

    expect(message).toBe("카카오 계정 동기화에 실패했습니다. (db timeout / Req: req-123)");
  });
});
