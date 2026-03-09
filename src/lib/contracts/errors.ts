/**
 * Custom Error Classes for Secret Saju
 * Provides type-safe error handling across the application
 */

/**
 * Base class for all Secret Saju errors
 */
export class SecretSajuError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Saju calculation errors
 */
export class SajuCalculationError extends SecretSajuError {
  constructor(message: string, code: string = "CALCULATION_ERROR", details?: unknown) {
    super(message, code, 400, details);
  }
}

/**
 * Invalid input errors
 */
export class ValidationError extends SecretSajuError {
  constructor(message: string, code: string = "VALIDATION_ERROR", details?: unknown) {
    super(message, code, 400, details);
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends SecretSajuError {
  constructor(message: string = "로그인이 필요합니다.", code: string = "AUTH_REQUIRED") {
    super(message, code, 401);
  }
}

/**
 * Authorization errors
 */
export class AuthorizationError extends SecretSajuError {
  constructor(message: string = "권한이 없습니다.", code: string = "FORBIDDEN") {
    super(message, code, 403);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends SecretSajuError {
  constructor(resource: string = "요청한 데이터", code: string = "NOT_FOUND") {
    super(`${resource}를 찾을 수 없습니다.`, code, 404);
  }
}

/**
 * Payment errors
 */
export class PaymentError extends SecretSajuError {
  constructor(message: string, code: string = "PAYMENT_ERROR", details?: unknown) {
    super(message, code, 402, details);
  }
}

/**
 * Database errors
 */
export class DatabaseError extends SecretSajuError {
  constructor(message: string = "데이터베이스 오류가 발생했습니다.", code: string = "DB_ERROR", details?: unknown) {
    super(message, code, 500, details);
  }
}

/**
 * External service errors (Kakao, Toss, etc.)
 */
export class ExternalServiceError extends SecretSajuError {
  constructor(
    service: string,
    message: string = "외부 서비스 응답이 없습니다.",
    code: string = "EXTERNAL_SERVICE_ERROR",
    details?: unknown
  ) {
    super(`${service}: ${message}`, code, 503, details);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends SecretSajuError {
  constructor(message: string = "요청이 많습니다. 잠시 후 다시 시도해 주세요.", code: string = "RATE_LIMIT") {
    super(message, code, 429);
  }
}

/**
 * Helper function to determine if an error is a Secret Saju error
 */
export function isSecretSajuError(error: unknown): error is SecretSajuError {
  return error instanceof SecretSajuError;
}

/**
 * Helper function to convert unknown errors to SecretSajuError
 */
export function toSecretSajuError(error: unknown): SecretSajuError {
  if (isSecretSajuError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new SecretSajuError(error.message, "UNKNOWN_ERROR", 500, error);
  }

  return new SecretSajuError("알 수 없는 오류가 발생했습니다.", "UNKNOWN_ERROR", 500, error);
}

/**
 * Error response formatter for API routes
 */
export function formatErrorResponse(error: unknown) {
  const sajuError = toSecretSajuError(error);

  const errorBody: {
    message: string;
    code: string;
    details?: unknown;
  } = {
    message: sajuError.message,
    code: sajuError.code,
  };

  if (process.env.NODE_ENV === "development" && sajuError.details) {
    errorBody.details = sajuError.details;
  }

  return Response.json(
    { error: errorBody },
    { status: sajuError.statusCode }
  );
}

/**
 * Common error messages
 */
export const ErrorMessages = {
  // Validation
  INVALID_BIRTH_DATE: "입력된 생년월일이 유효하지 않습니다.",
  INVALID_BIRTH_TIME: "입력된 시간 형식이 유효하지 않습니다.",
  INVALID_GENDER: "성별 값을 올바르게 선택해 주세요.",
  FUTURE_DATE: "미래 날짜는 입력할 수 없습니다.",
  TOO_OLD_DATE: "1900년 이전 날짜는 지원하지 않습니다.",

  // Authentication
  AUTH_REQUIRED: "로그인이 필요합니다.",
  INVALID_TOKEN: "유효하지 않은 토큰입니다.",
  SESSION_EXPIRED: "세션이 만료되었습니다. 다시 로그인해 주세요.",

  // Payment
  INSUFFICIENT_JELLIES: "보유 잔액이 부족합니다.",
  PAYMENT_FAILED: "결제 처리에 실패했습니다.",
  PAYMENT_CANCELLED: "결제가 취소되었습니다.",

  // Database
  DB_CONNECTION_FAILED: "데이터베이스 연결에 실패했습니다.",
  PROFILE_NOT_FOUND: "프로필을 찾을 수 없습니다.",
  PROFILE_CREATE_FAILED: "프로필 생성에 실패했습니다.",

  // External Services
  KAKAO_LOGIN_FAILED: "Kakao 로그인 처리에 실패했습니다.",
  SUPABASE_ERROR: "Supabase 오류가 발생했습니다.",
  TOSS_PAYMENT_ERROR: "Toss 결제 오류가 발생했습니다.",

  // General
  INTERNAL_ERROR: "시스템 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.",
  MAINTENANCE: "점검 중입니다. 잠시 후 다시 시도해 주세요.",
} as const;
