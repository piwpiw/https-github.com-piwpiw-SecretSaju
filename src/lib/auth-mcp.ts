import { isMockMode } from '@/lib/use-mock';
﻿import { MCP_CONFIG, STORAGE_KEYS, ENV } from '@/config';
export { STORAGE_KEYS };

export interface McpTokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in?: number;
    id_token?: string;
    scope?: string;
}

export interface McpUserProfile {
    providerUserId: string | null;
    externalUserId: string | null;
    nickname: string;
    email: string | null;
    profileImage: string | null;
}
export type McpCallbackErrorCode =
    | 'missing_required_params'
    | 'missing_oauth_artifacts'
    | 'invalid_oauth_state'
    | 'expired_oauth_state'
    | 'token_exchange_failed'
    | 'missing_provider_user_id'
    | 'user_sync_failed'
    | 'missing_oauth_profile'
    | 'oauth_callback_error'
    | 'network_error'
    | 'configuration_error'
    | 'unauthorized_client'
    | 'access_denied'
    | 'unsupported_response_type'
    | 'invalid_scope'
    | 'server_error'
    | 'temporarily_unavailable';

export const MCP_CALLBACK_ERROR_MESSAGES: Record<McpCallbackErrorCode, string> = {
    missing_required_params: 'Required parameters are missing.',
    missing_oauth_artifacts: 'OAuth session artifacts not found.',
    invalid_oauth_state: 'State validation failed.',
    expired_oauth_state: 'The login session has expired.',
    token_exchange_failed: 'Failed to exchange the authorization code.',
    missing_provider_user_id: 'Provider user ID could not be resolved.',
    user_sync_failed: 'Failed to synchronize user data.',
    missing_oauth_profile: 'Could not fetch the user profile.',
    oauth_callback_error: 'An unexpected error occurred during callback.',
    network_error: 'A network error occurred while communicating with the provider.',
    configuration_error: 'Auth client is not properly configured.',
    unauthorized_client: 'The client is not authorized for this request.',
    access_denied: 'Access was denied by the user or provider.',
    unsupported_response_type: 'The authorization server does not support this response type.',
    invalid_scope: 'Requested scope is invalid or exceeding limits.',
    server_error: 'The authorization server encountered an internal error.',
    temporarily_unavailable: 'The authorization server is temporarily unavailable.',
};

const MCP_OAUTH_COOKIE_TTL_SECONDS = 10 * 60;
const MCP_OAUTH_COOKIE_WARNING_THRESHOLD_SECONDS = 30;

export interface McpStoredArtifacts {
    state: string;
    codeVerifier: string;
    stateIssuedAt?: number;
}

interface McpStoredStatePayload {
    value: string;
    issuedAt: number;
}

function parseMcpArtifact(rawState: string | null): { state: string; stateIssuedAt?: number } | null {
    if (!rawState) return null;

    try {
        const parsed = JSON.parse(rawState) as Partial<McpStoredStatePayload>;
        if (typeof parsed?.value === 'string' && parsed.value.trim()) {
            const issuedAt = Number(parsed.issuedAt);
            return {
                state: parsed.value,
                ...(Number.isFinite(issuedAt) ? { stateIssuedAt: issuedAt } : {}),
            };
        }
    } catch {
        // backward compatible plain state value
    }

    return { state: rawState };
}

function randomIntegerFromCrypto(max: number): number {
    if (typeof crypto === 'undefined') {
        return Math.floor(Math.random() * max);
    }

    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
}

function generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let value = '';

    for (let i = 0; i < length; i += 1) {
        value += charset[randomIntegerFromCrypto(charset.length)];
    }

    return value;
}

function toBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let string = '';

    for (let i = 0; i < bytes.length; i++) {
        string += String.fromCharCode(bytes[i]);
    }

    if (typeof btoa === 'function') {
        return btoa(string).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    return Buffer.from(string, 'binary').toString('base64url');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return toBase64Url(hash);
}

