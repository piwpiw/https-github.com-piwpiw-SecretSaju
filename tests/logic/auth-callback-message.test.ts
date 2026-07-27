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

  // provider가 주는 설명은 대개 영어 기술 문자열(예: "db timeout", Supabase 원시 DB
  // 오류)이라 그대로 붙이면 한국어 안내 뒤에 영어가 섞여 나온다. 화면에서는 감추고
  // 서버 로그에만 남긴다. 요청번호는 문의 대조용이라 항상 노출한다.
  it("영어 기술 설명은 감추고 요청번호만 남긴다", () => {
    const message = buildAuthCallbackMessage({
      error: "provider_error",
      provider: "kakao",
      providerError: "kakao_user_sync_failed",
      providerErrorDescription: "db timeout",
      requestId: "req-123",
    });

    expect(message).toBe("카카오 계정 동기화에 실패했습니다. (요청번호 req-123)");
  });

  it("한국어 설명은 그대로 노출한다", () => {
    const message = buildAuthCallbackMessage({
      error: "provider_error",
      provider: "kakao",
      providerError: "kakao_user_sync_failed",
      providerErrorDescription: "잠시 후 다시 시도해 주세요.",
      requestId: "req-456",
    });

    expect(message).toBe(
      "카카오 계정 동기화에 실패했습니다. (잠시 후 다시 시도해 주세요. / 요청번호 req-456)",
    );
  });
});
