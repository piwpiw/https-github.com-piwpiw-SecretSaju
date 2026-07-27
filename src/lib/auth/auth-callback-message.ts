/** 한글이 하나라도 있으면 사용자에게 보여줄 문구로 본다. */
const HANGUL = /[가-힣]/;

const AUTH_ERRORS: Record<string, string> = {
  missing_required_params: "로그인 정보가 누락되었습니다. 다시 시도해 주세요.",
  missing_oauth_artifacts: "로그인 세션이 만료되었습니다. 처음부터 다시 시도해 주세요.",
  invalid_oauth_state: "로그인 보안 검증에 실패했습니다. 다시 시도해 주세요.",
  expired_oauth_state: "로그인 요청 시간이 만료되었습니다. 다시 시도해 주세요.",
  token_exchange_failed: "로그인 토큰 발급에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  missing_provider_user_id: "계정 정보를 확인하지 못했습니다. 다시 시도해 주세요.",
  user_sync_failed: "사용자 정보를 저장하는 중 문제가 발생했습니다.",
  missing_oauth_profile: "프로필 정보를 불러오지 못했습니다.",
  oauth_callback_error: "로그인 처리 중 문제가 발생했습니다.",
  invalid_pkce_code_verifier: "로그인 보안 검증에 실패했습니다. 다시 시도해 주세요.",
  duplicate_state: "이미 처리된 로그인 요청입니다. 다시 시도해 주세요.",
  duplicate_code: "이미 처리된 로그인 요청입니다. 다시 시도해 주세요.",
  duplicate_code_verifier: "이미 처리된 로그인 요청입니다. 다시 시도해 주세요.",
  missing_code: "로그인 코드가 누락되었습니다. 다시 시도해 주세요.",
  kakao_userinfo_failed: "카카오 사용자 정보를 불러오지 못했습니다.",
  kakao_user_lookup_failed: "기존 계정 확인에 실패했습니다.",
  kakao_user_sync_failed: "카카오 계정 동기화에 실패했습니다.",
  kakao_callback_error: "카카오 로그인 처리 중 문제가 발생했습니다.",
  kakao_not_configured: "카카오 로그인은 현재 준비 중입니다. 구글 또는 이메일 로그인을 이용해 주세요.",
  provider_error: "로그인 제공자 응답에 문제가 있습니다.",
};

export function buildAuthCallbackMessage(params: {
  error: string;
  provider?: string | null;
  providerError?: string | null;
  providerErrorDescription?: string | null;
  requestId?: string | null;
}): string {
  const { error, provider, providerError, providerErrorDescription, requestId } = params;
  const key = providerError || error;

  const baseMessage =
    AUTH_ERRORS[key] ||
    AUTH_ERRORS[error] ||
    (provider === "mcp"
      ? "MCP 로그인 처리 중 문제가 발생했습니다."
      : provider === "kakao"
        ? "카카오 로그인 처리 중 문제가 발생했습니다."
        : "로그인 처리 중 문제가 발생했습니다.");

  const suffixes: string[] = [];
  // provider가 돌려주는 설명은 대개 영어 기술 문자열이다(예: "db timeout",
  // Supabase의 원시 DB 오류). 그대로 붙이면 한국어 안내 뒤에 영어가 섞여 나온다.
  // 한글이 하나라도 있으면 사람이 읽으라고 쓴 문구로 보고 노출하고, 그렇지 않으면
  // 화면에서는 감춘다. 서버 로그에는 그대로 남으므로 진단 능력은 잃지 않는다.
  if (providerErrorDescription && HANGUL.test(providerErrorDescription)) {
    suffixes.push(providerErrorDescription);
  }
  // 요청 ID는 영어가 아니라 문의 시 대조할 식별자라 항상 남긴다.
  if (requestId) suffixes.push(`요청번호 ${requestId}`);

  return suffixes.length > 0 ? `${baseMessage} (${suffixes.join(" / ")})` : baseMessage;
}