function setBrowserCookie(name: string, value: string, maxAgeSeconds: number): void {
    if (typeof document === 'undefined') return;

    const flags = [
        `path=/`,
        `max-age=${maxAgeSeconds}`,
        `SameSite=Lax`,
    ];

    if (ENV.IS_PROD) {
        flags.push('Secure');
    }

    document.cookie = `${name}=${encodeURIComponent(value)}; ${flags.join('; ')}`;
}

function logCookieTTL(name: string, maxAgeSeconds: number, requestId?: string): void {
    if (maxAgeSeconds <= MCP_OAUTH_COOKIE_WARNING_THRESHOLD_SECONDS) {
        const prefix = requestId ? `[MCP:${requestId}]` : '[MCP]';
        console.warn(
            `${prefix} Low OAuth cookie TTL for ${name}: ${maxAgeSeconds}s. Please complete login quickly.`
        );
    }
}

export function parseCookieHeader(cookieHeader: string, name: string): string | null {
    const prefix = `${name}=`;
    const match = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((item) => item.startsWith(prefix));

    if (!match) return null;

    const rawValue = match.substring(prefix.length);

    try {
        return decodeURIComponent(rawValue);
    } catch {
        return rawValue;
    }
}

function getBrowserCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    return parseCookieHeader(document.cookie, name);
}

function clearBrowserCookies(names: string[]): void {
    if (typeof document === 'undefined') return;

    names.forEach((name) => {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    });
}

export function consumeMcpArtifacts(): McpStoredArtifacts | null {
    const state = getBrowserCookie(STORAGE_KEYS.MCP_STATE);
    const codeVerifier = getBrowserCookie(STORAGE_KEYS.MCP_CODE_VERIFIER);

    if (!state || !codeVerifier) return null;
    const parsedState = parseMcpArtifact(state);
    if (!parsedState) return null;

    clearBrowserCookies([
        STORAGE_KEYS.MCP_STATE,
        STORAGE_KEYS.MCP_CODE_VERIFIER,
    ]);

    return {
        state: parsedState.state,
        codeVerifier,
        ...(parsedState.stateIssuedAt ? { stateIssuedAt: parsedState.stateIssuedAt } : {}),
    };
}

export function getMcpArtifactsFromCookieHeader(cookieHeader: string): McpStoredArtifacts | null {
    const state = parseCookieHeader(cookieHeader, STORAGE_KEYS.MCP_STATE);
    const codeVerifier = parseCookieHeader(cookieHeader, STORAGE_KEYS.MCP_CODE_VERIFIER);

    if (!state || !codeVerifier) return null;

    const parsedState = parseMcpArtifact(state);
    if (!parsedState) return null;

    return {
        state: parsedState.state,
        codeVerifier,
        ...(parsedState.stateIssuedAt ? { stateIssuedAt: parsedState.stateIssuedAt } : {}),
    };
}

export function initiateMcpLogin(): void {
    const requestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    if (isMockMode()) {
        console.log('[MOCK] MCP OAuth flow bypassed');
        document.cookie = `${STORAGE_KEYS.USER_DATA}=${encodeURIComponent(
            JSON.stringify({ id: 999999, nickname: 'MCP Mock', provider: 'mcp' })
        )}; path=/; max-age=86400`;
        window.location.href = '/dashboard';
        return;
    }

    if (!MCP_CONFIG.isConfigured) {
        console.error('[MCP] Missing configuration:', MCP_CONFIG.error);
        alert('MCP OAuth is not configured.');
        return;
    }

    const codeVerifier = generateRandomString(128);
    const state = generateRandomString(128); // Increased entropy for state (BE-11)
    const statePayload = JSON.stringify({
        value: state,
        issuedAt: Date.now(),
    });

    const codeChallenge = generateCodeChallenge(codeVerifier);

    codeChallenge
        .then((challenge) => {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('mcp_code_verifier', codeVerifier);
                sessionStorage.setItem('mcp_oauth_state', state);
            }

            const maxAge = MCP_OAUTH_COOKIE_TTL_SECONDS;
            setBrowserCookie(
                STORAGE_KEYS.MCP_STATE,
                statePayload,
                maxAge
            );
            setBrowserCookie(STORAGE_KEYS.MCP_CODE_VERIFIER, codeVerifier, maxAge);
            logCookieTTL(STORAGE_KEYS.MCP_STATE, maxAge, requestId);
            logCookieTTL(STORAGE_KEYS.MCP_CODE_VERIFIER, maxAge, requestId);

            const params = new URLSearchParams({
                client_id: MCP_CONFIG.CLIENT_ID,
                redirect_uri: MCP_CONFIG.REDIRECT_URI,
                response_type: 'code',
                scope: MCP_CONFIG.SCOPE,
                code_challenge: challenge,
                code_challenge_method: 'S256',
                state,
            });

            window.location.href = `${MCP_CONFIG.AUTH_URL}?${params.toString()}`;
        })
        .catch((error) => {
            console.error('[MCP] Failed to start login:', error);
            alert('Failed to start MCP login.');
        });
}

