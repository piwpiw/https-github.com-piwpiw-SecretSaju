export type ErrorResponsePayload = {
    error: string;
    error_code: string;
    details?: unknown;
};

export function buildErrorResponsePayload(code: string, message: string, details?: unknown): ErrorResponsePayload {
    return details ? { error: message, error_code: code, details } : { error: message, error_code: code };
}