export async function exchangeMcpCodeForToken(
    code: string,
    codeVerifier: string
): Promise<McpTokenResponse | null> {
    if (isMockMode()) {
        return {
            access_token: 'mock_mcp_access_token',
            refresh_token: 'mock_mcp_refresh_token',
            token_type: 'Bearer',
            expires_in: 3600,
        };
    }

    try {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: MCP_CONFIG.CLIENT_ID,
            redirect_uri: MCP_CONFIG.REDIRECT_URI,
            code,
            code_verifier: codeVerifier,
        });

        if (MCP_CONFIG.CLIENT_SECRET) {
            body.set('client_secret', MCP_CONFIG.CLIENT_SECRET);
        }

        const response = await fetch(MCP_CONFIG.TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Token exchange failed (${response.status}): ${responseText}`);
        }

        return (await response.json()) as McpTokenResponse;
    } catch (error) {
        console.error('[MCP] Token exchange error:', error);
        return null;
    }
}

export async function refreshMcpToken(refreshToken: string): Promise<McpTokenResponse | null> {
    if (isMockMode()) {
        return {
            access_token: 'mock_mcp_access_token_refreshed',
            refresh_token: refreshToken || 'mock_mcp_refresh_token',
            token_type: 'Bearer',
            expires_in: 3600,
        };
    }

    try {
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: MCP_CONFIG.CLIENT_ID,
            refresh_token: refreshToken,
        });

        if (MCP_CONFIG.CLIENT_SECRET) {
            body.set('client_secret', MCP_CONFIG.CLIENT_SECRET);
        }

        const response = await fetch(MCP_CONFIG.TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Token refresh failed (${response.status}): ${responseText}`);
        }

        return (await response.json()) as McpTokenResponse;
    } catch (error) {
        console.error('[MCP] Token refresh error:', error);
        return null;
    }
}

const MCP_PROVIDER_ID_FIELDS = [
    'sub',
    'id',
    'user_id',
    'external_user_id',
    'external_id',
    'externalId',
    'provider_id',
    'providerUserId',
    'provider_user_id',
    'providerSubject',
    'provider_subject',
    'uid',
    'kakao_id',
] as const;

function parseUserId(raw: unknown): { externalUserId: string | null; providerUserId: string | null } {
    // MCP 사용자 ID 파싱 정책:
    // 1) 문자열/숫자: 그대로 문자열로 사용
    // 2) 객체: data/profile/sub/id/user_id/external/provider 계열 키를 우선순위대로 탐색
    // 3) 최종 실패 시 null 반환(필수 ID 유실 시 missing_provider_user_id 처리)
    if (raw === null || raw === undefined) {
        return { externalUserId: null, providerUserId: null };
    }

    if (typeof raw === 'string' && raw.trim()) {
        const normalized = raw.trim();
        return { externalUserId: normalized, providerUserId: normalized };
    }

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        const normalized = String(raw);
        return { externalUserId: normalized, providerUserId: normalized };
    }

    if (typeof raw === 'bigint') {
        const normalized = String(raw);
        return { externalUserId: normalized, providerUserId: normalized };
    }

    if (typeof raw === 'object' && raw !== null) {
        const source = raw as Record<string, unknown>;
        const dataNested = source.data && typeof source.data === 'object' && source.data !== null
            ? (source.data as Record<string, unknown>)
            : undefined;
        const nestedFromData = dataNested
            ? parseUserId({
                sub: dataNested.sub,
                id: dataNested.id,
                user_id: dataNested.user_id,
                external_id: dataNested.external_id,
                externalId: dataNested.externalId,
                provider_id: dataNested.provider_id,
                providerUserId: dataNested.providerUserId,
                provider_user_id: dataNested.provider_user_id,
            })
            : null;
        if (nestedFromData?.externalUserId) {
            return nestedFromData;
        }

        const explicitExternal = source.externalUserId ?? source.external_user_id;
        if (explicitExternal) {
            const explicitParsed = parseUserId(explicitExternal);
            if (explicitParsed.externalUserId) {
                return explicitParsed;
            }
        }

        const profileNested = typeof source.profile === 'object' && source.profile !== null
            ? (source.profile as Record<string, unknown>).sub
            : undefined;

        const nested =
            source.sub ??
            source.id ??
            source.user_id ??
            explicitExternal ??
            source.external_user_id ??
            source.external_id ??
            source.externalId ??
            source.provider_id ??
            source.providerUserId ??
            source.provider_user_id ??
            source.providerSubject ??
            source.provider_subject ??
            profileNested ??
            source.uid ??
            source.kakao_id;

        const nestedParsed = parseUserId(nested);
        if (nestedParsed.externalUserId) return nestedParsed;
    }

    return { externalUserId: null, providerUserId: null };
}

function normalizeMcpProfile(payload: Record<string, unknown>): McpUserProfile {
    const rawId =
        payload.sub ??
        payload.id ??
        payload.user_id ??
        payload.data ??
        payload.externalUserId ??
        payload.external_user_id ??
        payload.external_id ??
        payload.externalId ??
        payload.provider_id ??
        payload.providerUserId ??
        payload.provider_user_id ??
        payload.providerSubject ??
        payload.provider_subject ??
        payload.uid ??
        payload.kakao_id;

    function sanitizeString(input: string | null | undefined): string {
        if (!input) return '';
        // Remove HTML tags for XSS prevention (G-12)
        return input.replace(/<\/?[^>]+(>|$)/g, '').trim();
    }

    const parsed = parseUserId(rawId);

    const email = (payload.email as string | undefined) || (payload.preferred_username as string | undefined) || null;
    const rawNickname =
        (payload.nickname as string | undefined) ||
        (payload.name as string | undefined) ||
        (payload.preferred_username as string | undefined) ||
        (payload.login as string | undefined) ||
        (payload.display_name as string | undefined) ||
        'MCP User';

    const nickname = sanitizeString(rawNickname);

    const profileImage =
        (payload.picture as string | undefined) ||
        (payload.profile_image as string | undefined) ||
        (payload.avatar_url as string | undefined) ||
        null;

    return {
        providerUserId: parsed.providerUserId,
        externalUserId: parsed.externalUserId,
        nickname,
        email,
        profileImage,
    };
}

export async function getMcpUserProfile(accessToken: string): Promise<McpUserProfile | null> {
    if (isMockMode()) {
        return {
            providerUserId: '999999',
            externalUserId: '999999',
            nickname: 'MCP Mock',
            email: 'mock@mcp.example',
            profileImage: null,
        };
    }

    if (!MCP_CONFIG.USERINFO_URL) {
        console.warn('[MCP] USERINFO_URL is not configured');
        return null;
    }

    try {
        const response = await fetch(MCP_CONFIG.USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            return null;
        }

        const payload = (await response.json()) as Record<string, unknown>;
        return normalizeMcpProfile(payload);
    } catch (error) {
        console.error('[MCP] User info fetch error:', error);
        return null;
    }
}
